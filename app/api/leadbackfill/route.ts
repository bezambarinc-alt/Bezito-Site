import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * TEMP backfill — finds real leads stuck at crm_status='failed' (from the window
 * before FRESHSALES_API_KEY was set) and re-pushes them to Freshsales.
 *
 * GET  /api/leadbackfill            → DRY RUN: lists failed leads, no writes
 * GET  /api/leadbackfill?apply=1    → re-pushes each failed lead, updates status
 *
 * DELETE this route after use.
 */
export const dynamic = 'force-dynamic'

const FRESHSALES_URL = 'https://bezambar.myfreshworks.com/crm/sales/api/contacts'

export async function GET(req: Request) {
  const apply = new URL(req.url).searchParams.get('apply') === '1'
  const key = process.env.FRESHSALES_API_KEY

  const failed = await sql<{
    id: number
    name: string | null
    email: string
    sku: string | null
    intent: string | null
    page_slug: string | null
    created_at: string
  }>(
    `SELECT id, name, email, sku, intent, page_slug, created_at
       FROM leads
      WHERE crm_status = 'failed'
      ORDER BY created_at ASC`,
  )

  if (!apply) {
    return NextResponse.json({
      dryRun: true,
      freshsalesKeyPresent: Boolean(key),
      failedCount: failed.length,
      failed,
    })
  }

  if (!key) {
    return NextResponse.json({ error: 'FRESHSALES_API_KEY missing at runtime' }, { status: 500 })
  }

  const results: { id: number; email: string; outcome: string; crmId?: string }[] = []
  for (const lead of failed) {
    try {
      const crm = await fetch(FRESHSALES_URL, {
        method: 'POST',
        headers: { Authorization: `Token token=${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: {
            first_name: lead.name ?? undefined,
            email: lead.email,
            custom_field: {
              source: lead.sku ?? lead.page_slug ?? 'site',
              intent: lead.intent ?? 'site',
            },
          },
        }),
      })
      if (crm.ok) {
        const body = (await crm.json()) as { contact?: { id?: number } }
        const crmId = String(body.contact?.id ?? '')
        await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [crmId, lead.id])
        results.push({ id: lead.id, email: lead.email, outcome: 'synced', crmId })
      } else {
        const text = await crm.text()
        results.push({ id: lead.id, email: lead.email, outcome: `failed ${crm.status}: ${text.slice(0, 120)}` })
      }
    } catch (e) {
      results.push({ id: lead.id, email: lead.email, outcome: `error ${String((e as Error)?.message ?? e)}` })
    }
  }

  const synced = results.filter(r => r.outcome === 'synced').length
  return NextResponse.json({ applied: true, total: failed.length, synced, results })
}
