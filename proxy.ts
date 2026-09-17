import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { isAdminRole } from '@/lib/roles'
import { getClientIp } from '@/lib/client-ip'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Paths we never log (assets, api, admin, internal)
const SKIP = /^\/(_next|api|admin|favicon|robots|sitemap|llms|.*\.[a-z0-9]+$)/i

// Common bot UA patterns — skip Neon writes for known crawlers
const BOT_UA = /bot|crawl|spider|slurp|mediapartners|googlebot|bingbot|yandexbot|duckduckbot|baiduspider|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12bot/i

/**
 * Build a per-request CSP string with a fresh nonce.
 * Nonce replaces 'unsafe-inline' in script-src — no inline script runs without it.
 *
 * ⚠️ This nonce is why the entire public site renders dynamically, and that is
 * not an accident anyone can refactor away. Next.js reads the nonce back out of
 * this header (app-render's parseRequestHeaders) and stamps it onto its own
 * bootstrap chunks and flight-data scripts. Prerendered HTML is written at build
 * time, when there is no request and therefore no nonce — so a statically
 * rendered page ships <script> tags with no nonce attribute, and 'strict-dynamic'
 * makes the browser ignore 'self', leaving nothing to allow them.
 *
 * Measured, not assumed: removing `getNonce()` from (public)/layout.tsx does flip
 * a dozen routes to static, and Playwright against `next start` then reports 19
 * CSP violations on /terms — every Next chunk blocked, zero JS. Reverted.
 *
 * The trade is therefore CSP-vs-ISR, and it belongs to whoever owns the security
 * posture. To get static rendering back you must either drop 'strict-dynamic' and
 * add 'unsafe-inline' (which is most of what this header is protecting against),
 * or stop setting a nonce and accept inline scripts some other way.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production'
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://cdn.curator.io`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io`,
    `font-src 'self' https://fonts.gstatic.com https://webfonts.fontstand.com data:`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://*.curator.io https://*.cdninstagram.com https://curator-assets.b-cdn.net`,
    `media-src 'self' blob: https://res.cloudinary.com`,
    // pagesense-collect / pagesense-hb-collect are where the Zoho PageSense tag
    // (loaded inline by (public)/layout.tsx) beacons its data. They were never in
    // this list, so every PageSense request has been blocked in production since
    // the CSP shipped — the script loads, collects, and can't report. Caught by a
    // Playwright run against a local production build, not by anything in CI.
    `connect-src 'self' https://res.cloudinary.com https://*.curator.io https://*.zoho.com`,
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
    ip: getClientIp(req.headers),
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
    const { payload } = await jwtVerify(token, JWT_SECRET)
    // Admin and portal-client JWTs share JWT_SECRET, so signature validity alone
    // is not authorization — a replayed client_session would pass. Fail closed
    // on any role outside the admin allowlist.
    if (!isAdminRole(payload.role)) return NextResponse.redirect(loginUrl(from))
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  } catch {
    return NextResponse.redirect(loginUrl(from))
  }
}

export const config = {
  // Run on everything EXCEPT api routes, static assets and the image optimizer.
  // Admin auth + public view-logging are branched inside middleware().
  //
  // /admin/login and /portal/login are deliberately NOT excluded here. They used
  // to be, which meant middleware never ran for them — and since the CSP header
  // is only set by middleware, the two pages where passwords get typed were the
  // only pages on the site serving no CSP at all. They still skip the auth gate;
  // that happens in the guard at the top of middleware(), which sets the CSP
  // header before returning.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)'],
}
