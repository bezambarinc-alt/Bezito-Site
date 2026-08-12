import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const SESSION_TTL = 60 * 60 * 8 // 8h — whitelisted/trusted (PIN)

const schema = z.object({
  pin: z.string().min(4).max(20),
})

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)

  const { allowed } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    await recordAttempt(ip, false)
    return NextResponse.json({ error: 'invalid pin' }, { status: 401 })
  }

  const [setting] = await sql<{ value: string }>(
    `SELECT value FROM admin_settings WHERE key = 'admin_pin' LIMIT 1`,
  )

  const ok = setting ? await compare(parsed.data.pin, setting.value) : false

  await recordAttempt(ip, ok)
  await audit(
    ok ? 'auth.pin.success' : 'auth.pin.failed',
    'pin',
    { ip },
  )

  if (!ok) return NextResponse.json({ error: 'invalid pin' }, { status: 401 })

  const token = await new SignJWT({ role: 'admin', sub: 'pin-access', method: 'pin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(JWT_SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL,
  })
  return res
}
