/**
 * Trusted client-IP extraction.
 *
 * Edge-safe on purpose: no `server-only`, no `next/headers`, no node APIs —
 * proxy.ts runs in the edge runtime and must be able to import this.
 *
 * Why this exists: reading `x-forwarded-for[0]` takes the LEFT-most entry, which
 * is whatever the caller sent. Anyone can set `X-Forwarded-For: <random>` and get
 * a fresh identity on every request, which defeats every per-IP rate limit in the
 * app (admin login, admin PIN, portal auth, preview PIN, lead form) and poisons
 * `page_views.ip_hash` and the IP whitelist.
 *
 * Order below is "most trustworthy first":
 *   x-vercel-forwarded-for — set by Vercel's edge, overwrites any client value
 *   cf-connecting-ip       — set by Cloudflare, likewise overwritten
 *   x-real-ip              — set by the platform proxy on Vercel
 *   x-forwarded-for (RIGHT-most) — appended by the nearest trusted hop, so it is
 *                            the last value an attacker cannot control
 */

export function getClientIp(headers: Headers): string {
  const platform =
    headers.get('x-vercel-forwarded-for') ??
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip')
  if (platform?.trim()) return platform.trim()

  const chain = headers.get('x-forwarded-for')
  if (chain) {
    const hops = chain.split(',').map((h) => h.trim()).filter(Boolean)
    // Right-most, not left-most — see header comment.
    if (hops.length) return hops[hops.length - 1]
  }

  return 'unknown'
}
