'use server'

import { z } from 'zod'
import { INQUIRY_INTENTS } from '@/lib/data/inquiry-constants'
import { createLead } from '@/lib/leads'

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

  // Durable save + best-effort Zoho sync all live in lib/leads.ts so the server
  // action and the /api/lead route can never diverge. A Zoho failure is recorded
  // (admin retry) and never surfaced to the visitor — the lead is safe in Neon.
  try {
    await createLead(parsed.data)
  } catch {
    return { status: 'error', message: 'We could not record your inquiry. Please call the atelier.' }
  }

  return { status: 'success', message: 'Thank you — the atelier will be in touch shortly.' }
}
