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
 * Routes that keep the strict, nonce-based CSP. Everything else gets the public
 * policy. See buildCsp below for why the site runs two policies instead of one.
 */
const STRICT_CSP = /^\/(admin|portal|preview)(\/|$)/

/**
 * Build a CSP string. Two policies, chosen by path:
 *
 *   strict (nonce != null) — /admin, /portal, /preview.
 *     script-src 'self' 'nonce-…' 'strict-dynamic'. No inline script runs
 *     without the nonce. These routes are force-dynamic regardless (sessions,
 *     cookies, PIN gates), so the nonce costs nothing here, and this is where
 *     credentials and client work actually live.
 *
 *   public (nonce == null) — the marketing site and catalog.
 *     script-src 'self' 'unsafe-inline' + an explicit host allowlist.
 *
 * ⚠️ Why the public policy is weaker, measured rather than assumed:
 *
 * Next.js stamps a nonce onto its own bootstrap chunks and flight-data scripts
 * by reading it back per request (app-render's parseRequestHeaders). Verified
 * against `next start`: /terms ships 22 <script> tags and all 22 carry the
 * request's nonce. Prerendered HTML is written at build time, when there is no
 * request and therefore no nonce — so a static page ships those same 22 tags
 * bare, and 'strict-dynamic' makes the browser ignore 'self', leaving nothing to
 * allow them. An earlier attempt to drop the nonce while keeping 'strict-dynamic'
 * flipped a dozen routes to static and produced 19 CSP violations on /terms —
 * every chunk blocked, zero JS. That is not a bug to fix; it is the trade.
 *
 * So: a nonce and static rendering are mutually exclusive in the App Router, and
 * without a nonce the framework's own inline flight-data scripts need
 * 'unsafe-inline'. Hashes are not an option — the flight payload differs per page.
 *
 * What makes that acceptable on the public side specifically:
 *   - Nothing anonymous is rendered. Public copy comes from Zoho CRM and the
 *     admin, both authenticated.
 *   - The two raw-HTML sinks are sanitized already: BlogBody.tsx runs a tag/attr
 *     allowlist that strips on* handlers and javascript:, and Richtext.tsx is
 *     sanitized by the /api/pages write guard before storage.
 *   - No public route echoes searchParams into markup, and every JSON-LD block
 *     escapes < before serialising.
 *   - 'unsafe-inline' is scoped to script-src on these routes only; object-src
 *     'none', base-uri 'self' and form-action 'self' still hold everywhere.
 *
 * If a public route ever renders untrusted input, move it under STRICT_CSP and
 * accept the dynamic render — do not weaken the strict policy to match.
 */
function buildCsp(nonce: string | null): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const unsafeEval = isDev ? " 'unsafe-eval'" : ''
  // Without 'strict-dynamic' the host allowlist is honoured again, so anything
  // the page pulls in has to be named here — including second-hop loads that
  // 'strict-dynamic' used to wave through: cdn.pagesense.io is injected by the
  // tag in (public)/layout.tsx, cdn.curator.io by journal/CuratorFeed.tsx, and
  // connect.facebook.net is pulled in turn by Curator to render the Instagram
  // embeds on /journal. Trust no longer propagates, so each one is explicit.
  const scriptSrc = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${unsafeEval} https://cdn.curator.io`
    : `script-src 'self' 'unsafe-inline'${unsafeEval} https://cdn.curator.io https://cdn.pagesense.io https://connect.facebook.net`
  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.curator.io`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://*.curator.io https://*.cdninstagram.com https://curator-assets.b-cdn.net`,
    // The Curator feed serves Instagram video posts from its own CDN and from
    // cdninstagram; both were in img-src but not here, so every video tile on
    // /journal has been blocked since the CSP shipped. Unrelated to the policy
    // split — media-src was never affected by 'strict-dynamic'.
    `media-src 'self' blob: https://res.cloudinary.com https://curator-assets.b-cdn.net https://*.cdninstagram.com`,
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

  // Per-request nonce — base64-encoded UUID — but only on the routes that run
  // the strict policy. Minting one for a public route would be worse than
  // useless: reading it back in a server component calls headers(), and that
  // single call is what opts the whole public tree out of static rendering.
  const nonce = STRICT_CSP.test(path) ? btoa(crypto.randomUUID()) : null
  const csp = buildCsp(nonce)

  // Forward the nonce to server components. Absent on public routes by design —
  // getNonce() must not be called there.
  const requestHeaders = new Headers(req.headers)
  if (nonce) requestHeaders.set('x-nonce', nonce)

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
