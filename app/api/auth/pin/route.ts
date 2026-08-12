import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { compare } from 'bcryptjs'
import { sql } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (!pin) return NextResponse.json({ error: 'invalid pin' }, { status: 401 })

  const [setting] = await sql<{ value: string }>(
    `SELECT value FROM admin_settings WHERE key = 'admin_pin' LIMIT 1`,
  )

  if (!setting || !(await compare(String(pin), setting.value))) {
    return NextResponse.json({ error: 'invalid pin' }, { status: 401 })
  }

  const token = await new SignJWT({ role: 'admin', sub: 'pin-access', method: 'pin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return res
}
