import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getGeo } from '@/lib/geo'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { getZohoToken, invalidateZohoToken, parseZohoName } from '@/lib/zoho-auth'

// Lead_Source must be a valid Zoho CRM picklist display_value.
// Verify this matches your org's picklist: Zoho CRM → Leads → Fields → Lead Source.
const ZOHO_LEAD_SOURCE = 'Web Site'

// Intents that should NOT create a CRM Lead — they're marketing contacts, not sales prospects.
// Newsletter subscribers go to Neon only until Zoho Campaigns is configured.
const SKIP_CRM_INTENTS = new Set(['newsletter'])

export async function POST(req: NextRequest) {
  const { ip } = getGeo(req)
  const { allowed } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }
  await recordAttempt(ip, true)

  const body = await req.json() as {
    name?: string
    email?: string
    message?: string
    intent?: string
    sku?: string
    // Accept BOTH key styles — REST callers (ArchiveModal, Newsletter) send
    // snake_case `page_slug`; be tolerant of camelCase `pageSlug` too.
    pageSlug?: string
    page_slug?: string
  }

  const name      = body.name
  const email     = body.email
  const intent    = body.intent
  const sku       = body.sku ?? null
  const message   = body.message || null
  // pageSlug is the site path (e.g. "jewelry/rings/c-0754"); sku is the piece reference.
  const rawPageSlug = body.pageSlug ?? body.page_slug ?? null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  // `leads.page_slug` has a FK -> pages.slug. Only write it if the value is a
  // REAL page slug; a piece SKU is not a page and would violate the FK.
  let fkPageSlug: string | null = null
  if (rawPageSlug) {
    try {
      const hit = await sql<{ slug: string }>(
        `SELECT slug FROM pages WHERE slug = $1 LIMIT 1`,
        [rawPageSlug],
      )
      if (hit.length > 0) fkPageSlug = rawPageSlug
    } catch {
      fkPageSlug = null
    }
  }

  // 1. Durable audit copy FIRST — lead is never lost even if CRM fails.
  const [lead] = await sql<{ id: number }>(
    `INSERT INTO leads(page_slug, sku, intent, name, email, message, crm_status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id`,
    [fkPageSlug, sku, intent ?? null, name ?? null, email, message ?? null],
  )

  // Page URL for Zoho Website field — lets sales see exactly which page the lead came from.
  const appUrl = process.env.APP_URL ?? 'https://bezambar-web2026.vercel.app'
  const pageUrl = rawPageSlug ? `${appUrl}/${rawPageSlug}` : undefined

  // 2. Push to Zoho CRM Leads (best-effort — 5s timeout, never blocks lead save)
  // Newsletter and other marketing intents go to Neon only until Zoho Campaigns is wired.
  if (SKIP_CRM_INTENTS.has(intent ?? '')) {
    return NextResponse.json({ ok: true })
  }

  try {
    const token = await getZohoToken()
    const nameFields = parseZohoName(name, email)
    const description = [
      sku     ? `SKU: ${sku}`        : null,
      intent  ? `Intent: ${intent}`  : null,
      message || null,
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
          Email: email,
          Lead_Source: ZOHO_LEAD_SOURCE,
          Website: pageUrl,
          Description: description,
        }],
      }),
    })

    // Zoho returns 207 on per-record validation failure — crm.ok is true.
    // Must check data[0].status to distinguish success from silent rejection.
    const json = await crm.json() as {
      data: Array<{ code: string; status: string; details?: { id?: string } }>
    }
    const rec   = json.data?.[0]
    const crmId = rec?.details?.id

    if (crm.status === 401) {
      invalidateZohoToken()
      await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    } else if (crm.ok && rec?.status === 'success' && rec?.code === 'SUCCESS' && crmId) {
      await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [crmId, lead.id])
    } else {
      await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    }
  } catch {
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
  }

  // Always 200 — lead is safe in Neon regardless of CRM outcome
  return NextResponse.json({ ok: true })
}
