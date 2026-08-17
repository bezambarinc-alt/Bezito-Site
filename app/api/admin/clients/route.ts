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
  const agentOk = isAuthorizedAgent(req)
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
  const agentOk = isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug, contact_email, password } = parsed.data
  const password_hash = await hash(password, 10)

  const [client] = await sql<{ id: number }>(
    `INSERT INTO clients (slug, name, contact_email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [slug, name, contact_email, password_hash],
  )

  const actor = session?.sub ?? 'bezito-agent'
  await audit('admin.client.created', actor, { clientId: client.id, slug, name })

  return NextResponse.json({ ok: true, id: client.id }, { status: 201 })
}
