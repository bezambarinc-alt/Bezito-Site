import type { NextConfig } from 'next'

// CSP is built per-request in proxy.ts (middleware) so it can carry a nonce.
// Only static security headers live here.

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dlg2mou53/**' },
    ],
  },
  async redirects() {
    return [
      { source: '/retailers', destination: '/contact', permanent: false },
    ]
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
    ]
  },
}

export default nextConfig
