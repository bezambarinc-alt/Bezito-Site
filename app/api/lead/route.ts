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

  const name     = body.name
  const email    = body.email
  const intent   = body.intent
  const pageSlug = body.pageSlug ?? body.page_slug
  // Preserve the intent in the stored message so lead type is never lost,
  // even though there is no dedicated `intent` column yet.
  const message  = [body.intent ? `Intent: ${body.intent}` : null, body.message]
    .filter(Boolean)
    .join('\n') || null

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  // 1. Durable audit copy FIRST — lead can never be lost even if CRM fails
  const [lead] = await sql<{ id: number }>(
    `INSERT INTO leads(page_slug, name, email, message, crm_status)
     VALUES ($1,$2,$3,$4,'pending') RETURNING id`,
    [pageSlug ?? null, name ?? null, email, message ?? null],
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
          custom_field: { source: pageSlug ?? 'site', intent: intent ?? 'site' },
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
