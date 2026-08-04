import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, email, message, pageSlug } = await req.json() as {
    name?: string
    email: string
    message?: string
    pageSlug?: string
  }

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
        contact: { first_name: name, email, custom_field: { source: pageSlug ?? 'site' } },
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
