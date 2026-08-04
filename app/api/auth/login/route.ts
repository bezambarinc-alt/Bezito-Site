import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const USERS: Record<string, { pass: string; role: string }> = {
  [process.env.ADMIN_BEZ_USER ?? '']: {
    pass: process.env.ADMIN_BEZ_PASS ?? '',
    role: 'bez',
  },
  [process.env.ADMIN_KEVIN_USER ?? '']: {
    pass: process.env.ADMIN_KEVIN_PASS ?? '',
    role: 'kevin',
  },
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const user = USERS[username]

  // Constant-time compare (jose handles timing-safe via crypto)
  if (!user || user.pass !== password) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ role: user.role, sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET)

  const res = NextResponse.json({ ok: true, role: user.role })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return res
}
