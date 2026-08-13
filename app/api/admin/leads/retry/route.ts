import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { audit } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FRESHSALES_URL = 'https://bezambar.myfreshworks.com/crm/sales/api/contacts'

// POST — re-attempt Freshsales sync for a failed/pending lead
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ id: z.number().int().positive() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })

  const [lead] = await sql<{
    id: number; name: string | null; email: string; sku: string | null; intent: string | null
  }>(
    `SELECT id, name, email, sku, intent FROM leads WHERE id = $1 LIMIT 1`,
    [parsed.data.id],
  )
  if (!lead) return NextResponse.json({ error: 'lead not found' }, { status: 404 })

  const key = process.env.FRESHSALES_API_KEY
  if (!key) return NextResponse.json({ error: 'CRM not configured' }, { status: 500 })

  try {
    const crm = await fetch(FRESHSALES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          first_name: lead.name,
          email: lead.email,
          custom_field: { source: lead.sku ?? 'site', intent: lead.intent ?? 'site' },
        },
      }),
    })
    if (crm.ok) {
      const { contact } = await crm.json() as { contact: { id: number } }
      await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [String(contact?.id ?? ''), lead.id])
      await audit('admin.lead.retry.success' as never, session.sub as string, { id: lead.id, email: lead.email })
      return NextResponse.json({ ok: true, status: 'synced' })
    }
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    await audit('admin.lead.retry.failed' as never, session.sub as string, { id: lead.id, email: lead.email, http: crm.status })
    return NextResponse.json({ ok: false, status: 'failed' }, { status: 502 })
  } catch {
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    return NextResponse.json({ ok: false, status: 'failed' }, { status: 502 })
  }
}
