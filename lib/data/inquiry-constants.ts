/**
 * inquiry-constants.ts — SINGLE SOURCE OF TRUTH for inquiry intents.
 *
 * These strings are the canonical intent values used everywhere in the
 * inquiry pipeline. They were previously hand-duplicated across four files
 * (the Zod schema, ConciergeDrawer, InquiryDrawer, ContactForm), which drifted
 * into a submission-breaking bug (lowercase concierge/select values vs Title
 * Case Zod enum). Import from here so they can never diverge again.
 *
 * Client-safe: no server-only deps. Both server actions and client components
 * import this module.
 */

export const INQUIRY_INTENTS = [
  'In Person Appointment',
  'Virtual Appointment',
  'Commission a Piece',
  'A Piece from the Collection',
  'Repair & Cleaning',
  'Ring Resizing',
] as const

export type InquiryIntent = (typeof INQUIRY_INTENTS)[number]

/** Intents that reveal a "Preferred Date" field. */
export const APPOINTMENT_INTENTS = new Set<string>([
  'In Person Appointment',
  'Virtual Appointment',
])

/** Intents that hide the free-text "Message" field. */
export const HIDE_MESSAGE_INTENTS = new Set<string>([
  'Ring Resizing',
])
