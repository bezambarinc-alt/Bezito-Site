import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name?: string
    email?: string
    message?: string
    intent?: string
    // Accept BOTH key styles — REST callers (ArchiveModal, Newsletter) send
    // snake_case `page_slug`; be tolerant of camelCase `pageSlug` too.
    pageSlug?: string
    page_slug?: string
  }

  const name    = body.name
  const email   = body.email
  const intent  = body.intent
  // The caller's page_slug is often a piece SKU (e.g. "C-1234"), NOT a page.
  // `leads.page_slug` has a FOREIGN KEY -> pages.slug, so inserting a non-page
  // value throws (leads_page_slug_fkey) and 500s — losing the lead. We therefore
  // treat this value as a "source" reference: keep it for CRM + message, but only
  // write it to the FK column if it actually exists in `pages`.
  const sourceRef = body.pageSlug ?? body.page_slug ?? null

  // Preserve intent + source ref in the stored message so nothing is lost even
  // though there are no dedicated `intent`/`source` columns.
  const message = [
    body.intent ? `Intent: ${body.intent}` : null,
    sourceRef ? `Ref: ${sourceRef}` : null,
    body.message,
  ].filter(Boolean).join('\n') || null

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  // Only use sourceRef for the FK column if it's a real page slug; else NULL.
  let fkPageSlug: string | null = null
  if (sourceRef) {
    try {
      const hit = await sql<{ slug: string }>(
        `SELECT slug FROM pages WHERE slug = $1 LIMIT 1`,
        [sourceRef],
      )
      if (hit.length > 0) fkPageSlug = sourceRef
    } catch {
      fkPageSlug = null // never let this lookup break the lead save
    }
  }

  // 1. Durable audit copy FIRST — lead can never be lost even if CRM fails
  const [lead] = await sql<{ id: number }>(
    `INSERT INTO leads(page_slug, name, email, message, crm_status)
     VALUES ($1,$2,$3,$4,'pending') RETURNING id`,
    [fkPageSlug, name ?? null, email, message ?? null],
  )

  // 2. Push to Freshsales (best-effort)
  try {
    const crm = await fetch('https://bezambar.myfreshworks.com/crm/sales/api/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${process.env.FRESHSALES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          first_name: name,
          email,
          custom_field: { source: sourceRef ?? 'site', intent: intent ?? 'site' },
        },
      }),
    })
    if (crm.ok) {
      const { contact } = await crm.json() as { contact: { id: number } }
      await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [String(contact?.id ?? ''), lead.id])
    } else {
      await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
    }
  } catch {
    await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [lead.id])
  }

  // Always 200 — lead is safe in Neon regardless of CRM outcome
  return NextResponse.json({ ok: true })
}
