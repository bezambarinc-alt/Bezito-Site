import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const SESSION_TTL = 60 * 60 * 2 // 2h — external/untrusted (email+password)

const schema = z.object({
  email:    z.string().email().max(254),
  password: z.string().min(1).max(256),
})

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)

  // Rate limit
  const { allowed, remaining } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }

  // Validate input
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    await recordAttempt(ip, false)
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const { email, password } = parsed.data

  const [user] = await sql<{ id: number; password_hash: string; role: string }>(
    `SELECT id, password_hash, role FROM admin_users WHERE email = $1 LIMIT 1`,
    [email],
  )

  const ok: boolean = user ? await compare(password, user.password_hash) : false

  await recordAttempt(ip, ok)
  await audit(
    ok ? 'auth.login.success' : 'auth.login.failed',
    email,
    { ip, remaining: ok ? undefined : remaining - 1 },
  )

  if (!ok || !user) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ role: user.role, sub: email, method: 'password' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(JWT_SECRET)

  const res = NextResponse.json({ ok: true, role: user.role })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL,
  })
  return res
}
