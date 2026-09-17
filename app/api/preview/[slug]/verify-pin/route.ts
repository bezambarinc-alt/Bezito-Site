import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { getGeo } from '@/lib/geo'

type Ctx = { params: Promise<{ slug: string }> }

const schema = z.object({
  pin: z.string().regex(/^\d{4}$/),
})

// Cost-10 hash of a value no PIN can ever be (PINs are exactly 4 digits), used
// only to burn the same ~100ms bcrypt.compare costs on a real one.
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

export async function POST(req: NextRequest, { params }: Ctx) {
  const geo = getGeo(req)
  const ip = geo.ip

  // Rate limit PIN attempts (public endpoint — same limits as login)
  const { allowed } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    await recordAttempt(ip, false)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { slug } = await params
  const { pin } = parsed.data

  const [page] = await sql<{ customer_pin: string | null; pin_expires_at: string | null }>(
    `SELECT customer_pin, pin_expires_at
     FROM pages
     WHERE slug = $1 AND doc_type = 'showcase' AND status = 'live'
     LIMIT 1`,
    [slug],
  )

  // customer_pin holds a bcrypt hash — see the POST in
  // app/api/portal/pages/[slug]/pin/route.ts. Compare against a dummy hash when
  // the page or the PIN is missing so a wrong slug and a wrong code take the
  // same time; otherwise the 401 doubles as an oracle for which slugs are gated.
  const unusable = page?.customer_pin == null
  const matches = await bcrypt.compare(pin, unusable ? DUMMY_HASH : page!.customer_pin!)

  const valid =
    !unusable &&
    matches &&
    page!.pin_expires_at !== null &&
    new Date(page!.pin_expires_at!) > new Date()

  await recordAttempt(ip, valid)

  if (!valid) {
    // Generic — don't reveal whether page exists, PIN exists, or PIN expired
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
  }

  // Grant access: set preview cookie scoped to this slug path
  const res = NextResponse.json({ ok: true })
  res.cookies.set(`ba_preview_${slug}`, '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: `/preview/${slug}`,
    maxAge: 60 * 60 * 24, // 24h
  })
  return res
}
