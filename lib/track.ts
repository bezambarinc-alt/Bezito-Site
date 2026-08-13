import 'server-only'

/**
 * Analytics parsing helpers — shared by /api/track.
 * Pure functions (no DB) so they can run in either runtime.
 */

// ── Device / browser / OS from User-Agent ────────────────────────────────────
export function parseUA(ua: string): { device: string; browser: string; os: string; isBot: boolean } {
  const u = (ua || '').toLowerCase()

  const isBot = /bot|crawler|spider|scraper|headless|phantom|selenium|slurp|bingpreview|facebookexternalhit|preview|monitor|curl|wget|python-requests|axios|go-http/.test(u)

  let device: string = 'desktop'
  if (/ipad|tablet|kindle|playbook|silk/.test(u)) device = 'tablet'
  else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/.test(u)) device = 'mobile'

  let browser = 'Other'
  if (/edg\//.test(u)) browser = 'Edge'
  else if (/opr\/|opera/.test(u)) browser = 'Opera'
  else if (/chrome|crios/.test(u) && !/edg\//.test(u)) browser = 'Chrome'
  else if (/firefox|fxios/.test(u)) browser = 'Firefox'
  else if (/safari/.test(u) && !/chrome|crios/.test(u)) browser = 'Safari'

  let os = 'Other'
  if (/windows/.test(u)) os = 'Windows'
  else if (/iphone|ipad|ipod|ios/.test(u)) os = 'iOS'
  else if (/mac os x|macintosh/.test(u)) os = 'macOS'
  else if (/android/.test(u)) os = 'Android'
  else if (/linux/.test(u)) os = 'Linux'

  return { device: isBot ? 'bot' : device, browser, os, isBot }
}

// ── Traffic source classification ────────────────────────────────────────────
const SOCIAL = ['facebook','instagram','twitter','x.com','t.co','tiktok','linkedin','pinterest','youtube','snapchat','reddit','whatsapp','telegram']
const SEARCH = ['google','bing','yahoo','duckduckgo','baidu','yandex','ecosia','brave']

export function classifySource(referer: string, utmSource?: string, utmMedium?: string): string {
  const m = (utmMedium || '').toLowerCase()
  const s = (utmSource || '').toLowerCase()
  if (m) {
    if (m.includes('email') || m.includes('newsletter')) return 'Email'
    if (m.includes('social') || m.includes('cpc') || m.includes('paid')) return 'Social'
    if (m.includes('organic')) return 'Organic'
    if (m.includes('referral')) return 'Referral'
  }
  if (s) {
    if (SOCIAL.some(x => s.includes(x))) return 'Social'
    if (SEARCH.some(x => s.includes(x))) return 'Organic'
  }
  const r = (referer || '').toLowerCase()
  if (!r) return 'Direct'
  if (SOCIAL.some(x => r.includes(x))) return 'Social'
  if (SEARCH.some(x => r.includes(x))) return 'Organic'
  if (r.includes('mail.') || r.includes('gmail') || r.includes('/mail')) return 'Email'
  return 'Referral'
}

// ── Page type + SKU from path ────────────────────────────────────────────────
export function classifyPath(path: string): { pageType: string; sku: string | null } {
  if (path === '/' || path === '') return { pageType: 'home', sku: null }
  // /jewelry/[category]/[slug] → product detail (slug === sku)
  const prod = path.match(/^\/jewelry\/[^/]+\/([^/]+)\/?$/)
  if (prod) return { pageType: 'product', sku: decodeURIComponent(prod[1]) }
  if (/^\/jewelry\/[^/]+\/?$/.test(path)) return { pageType: 'category', sku: null }
  if (path === '/jewelry') return { pageType: 'jewelry', sku: null }
  if (path.startsWith('/client/')) return { pageType: 'client', sku: null }
  if (path.startsWith('/blog') || path.startsWith('/journal')) return { pageType: 'blog', sku: null }
  if (path.startsWith('/archive')) return { pageType: 'archive', sku: null }
  if (path.startsWith('/collection/')) return { pageType: 'collection', sku: null }
  if (path === '/contact') return { pageType: 'contact', sku: null }
  return { pageType: 'other', sku: null }
}

// ── Daily-salted visitor hash (privacy-first, no raw IP stored) ───────────────
export async function hashIp(ip: string, salt: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10)
  const data = new TextEncoder().encode(`${salt}|${day}|${ip}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')
}
