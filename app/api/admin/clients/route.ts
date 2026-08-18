import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { audit } from '@/lib/audit'

const createSchema = z.object({
  name:          z.string().min(1).max(100),
  slug:          z.string().regex(/^[a-z0-9-]+$/).min(1).max(64),
  contact_email: z.string().email().max(254),
  password:      z.string().min(8).max(128),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await sql<{
    id: number; slug: string; name: string; contact_email: string;
    active: boolean; page_count: number; created_at: string;
  }>(
    `SELECT c.id, c.slug, c.name, c.contact_email, c.active, c.created_at,
            COUNT(p.id)::int AS page_count
     FROM clients c
     LEFT JOIN pages p ON p.client_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
  )

  return NextResponse.json({ clients })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const idempotencyKey = req.headers.get('idempotency-key') || null

  // Idempotency check — return existing client if this key was already processed
  if (idempotencyKey) {
    const [existing] = await sql<{ id: number; slug: string }>(
      `SELECT id, slug FROM clients WHERE idempotency_key = $1`,
      [idempotencyKey],
    )
    if (existing) {
      return NextResponse.json({ ok: true, id: existing.id, idempotent: true })
    }
  }

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug, contact_email, password } = parsed.data
  const password_hash = await hash(password, 10)

  try {
    const [client] = await sql<{ id: number }>(
      `INSERT INTO clients (slug, name, contact_email, password_hash, idempotency_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [slug, name, contact_email, password_hash, idempotencyKey],
    )

    const actor = session?.sub ?? 'bezito-agent'
    await audit('admin.client.created', actor, { clientId: client.id, slug, name })

    return NextResponse.json({ ok: true, id: client.id }, { status: 201 })
  } catch (e) {
    const msg = (e as Error).message ?? ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Client slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
