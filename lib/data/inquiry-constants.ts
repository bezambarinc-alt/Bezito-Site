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
  'Authorized Retailers',
  'Ring Sizing Appointment',
] as const

export type InquiryIntent = (typeof INQUIRY_INTENTS)[number]

/** Human-readable drawer heading for each intent. */
export const INTENT_HEADINGS: Record<string, string> = {
  'In Person Appointment':       'Atelier Visit',
  'Virtual Appointment':         'Virtual Consultation',
  'Commission a Piece':          'Commission a Piece',
  'A Piece from the Collection': 'A Piece from the Collection',
  'Repair & Cleaning':           'Repair & Cleaning',
  'Ring Resizing':               'Ring Resizing',
  'Authorized Retailers':        'Authorized Retailers',
  'Ring Sizing Appointment':     'Ring Sizing',
}

/** Intents that reveal a "Preferred Date" field. */
export const APPOINTMENT_INTENTS = new Set<string>([
  'In Person Appointment',
  'Virtual Appointment',
  'Ring Sizing Appointment',
])

/** Intents that hide the free-text "Message" field. */
export const HIDE_MESSAGE_INTENTS = new Set<string>([
  'Ring Resizing',
])

/** Intents where Message is required (not optional). */
export const MESSAGE_REQUIRED_INTENTS = new Set<string>([
  'A Piece from the Collection',
  'Commission a Piece',
])

/** Intents where Preferred Date is required (not optional). */
export const DATE_REQUIRED_INTENTS = new Set<string>([
  'In Person Appointment',
  'Virtual Appointment',
  'Ring Sizing Appointment',
])

/** Intents that reveal the retailer location fields (country / city / state). */
export const LOCATION_INTENTS = new Set<string>([
  'Authorized Retailers',
])

/** Countries for the retailer location dropdown. United States is first (default). */
export const COUNTRIES = [
  'United States',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'China',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hong Kong',
  'India',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Kuwait',
  'Luxembourg',
  'Mexico',
  'Monaco',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Portugal',
  'Qatar',
  'Russia',
  'Saudi Arabia',
  'Singapore',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'Other',
] as const

/** US states (50 + DC) for the retailer location state dropdown. */
export const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'DC', name: 'Washington, D.C.' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' },
] as const
