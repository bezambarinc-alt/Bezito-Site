import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Paths we never log (assets, api, admin, internal)
const SKIP = /^\/(_next|api|admin|favicon|robots|sitemap|llms|.*\.[a-z0-9]+$)/i

// Common bot UA patterns — skip Neon writes for known crawlers
const BOT_UA = /bot|crawl|spider|slurp|mediapartners|googlebot|bingbot|yandexbot|duckduckbot|baiduspider|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12bot/i

// Build a per-request CSP string with a fresh nonce.
// Nonce replaces 'unsafe-inline' in script-src — no inline script runs without it.
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''} https://*.freshworks.com https://*.freshsales.io https://cdn.curator.io`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net`,
    `font-src 'self' https://fonts.gstatic.com https://webfonts.fontstand.com data:`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://*.curator.io https://*.cdninstagram.com`,
    `media-src 'self' blob: https://res.cloudinary.com`,
    `connect-src 'self' https://res.cloudinary.com https://*.freshworks.com https://*.myfreshworks.com https://*.curator.io`,
    `frame-src 'self' https://www.google.com https://maps.google.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ].join('; ')
}

// Fire-and-forget page-view log → /api/track (Node runtime does the Neon insert).
// Edge can't use pg, so middleware just relays the request context.
function logView(req: NextRequest): void {
  const path = req.nextUrl.pathname
  if (SKIP.test(path)) return
  const ua = req.headers.get('user-agent') || ''
  if (BOT_UA.test(ua)) return // skip crawlers — don't write bot noise to Neon
  const p = req.nextUrl.searchParams
  const body = JSON.stringify({
    path,
    referer: req.headers.get('referer') || '',
    ua,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        || req.headers.get('x-real-ip') || 'unknown',
    city:    req.headers.get('x-vercel-ip-city') || '',
    region:  req.headers.get('x-vercel-ip-country-region') || '',
    country: req.headers.get('x-vercel-ip-country') || '',
    utm_source:   p.get('utm_source') || undefined,
    utm_medium:   p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    session_id: req.cookies.get('ba_sid')?.value || undefined,
  })
  // No await — must never delay the response
  fetch(new URL('/api/track', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-track-secret': process.env.TRACK_SECRET || '' },
    body,
  }).catch(() => {})
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Per-request nonce — base64-encoded UUID. Injected into CSP and forwarded
  // to RSC via x-nonce so JSON-LD <script nonce> tags can match.
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)

  // Forward nonce to server components via request header
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  // Never gate login pages or API routes (prevents redirect loops)
  if (path === '/admin/login' || path === '/portal/login' || path.startsWith('/api/') || path.startsWith('/preview/')) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  // ── Portal: client session gate ────────────────────────────────────────────
  if (path.startsWith('/portal')) {
    const clientToken = req.cookies.get('client_session')?.value
    const portalLogin = new URL('/portal/login', req.url)
    portalLogin.searchParams.set('from', path + req.nextUrl.search)
    if (!clientToken) return NextResponse.redirect(portalLogin)
    try {
      const { payload } = await jwtVerify(clientToken, JWT_SECRET)
      if (payload.role !== 'client') return NextResponse.redirect(portalLogin)
      const res = NextResponse.next({ request: { headers: requestHeaders } })
      res.headers.set('Content-Security-Policy', csp)
      return res
    } catch {
      return NextResponse.redirect(portalLogin)
    }
  }

  // ── Public traffic: log the view, assign a session cookie, pass through ──────
  if (!path.startsWith('/admin')) {
    logView(req)
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    if (!req.cookies.get('ba_sid')) {
      res.cookies.set('ba_sid', crypto.randomUUID(), {
        httpOnly: true, secure: true, sameSite: 'lax',
        path: '/', maxAge: 60 * 30, // 30-min session window
      })
    }
    return res
  }

  // ── Admin: auth gate ────────────────────────────────────────────────────────
  const token = req.cookies.get('session')?.value
  // Validate redirect target — relative paths only, no open redirect
  function safeFrom(raw: string): string {
    try {
      const u = new URL(raw, req.url)
      if (u.origin !== new URL(req.url).origin) return '/admin'
    } catch { return '/admin' }
    return raw
  }

  const loginUrl = (from: string) => {
    const url = new URL('/admin/login', req.url)
    url.searchParams.set('from', safeFrom(from))
    return url
  }
  const from = req.nextUrl.pathname + req.nextUrl.search

  if (!token) return NextResponse.redirect(loginUrl(from))

  try {
    await jwtVerify(token, JWT_SECRET)
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  } catch {
    return NextResponse.redirect(loginUrl(from))
  }
}

export const config = {
  // Run on everything EXCEPT api routes, admin login, static assets, image optimizer.
  // Admin auth + public view-logging are branched inside middleware().
  // Excluding /api and /admin/login here is belt-and-suspenders with the guard above.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin/login|portal/login|.*\\.[a-z0-9]+$).*)'],
}
