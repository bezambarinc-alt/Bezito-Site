import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, requirePrivileged } from '@/lib/auth'
import { sql } from '@/lib/db'
import { removeFromWhitelist } from '@/lib/whitelist'
import { audit } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — list all whitelisted IPs (active + expired, for visibility; privileged: viewers blocked)
export async function GET() {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const rows = await sql<{
    id: number
    ip_address: string
    label: string | null
    expires_at: string
    created_at: string
    expired: boolean
  }>(
    `SELECT id, ip_address, label, expires_at::text, created_at::text,
            (expires_at <= now()) AS expired
     FROM whitelisted_ips
     ORDER BY expires_at DESC`,
  )
  return NextResponse.json(rows)
}

// POST — manually add an IP to the whitelist (privileged: viewers blocked)
export async function POST(req: NextRequest) {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const schema = z.object({
    ip:    z.string().min(3).max(64),
    label: z.string().max(120).optional(),
    days:  z.number().int().min(1).max(365).optional().default(30),
  })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  }
  const { ip, label, days } = parsed.data

  // Parameterized interval — days is a validated integer
  await sql(
    `INSERT INTO whitelisted_ips (ip_address, label, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)
     ON CONFLICT (ip_address) DO UPDATE
       SET expires_at = now() + ($3 || ' days')::interval,
           label      = COALESCE($2, whitelisted_ips.label)`,
    [ip, label ?? null, String(days)],
  )
  await audit('auth.whitelist.added', session.sub as string, { ip, label, days, manual: true })
  return NextResponse.json({ ok: true })
}

// DELETE — revoke an IP (privileged: viewers blocked)
export async function DELETE(req: NextRequest) {
  const session = await requirePrivileged()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ ip: z.string().min(3).max(64) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })

  await removeFromWhitelist(parsed.data.ip)
  await audit('auth.whitelist.removed', session.sub as string, { ip: parsed.data.ip })
  return NextResponse.json({ ok: true })
}
