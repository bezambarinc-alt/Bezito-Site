import 'server-only'

import { sql } from '@/lib/db'
import { getZohoToken, invalidateZohoToken, parseZohoName } from '@/lib/zoho-auth'

/**
 * lib/leads.ts — SINGLE SOURCE OF TRUTH for lead creation.
 *
 * Both the ContactForm/InquiryDrawer server action (app/actions/inquiry.ts) and
 * the REST route used by ArchiveModal + Newsletter (app/api/lead/route.ts)
 * funnel through createLead(). Previously each reimplemented the INSERT, the
 * Zoho routing, and the crm_status bookkeeping — ~150 duplicated lines that
 * drifted (the page_slug FK guard existed in one and not the other, which broke
 * the contact form). Keep all lead-creation logic here so it can never diverge.
 *
 * Flow:
 *   1. Write a durable audit copy to Neon FIRST (never lose a lead on CRM outage).
 *   2. Best-effort push to Zoho — 5s timeout, failures are recorded, never thrown:
 *        intent === 'newsletter'  → Campaigns subscribe + CRM Lead
 *        service intent           → Desk ticket
 *        everything else          → CRM Lead
 */

// Lead_Source must be a valid Zoho CRM picklist display_value.
// Verify against Zoho CRM → Leads → Fields → Lead Source.
const ZOHO_LEAD_SOURCE = 'Web Site'

// Service intents → Zoho Desk tickets (post-sale requests, not sales prospects).
const SERVICE_INTENTS = new Set<string>([
  'Repair & Cleaning',
  'Ring Resizing',
  'Ring Sizing Appointment',
])

const ZOHO_DESK_DEPT_ID = '1432890000000006907'

// Newsletter signups subscribe to Campaigns AND create a warm CRM Lead.
const ZOHO_CAMPAIGNS_NEWSLETTER_LISTKEY =
  '3zc7a4603e5b59b69537a9ed38ee7112ccbedb1f079c4f5b4db8ae03c2a22107c8'

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

async function getDeskContactId(
  token: string,
  orgId: string,
  email: string,
  name: string,
): Promise<string | null> {
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

async function subscribeToNewsletter(token: string, email: string, name?: string | null): Promise<void> {
  const contactInfo: Record<string, string> = { 'Contact Email': email }
  const trimmed = name?.trim()
  if (trimmed) {
    const parts = trimmed.split(' ')
    contactInfo['First Name'] = parts[0]
    if (parts.length > 1) contactInfo['Last Name'] = parts.slice(1).join(' ')
  }
  await fetch('https://campaigns.zoho.com/api/v1.1/json/listsubscribe', {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      listkey: ZOHO_CAMPAIGNS_NEWSLETTER_LISTKEY,
      contactinfo: JSON.stringify(contactInfo),
      resfmt: 'JSON',
    }),
  })
}

export interface LeadInput {
  name?: string | null
  email: string
  phone?: string | null
  intent?: string | null
  /** Free-text message from the visitor. */
  message?: string | null
  sku?: string | null
  pieceTitle?: string | null
  preferredDate?: string | null
  /** Raw site path the form was submitted from. Stored verbatim (no FK). */
  pageSlug?: string | null
}

export interface LeadResult {
  leadId: number
  crmStatus: 'synced' | 'failed' | 'pending'
}

/** Build the human-readable body stored in leads.message (intent lives in its own column). */
function buildStoredMessage(d: LeadInput): string | null {
  return [
    d.pieceTitle    ? `Piece: ${d.pieceTitle}`             : null,
    d.preferredDate ? `Preferred date: ${d.preferredDate}` : null,
    d.phone         ? `Phone: ${d.phone}`                  : null,
    d.message       ? `${d.message}`                       : null,
  ].filter(Boolean).join('\n') || null
}

/** Build the description sent to Zoho CRM / Desk. SKU first for at-a-glance CRM preview. */
function buildCrmDescription(d: LeadInput, pageUrl?: string): string {
  return [
    d.sku           ? `SKU: ${d.sku}`                       : null,
    d.intent        ? `How can we help: ${d.intent}`        : null,
    d.pieceTitle    ? `Piece: ${d.pieceTitle}`              : null,
    d.preferredDate ? `Preferred date: ${d.preferredDate}`  : null,
    d.phone         ? `Phone: ${d.phone}`                   : null,
    pageUrl         ? `Page: ${pageUrl}`                    : null,
    d.message       || null,
  ].filter(Boolean).join('\n') || 'Website inquiry'
}

/**
 * Create a lead: durable Neon audit row + best-effort Zoho sync.
 * Throws only if the Neon INSERT fails (the lead would otherwise be lost).
 * Zoho failures are recorded as crm_status='failed' and never thrown.
 */
export async function createLead(input: LeadInput): Promise<LeadResult> {
  const intent = input.intent ?? null
  const storedMessage = buildStoredMessage(input)

  // 1. Durable audit copy FIRST. page_slug is now plain TEXT (no FK) — store the
  //    raw submission path verbatim, including hardcoded routes and piece slugs.
  const [lead] = await sql<{ id: number }>(
    `INSERT INTO leads(page_slug, sku, intent, name, email, message, crm_status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id`,
    [input.pageSlug || null, input.sku || null, intent, input.name ?? null, input.email, storedMessage],
  )
  const leadId = lead.id

  // 2. Best-effort Zoho push.
  let crmStatus: LeadResult['crmStatus'] = 'pending'
  try {
    const token = await getZohoToken()
    const appUrl = process.env.APP_URL ?? 'https://bezambar-web2026.vercel.app'
    const pageUrl = input.pageSlug ? `${appUrl}/${input.pageSlug}` : undefined

    // Newsletter: subscribe to Campaigns (non-fatal), then fall through to CRM Lead.
    if (intent === 'newsletter') {
      try { await subscribeToNewsletter(token, input.email, input.name) } catch { /* non-fatal */ }
    }

    if (intent && SERVICE_INTENTS.has(intent)) {
      // ── Zoho Desk ticket ──────────────────────────────────────────────────
      const orgId = await getDeskOrgId(token)
      if (!orgId) throw new Error('Desk orgId unavailable')

      const contactId = await getDeskContactId(token, orgId, input.email, input.name || input.email)
      if (!contactId) throw new Error('Desk contactId unavailable')

      const desk = await fetch('https://desk.zoho.com/api/v1/tickets', {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
          orgId,
        },
        body: JSON.stringify({
          subject: `${intent} — ${input.name || input.email}`,
          departmentId: ZOHO_DESK_DEPT_ID,
          contactId,
          phone: input.phone || undefined,
          description: buildCrmDescription(input, pageUrl),
        }),
      })

      const deskJson = (await desk.json()) as { id?: string }
      if (desk.status === 401) {
        invalidateZohoToken()
        crmStatus = 'failed'
      } else if (deskJson.id) {
        crmStatus = 'synced'
        await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [deskJson.id, leadId])
      } else {
        crmStatus = 'failed'
      }
    } else {
      // ── Zoho CRM Lead ─────────────────────────────────────────────────────
      const nameFields = parseZohoName(input.name, input.email)
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
            Email: input.email,
            Mobile: input.phone || undefined,
            Lead_Source: ZOHO_LEAD_SOURCE,
            Website: pageUrl,
            Inquiry_Intent: input.intent || undefined,
            Description: buildCrmDescription(input, pageUrl),
          }],
        }),
      })

      // Zoho returns 207 on per-record validation failure — crm.ok is true.
      // Must check data[0].status to distinguish success from silent rejection.
      const json = (await crm.json()) as {
        data: Array<{ code: string; status: string; details?: { id?: string } }>
      }
      const rec = json.data?.[0]
      const crmId = rec?.details?.id

      if (crm.status === 401) {
        invalidateZohoToken()
        crmStatus = 'failed'
      } else if (crm.ok && rec?.status === 'success' && rec?.code === 'SUCCESS' && crmId) {
        crmStatus = 'synced'
        await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [crmId, leadId])
      } else {
        crmStatus = 'failed'
      }
    }
  } catch {
    crmStatus = 'failed'
  }

  if (crmStatus === 'failed') {
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
  }

  return { leadId, crmStatus }
}
