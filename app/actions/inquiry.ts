'use server'

import { z } from 'zod'
import { sql } from '@/lib/db'
import { INQUIRY_INTENTS } from '@/lib/data/inquiry-constants'

/**
 * Inquiry Server Action — used by the InquiryDrawer and the Contact page form.
 * Durable audit copy is written to Neon FIRST, then a best-effort push to
 * Freshsales. The lead is never lost even if the CRM call fails.
 *
 * No secrets are hardcoded — Freshsales credentials come from the environment.
 */

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

  // 2. Best-effort CRM push.
  try {
    const crm = await fetch('https://bezambar.myfreshworks.com/crm/sales/api/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Token token=${process.env.FRESHSALES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          first_name: d.name,
          email: d.email,
          mobile_number: d.phone || undefined,
          custom_field: { source: d.pageSlug || 'site', intent: d.intent },
        },
      }),
    })
    if (crm.ok && leadId != null) {
      const body = (await crm.json()) as { contact?: { id?: number } }
      await sql(`UPDATE leads SET crm_status='synced', crm_id=$1 WHERE id=$2`, [
        String(body.contact?.id ?? ''),
        leadId,
      ])
    } else if (leadId != null) {
      await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
    }
  } catch {
    if (leadId != null) await sql(`UPDATE leads SET crm_status='failed' WHERE id=$1`, [leadId])
  }

  return { status: 'success', message: 'Thank you — the atelier will be in touch shortly.' }
}
