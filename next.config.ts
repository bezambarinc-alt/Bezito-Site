import type { NextConfig } from 'next'
import { REDIRECTS } from './redirects'

// CSP is built per-request in proxy.ts (middleware) so it can carry a nonce.
// Only static security headers live here.

const nextConfig: NextConfig = {
  experimental: { inlineCss: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dlg2mou53/**' },
    ],
  },
  async redirects() {
    return REDIRECTS
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // CSP is intentionally omitted here — proxy.ts (middleware) sets it
          // per-request with a fresh nonce so inline JSON-LD scripts can run.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Tell Cloudflare to cache public HTML for 1 hour (stale-while-revalidate 24h).
        // Browsers still get no-store via the standard Cache-Control Vercel sets.
        // Cloudflare reads CDN-Cache-Control first and strips it before the browser sees it.
        // Excludes /trade/* (password-gated, force-dynamic — must not be cached at CDN).
        source: '/((?!api|admin|portal|trade|_next|favicon).*)',
        headers: [
          { key: 'CDN-Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Explicitly tell CDN not to cache trade pages (password-gated, DB-driven).
        source: '/trade/:path*',
        headers: [
          { key: 'CDN-Cache-Control', value: 'private, no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
