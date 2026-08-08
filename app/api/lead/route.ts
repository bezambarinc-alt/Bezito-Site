import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
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

  const name  = body.name
  const email = body.email
  const intent = body.intent
  // Accept an explicit `sku` too; else fall back to the page_slug field, which
  // archive/newsletter callers overload with the piece SKU (e.g. "C-1234").
  const sku = body.sku ?? body.pageSlug ?? body.page_slug ?? null

  // Both SKU and intent now have their OWN columns — neither is stuffed into the
  // message text anymore. The message holds only the actual free-text body.
  const message = body.message || null

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  // `leads.page_slug` has a FK -> pages.slug. Only write it if the value is a
  // REAL page slug; a piece SKU is not a page and would violate the FK (500 →
  // lost lead). The SKU lives in the dedicated `leads.sku` column instead.
  let fkPageSlug: string | null = null
  if (sku) {
    try {
      const hit = await sql<{ slug: string }>(
        `SELECT slug FROM pages WHERE slug = $1 LIMIT 1`,
        [sku],
      )
      if (hit.length > 0) fkPageSlug = sku
    } catch {
      fkPageSlug = null // never let this lookup break the lead save
    }
  }

  // 1. Durable audit copy FIRST — lead can never be lost even if CRM fails.
  //    SKU + intent go to their dedicated columns; message stays clean.
  const [lead] = await sql<{ id: number }>(
    `INSERT INTO leads(page_slug, sku, intent, name, email, message, crm_status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING id`,
    [fkPageSlug, sku, intent ?? null, name ?? null, email, message ?? null],
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
          custom_field: { source: sku ?? 'site', intent: intent ?? 'site' },
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
