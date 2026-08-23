import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Content-Security-Policy. Allows:
 *  - Cloudinary media/images (res.cloudinary.com)
 *  - Google Fonts (fonts.googleapis.com / fonts.gstatic.com) — next/font also self-hosts
 *  - Freshsales / Freshworks CRM endpoints (Freshchat widget removed 2026-08-12)
 * 'unsafe-eval' is only permitted in development (Next dev tooling needs it).
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://*.freshworks.com https://*.freshsales.io`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net`,
  `font-src 'self' https://fonts.gstatic.com https://webfonts.fontstand.com data:`,
  `img-src 'self' data: blob: https://res.cloudinary.com`,
  `media-src 'self' blob: https://res.cloudinary.com`,
  `connect-src 'self' https://res.cloudinary.com https://*.freshworks.com https://*.myfreshworks.com`,
  `frame-src 'self' https://www.google.com https://maps.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
].join('; ')

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
          { key: 'Content-Security-Policy', value: csp },
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
