import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { audit } from '@/lib/audit'
import { getZohoToken, invalidateZohoToken, parseZohoName } from '@/lib/zoho-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Lead_Source must be a valid Zoho CRM picklist display_value.
// Must match ZOHO_LEAD_SOURCE in lead/route.ts and actions/inquiry.ts.
const ZOHO_LEAD_SOURCE = 'Web Site'

// POST — re-attempt Zoho CRM sync for a failed/pending lead
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ id: z.number().int().positive() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })

  // Only retry leads that haven't been synced yet — prevents duplicate Zoho records.
  const [lead] = await sql<{
    id: number; name: string | null; email: string; sku: string | null; intent: string | null
  }>(
    `SELECT id, name, email, sku, intent FROM leads
     WHERE id = $1 AND crm_status IN ('failed', 'pending') LIMIT 1`,
    [parsed.data.id],
  )
  if (!lead) {
    // Either not found, or already synced — return success to avoid confusing the UI
    return NextResponse.json({ ok: true, status: 'already_synced_or_not_found' })
  }

  try {
    const token = await getZohoToken()
    const nameFields = parseZohoName(lead.name, lead.email)
    const description = [
      lead.intent ? `Intent: ${lead.intent}` : null,
      lead.sku    ? `Piece: ${lead.sku}`     : null,
    ].filter(Boolean).join('\n') || 'Website inquiry'

    const crm = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [{
          ...nameFields,
          Email: lead.email,
          Lead_Source: ZOHO_LEAD_SOURCE,
          Description: description,
        }],
      }),
    })

    // Zoho returns 207 on per-record validation failure — crm.ok is true.
    // Must check data[0].status to distinguish success from silent rejection.
    const json = await crm.json() as {
      data: Array<{ code: string; status: string; message?: string; details?: { id?: string } }>
    }
    const rec   = json.data?.[0]
    const crmId = rec?.details?.id

    if (crm.status === 401) {
      invalidateZohoToken()
      await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
      await audit('admin.lead.retry.failed', session.sub, { id: lead.id, email: lead.email, reason: 'token_invalid' })
      return NextResponse.json({ ok: false, status: 'failed', reason: 'token_invalid' }, { status: 502 })
    }

    if (crm.ok && rec?.status === 'success' && rec?.code === 'SUCCESS' && crmId) {
      await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [crmId, lead.id])
      await audit('admin.lead.retry.success', session.sub, { id: lead.id, email: lead.email })
      return NextResponse.json({ ok: true, status: 'synced' })
    }

    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    await audit('admin.lead.retry.failed', session.sub, {
      id: lead.id,
      email: lead.email,
      http: crm.status,
      code: rec?.code,
      message: rec?.message,
    })
    return NextResponse.json({ ok: false, status: 'failed', code: rec?.code }, { status: 502 })
  } catch (err) {
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    await audit('admin.lead.retry.failed', session.sub, { id: lead.id, email: lead.email, reason: String(err) })
    return NextResponse.json({ ok: false, status: 'failed' }, { status: 502 })
  }
}
