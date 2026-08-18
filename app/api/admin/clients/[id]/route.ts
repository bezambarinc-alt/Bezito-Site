import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { audit } from '@/lib/audit'

type Ctx = { params: Promise<{ id: string }> }

const patchSchema = z.object({
  name:          z.string().min(1).max(100).optional(),
  contact_email: z.string().email().max(254).optional(),
  active:        z.boolean().optional(),
  password:      z.string().min(8).max(128).optional(),
})

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [client] = await sql<{ id: number; slug: string; name: string; contact_email: string; active: boolean; created_at: string }>(
    `SELECT id, slug, name, contact_email, active, created_at FROM clients WHERE id = $1`,
    [Number(id)],
  )
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ client })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, contact_email, active, password } = parsed.data
  const updates: string[] = ['updated_at = now()']
  const values: unknown[] = []
  let i = 1

  if (name          !== undefined) { updates.push(`name = $${i++}`);          values.push(name) }
  if (contact_email !== undefined) { updates.push(`contact_email = $${i++}`); values.push(contact_email) }
  if (active        !== undefined) { updates.push(`active = $${i++}`);        values.push(active) }
  if (password      !== undefined) {
    updates.push(`password_hash = $${i++}`)
    values.push(await hash(password, 10))
  }

  values.push(Number(id))
  await sql(`UPDATE clients SET ${updates.join(', ')} WHERE id = $${i}`, values)

  const actor = session?.sub ?? 'bezito-agent'
  await audit('admin.client.updated', actor, { clientId: Number(id), fields: Object.keys(parsed.data) })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // Soft-delete only
  await sql(`UPDATE clients SET active = false, updated_at = now() WHERE id = $1`, [Number(id)])

  const actor = session?.sub ?? 'bezito-agent'
  await audit('admin.client.deactivated', actor, { clientId: Number(id) })

  return NextResponse.json({ ok: true })
}
