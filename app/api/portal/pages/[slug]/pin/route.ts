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

  // Crypto-random 4-digit PIN
  const pin = randomInt(1000, 9999).toString().padStart(4, '0')
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  // Ownership is enforced by the UPDATE's own WHERE, not by a preceding SELECT.
  // The old shape was a SELECT that checked `slug AND client_id` followed by an
  // UPDATE that keyed on `slug` alone — so a page reassigned to another client
  // between the two statements got its PIN overwritten by the previous owner.
  // Zero rows back means "not yours or not there", which is the same 404 either
  // way; distinguishing them would leak the existence of other clients' slugs.
  const updated = await sql<{ id: number }>(
    `UPDATE pages SET customer_pin = $1, pin_expires_at = $2
      WHERE slug = $3 AND client_id = $4
      RETURNING id`,
    [pin, expires, slug, session.clientId],
  )
  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await audit('portal.pin.generated', session.sub, { slug, clientId: session.clientId })

  return NextResponse.json({ pin, expires })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // Same single-statement ownership check as POST — see the comment there.
  const updated = await sql<{ id: number }>(
    `UPDATE pages SET customer_pin = NULL, pin_expires_at = NULL
      WHERE slug = $1 AND client_id = $2
      RETURNING id`,
    [slug, session.clientId],
  )
  if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await audit('portal.pin.revoked', session.sub, { slug, clientId: session.clientId })

  return NextResponse.json({ ok: true })
}
