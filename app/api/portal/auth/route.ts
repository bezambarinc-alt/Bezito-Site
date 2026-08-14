import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'
import { createClientSession, destroyClientSession, getClientSession } from '@/lib/client-auth'
import { getGeo } from '@/lib/geo'

const schema = z.object({
  email:    z.string().email().max(254),
  password: z.string().min(1).max(256),
})

export async function POST(req: NextRequest) {
  const geo = getGeo(req)
  const ip = geo.ip

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
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const { email, password } = parsed.data

  const [client] = await sql<{ id: number; slug: string; name: string; password_hash: string; active: boolean }>(
    `SELECT id, slug, name, password_hash, active FROM clients WHERE contact_email = $1 LIMIT 1`,
    [email],
  )

  // Always run bcrypt — prevents timing side-channel that reveals whether email exists.
  // If no client found, compare against a dummy hash (result is always false).
  const DUMMY = '$2b$10$abcdefghijklmnopqrstuumZm1dBEsb4BV08BezAqRaXgj5e3YWwu'
  const hash = client?.active ? client.password_hash : DUMMY
  const bcryptOk = await compare(password, hash)
  const ok = !!(client?.active && bcryptOk)

  await recordAttempt(ip, ok)
  await audit(
    ok ? 'auth.client.login.success' : 'auth.client.login.failed',
    email,
    { ip, clientId: client?.id },
  )

  if (!ok || !client) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  await createClientSession({
    sub: email,
    clientId: client.id,
    clientSlug: client.slug,
    role: 'client',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getClientSession()
  if (session) {
    await audit('auth.client.logout', session.sub, { clientId: session.clientId })
  }
  await destroyClientSession()
  return NextResponse.json({ ok: true })
}
