import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, requirePrivileged } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'
import { audit } from '@/lib/audit'

// GET — list all admin users (privileged: viewers blocked)
export async function GET() {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const users = await sql<{ id: number; email: string; role: string; created_at: string }>(
    `SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC`,
  )
  return NextResponse.json(users)
}

// POST — add a new admin user (privileged: viewers blocked)
export async function POST(req: NextRequest) {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const schema = z.object({
    email:    z.string().email().max(254),
    password: z.string().min(8).max(256),
    role:     z.enum(['admin', 'viewer']).optional().default('admin'),
  })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }
  const { email, password, role } = parsed.data

  const passwordHash = await hash(String(password), 12)
  try {
    const [user] = await sql<{ id: number }>(
      `INSERT INTO admin_users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [email, passwordHash, role],
    )
    await audit('admin.user.created', session.sub as string, { email, role })
    return NextResponse.json({ ok: true, id: user.id })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 })
    }
    throw e
  }
}

// DELETE — remove a user (cannot delete the last one; privileged: viewers blocked)
export async function DELETE(req: NextRequest) {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed2 = z.object({ id: z.number().int().positive() }).safeParse(await req.json().catch(() => null))
  if (!parsed2.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  const { id } = parsed2.data

  const [{ count }] = await sql<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM admin_users`,
  )
  if (parseInt(count) <= 1) {
    return NextResponse.json({ error: 'cannot remove the last admin user' }, { status: 400 })
  }

  const [deleted] = await sql<{ email: string }>(`DELETE FROM admin_users WHERE id = $1 RETURNING email`, [id])
  await audit('admin.user.deleted', session.sub as string, { id, email: deleted?.email })
  return NextResponse.json({ ok: true })
}
