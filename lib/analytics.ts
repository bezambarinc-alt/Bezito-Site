'use client'

interface TrackWindow extends Window {
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
  clarity?: (...args: unknown[]) => void
}

type Params = Record<string, unknown>

interface TrackOpts {
  fb?: [string, Params?]
  clarity?: string
}

/** Fire GA4 event + optional FB standard event + optional Clarity custom event. */
export function track(gaEvent: string, params: Params = {}, opts: TrackOpts = {}) {
  if (typeof window === 'undefined') return
  const w = window as TrackWindow
  w.gtag?.('event', gaEvent, params)
  if (opts.fb) w.fbq?.('track', opts.fb[0], opts.fb[1] ?? {})
  if (opts.clarity) w.clarity?.('event', opts.clarity)
}

/** Unified lead event — covers every inquiry/contact form success. */
export function trackLead(params: {
  method: 'inquiry_drawer' | 'archive_modal' | 'newsletter' | 'contact_page'
  intent?: string
  sku?: string | null
  page_slug?: string | null
  value?: number
}) {
  const { value = 250, ...rest } = params
  track(
    'generate_lead',
    { currency: 'USD', value, ...rest },
    {
      fb: ['Lead', { content_name: params.intent ?? params.method }],
      clarity: 'lead',
    },
  )
}
