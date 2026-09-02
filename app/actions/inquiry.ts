'use server'

import { z } from 'zod'
import { sql } from '@/lib/db'
import { INQUIRY_INTENTS } from '@/lib/data/inquiry-constants'
import { getZohoToken, invalidateZohoToken, parseZohoName } from '@/lib/zoho-auth'

// Lead_Source must be a valid Zoho CRM picklist display_value.
// Verify this matches your org's picklist: Zoho CRM → Leads → Fields → Lead Source.
const ZOHO_LEAD_SOURCE = 'Web Site'

// Service intents → Zoho Desk tickets (not CRM Leads).
// These are post-sale requests, not sales prospects.
const SERVICE_INTENTS = new Set<string>([
  'Repair & Cleaning',
  'Ring Resizing',
  'Ring Sizing Appointment',
])

const ZOHO_DESK_DEPT_ID = '1432890000000006907'

// Cached at module scope — discovered once per cold start, never expires.
let _deskOrgId: string | null = null

async function getDeskOrgId(token: string): Promise<string | null> {
  if (_deskOrgId) return _deskOrgId
  try {
    const r = await fetch('https://desk.zoho.com/api/v1/organizations', {
      signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    const j = (await r.json()) as { data?: Array<{ id: string }> }
    _deskOrgId = String(j.data?.[0]?.id ?? '') || null
  } catch { /* non-fatal */ }
  return _deskOrgId
}

async function getDeskContactId(token: string, orgId: string, email: string, name: string): Promise<string | null> {
  const h = { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json', orgId }
  // Search first
  try {
    const sr = await fetch(`https://desk.zoho.com/api/v1/contacts/search?email=${encodeURIComponent(email)}`, {
      signal: AbortSignal.timeout(5000), headers: h,
    })
    const sj = (await sr.json()) as { data?: Array<{ id: string }> }
    if (sj.data?.[0]?.id) return String(sj.data[0].id)
  } catch { /* fall through to create */ }
  // Create if not found
  try {
    const lastName = name.includes(' ') ? name.split(' ').slice(1).join(' ') : name
    const firstName = name.includes(' ') ? name.split(' ')[0] : undefined
    const cr = await fetch('https://desk.zoho.com/api/v1/contacts', {
      method: 'POST', signal: AbortSignal.timeout(5000), headers: h,
      body: JSON.stringify({ email, lastName, ...(firstName ? { firstName } : {}) }),
    })
    const cj = (await cr.json()) as { id?: string }
    return cj.id ? String(cj.id) : null
  } catch { return null }
}

// Built from the single shared source of truth so the schema can never drift
// from the UI (this exact duplication caused a submission-breaking bug before).
const IntentSchema = z.enum(INQUIRY_INTENTS)

const InquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(180),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  intent: IntentSchema,
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  preferredDate: z.string().trim().max(40).optional().or(z.literal('')),
  sku: z.string().trim().max(60).optional().or(z.literal('')),
  pieceTitle: z.string().trim().max(200).optional().or(z.literal('')),
  pageSlug: z.string().trim().max(120).optional().or(z.literal('')),
})

export type InquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    intent: formData.get('intent'),
    message: formData.get('message'),
    preferredDate: formData.get('preferredDate'),
    sku: formData.get('sku'),
    pieceTitle: formData.get('pieceTitle'),
    pageSlug: formData.get('pageSlug'),
  }

  const parsed = InquirySchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors }
  }

  const d = parsed.data
  // SKU + intent now live in dedicated `leads.sku` / `leads.intent` columns —
  // no longer stuffed into the message text.
  const composedMessage = [
    d.pieceTitle ? `Piece: ${d.pieceTitle}` : null,
    d.preferredDate ? `Preferred date: ${d.preferredDate}` : null,
    d.phone ? `Phone: ${d.phone}` : null,
    d.message ? `${d.message}` : null,
  ]
    .filter(Boolean)
    .join('\n') || null

  // 1. Durable audit copy FIRST.
  let leadId: number | null = null
  try {
    const [lead] = await sql<{ id: number }>(
      `INSERT INTO leads(page_slug, sku, intent, name, email, message, crm_status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id`,
      [d.pageSlug || null, d.sku || null, d.intent, d.name, d.email, composedMessage],
    )
    leadId = lead?.id ?? null
  } catch {
    return { status: 'error', message: 'We could not record your inquiry. Please call the atelier.' }
  }

  // 2. Best-effort Zoho push — 5s timeout, never delays the success response.
  //    Service intents → Zoho Desk ticket. All others → Zoho CRM Lead.
  try {
    const token = await getZohoToken()
    const appUrl = process.env.APP_URL ?? 'https://bezambar-web2026.vercel.app'
    const pageUrl = d.pageSlug ? `${appUrl}/${d.pageSlug}` : undefined

    if (SERVICE_INTENTS.has(d.intent)) {
      // ── Zoho Desk ticket ──────────────────────────────────────────────────
      const orgId = await getDeskOrgId(token)
      if (!orgId) throw new Error('Desk orgId unavailable')

      const contactId = await getDeskContactId(token, orgId, d.email, d.name)
      if (!contactId) throw new Error('Desk contactId unavailable')

      const subject = `${d.intent} — ${d.name}`
      const descLines = [
        d.sku           ? `SKU: ${d.sku}`                     : null,
        d.pieceTitle    ? `Piece: ${d.pieceTitle}`             : null,
        d.preferredDate ? `Preferred date: ${d.preferredDate}` : null,
        d.phone         ? `Phone: ${d.phone}`                  : null,
        pageUrl         ? `Page: ${pageUrl}`                   : null,
        d.message       || null,
      ].filter(Boolean).join('\n')

      const desk = await fetch('https://desk.zoho.com/api/v1/tickets', {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
          orgId,
        },
        body: JSON.stringify({
          subject,
          departmentId: ZOHO_DESK_DEPT_ID,
          contactId,
          phone: d.phone || undefined,
          description: descLines,
        }),
      })

      const deskJson = (await desk.json()) as { id?: string; errorCode?: string }
      if (desk.status === 401) {
        invalidateZohoToken()
        if (leadId != null) await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
      } else if (deskJson.id && leadId != null) {
        await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [deskJson.id, leadId])
      } else if (leadId != null) {
        await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
      }
    } else {
      // ── Zoho CRM Lead ─────────────────────────────────────────────────────
      const nameFields = parseZohoName(d.name, d.email)
      // Description: human-readable summary for the sales team.
      // SKU is first so it's visible immediately in the CRM lead preview panel.
      const description = [
        d.sku           ? `SKU: ${d.sku}`                         : null,
        `How can we help: ${d.intent}`,
        d.pieceTitle    ? `Piece: ${d.pieceTitle}`                 : null,
        d.preferredDate ? `Preferred date: ${d.preferredDate}`     : null,
        d.phone         ? `Phone: ${d.phone}`                      : null,
        d.message       || null,
      ].filter(Boolean).join('\n')

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
            Email: d.email,
            Mobile: d.phone || undefined,
            Lead_Source: ZOHO_LEAD_SOURCE,
            Website: pageUrl,
            Description: description,
          }],
        }),
      })

      // Zoho returns 207 on per-record validation failure — crm.ok is true.
      // Must check data[0].status to distinguish success from silent rejection.
      const json = (await crm.json()) as {
        data: Array<{ code: string; status: string; details?: { id?: string } }>
      }
      const rec   = json.data?.[0]
      const crmId = rec?.details?.id

      if (crm.status === 401 && leadId != null) {
        invalidateZohoToken()
        await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
      } else if (crm.ok && rec?.status === 'success' && rec?.code === 'SUCCESS' && crmId && leadId != null) {
        await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [crmId, leadId])
      } else if (leadId != null) {
        await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
      }
    }
  } catch {
    if (leadId != null) await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
  }

  return { status: 'success', message: 'Thank you — the atelier will be in touch shortly.' }
}
