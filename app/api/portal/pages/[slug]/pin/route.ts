import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'node:crypto'
import { sql } from '@/lib/db'
import { getClientSession } from '@/lib/client-auth'
import { audit } from '@/lib/audit'

type Ctx = { params: Promise<{ slug: string }> }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // Verify page belongs to this client
  const [page] = await sql<{ id: number }>(
    `SELECT id FROM pages WHERE slug = $1 AND client_id = $2 LIMIT 1`,
    [slug, session.clientId],
  )
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Crypto-random 4-digit PIN
  const pin = randomInt(1000, 9999).toString().padStart(4, '0')
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  await sql(
    `UPDATE pages SET customer_pin = $1, pin_expires_at = $2 WHERE slug = $3`,
    [pin, expires, slug],
  )

  await audit('portal.pin.generated', session.sub, { slug, clientId: session.clientId })

  return NextResponse.json({ pin, expires })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  const [page] = await sql<{ id: number }>(
    `SELECT id FROM pages WHERE slug = $1 AND client_id = $2 LIMIT 1`,
    [slug, session.clientId],
  )
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await sql(
    `UPDATE pages SET customer_pin = NULL, pin_expires_at = NULL WHERE slug = $1`,
    [slug],
  )

  await audit('portal.pin.revoked', session.sub, { slug, clientId: session.clientId })

  return NextResponse.json({ ok: true })
}
