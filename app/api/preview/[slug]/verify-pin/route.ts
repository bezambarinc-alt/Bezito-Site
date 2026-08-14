import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { getGeo } from '@/lib/geo'

type Ctx = { params: Promise<{ slug: string }> }

const schema = z.object({
  pin: z.string().regex(/^\d{4}$/),
})

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

  const valid =
    page?.customer_pin === pin &&
    page?.pin_expires_at !== null &&
    new Date(page.pin_expires_at) > new Date()

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
