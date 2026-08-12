import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { sql } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const [user] = await sql<{ id: number; password_hash: string; role: string }>(
    `SELECT id, password_hash, role FROM admin_users WHERE email = $1 LIMIT 1`,
    [email],
  )

  // bcrypt.compare is inherently timing-safe
  if (!user || !(await compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const token = await new SignJWT({ role: user.role, sub: email, method: 'password' })
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
