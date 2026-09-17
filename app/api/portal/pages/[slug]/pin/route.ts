import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getClientSession } from '@/lib/client-auth'
import { audit } from '@/lib/audit'

type Ctx = { params: Promise<{ slug: string }> }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // Crypto-random 4-digit PIN. randomInt's upper bound is exclusive and the old
  // range was (1000, 9999) — which never emitted 9999 and never emitted a
  // leading zero, making the padStart dead and shrinking the space from 10000
  // to 8998. Full range now; padStart is what actually does the work.
  const pin = randomInt(0, 10000).toString().padStart(4, '0')
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  // Stored hashed. The plaintext is returned exactly once, in this response —
  // after that only the holder of the code has it. Nothing reads the column
  // back for display any more; the UIs show "active until <date>" and offer a
  // regenerate. A 4-digit secret is small enough to brute-force offline, so the
  // real defences are the rate limiter on verify-pin and the 48h expiry — the
  // hash just stops a DB dump from being a list of live access codes.
  const pinHash = await bcrypt.hash(pin, 10)

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
    [pinHash, expires, slug, session.clientId],
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
