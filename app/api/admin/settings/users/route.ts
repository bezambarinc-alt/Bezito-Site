import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

// GET — list all admin users
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const users = await sql<{ id: number; email: string; role: string; created_at: string }>(
    `SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC`,
  )
  return NextResponse.json(users)
}

// POST — add a new admin user
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { email, password, role = 'admin' } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const passwordHash = await hash(password, 12)
  try {
    const [user] = await sql<{ id: number }>(
      `INSERT INTO admin_users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [email, passwordHash, role],
    )
    return NextResponse.json({ ok: true, id: user.id })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 })
    }
    throw e
  }
}

// DELETE — remove a user (cannot delete the last one)
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const [{ count }] = await sql<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM admin_users`,
  )
  if (parseInt(count) <= 1) {
    return NextResponse.json({ error: 'cannot remove the last admin user' }, { status: 400 })
  }

  await sql(`DELETE FROM admin_users WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
