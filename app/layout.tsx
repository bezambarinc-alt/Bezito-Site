import type { Metadata } from 'next'
import { Cormorant_Garamond, Open_Sans } from 'next/font/google'
import './globals.css'

import { DrawerProvider } from '@/components/layout/DrawerContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NavMenuData from '@/components/layout/NavMenuData'
import InquiryDrawer from '@/components/layout/InquiryDrawer'
import ConciergeDrawer from '@/components/layout/ConciergeDrawer'
import SearchOverlay from '@/components/layout/SearchOverlay'
import FreshchatScript from '@/components/layout/FreshchatScript'


const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  // MUST include 300 — hero titles & other display text use font-weight: 300.
  // Astro loads @fontsource/open-sans/300.css; without it the browser synthesizes
  // a fake-light or falls back to 400, making headings render heavier than Astro.
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-opensans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bezambar.com'),
  title: {
    default: 'Bez Ambar — Chiseling Light',
    template: '%s · Bez Ambar',
  },
  description:
    'Bez Ambar — inventor of the Princess Cut. Fine jewelry from the Los Angeles atelier, since 1979.',
  openGraph: {
    type: 'website',
    siteName: 'Bez Ambar',
    title: 'Bez Ambar — Chiseling Light',
    description: 'Inventor of the Princess Cut. Fine jewelry, Los Angeles, since 1979.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${openSans.variable}`}>
      <head>
        {/*
          Lyon Text Regular — Fontstand web font (licensed to bezambar.com).
          Fontstand referrer-locks the woff2: it 403s the vercel.app referrer but
          serves fine with NO referrer. referrerPolicy="no-referrer" makes the
          font actually load on the Vercel domain instead of silently falling
          back to Cormorant. Mirrors Astro's Fontstand load in Layout.astro.
        */}
        {/* Organization + sameAs structured data — every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'JewelryStore',
            '@id': 'https://bezambar.com/#organization',
            name: 'Bez Ambar',
            url: 'https://bezambar.com',
            description: 'Independent jewelry designer and maker based in Los Angeles. Inventor of the Princess Cut. Creator of the patented Blaze® and Elysian Cut™ diamond cuts.',
            logo: { '@type': 'ImageObject', url: 'https://bezambar.com/logo.svg', width: 200, height: 60 },
            address: {
              '@type': 'PostalAddress',
              streetAddress: '611 Wilshire Blvd',
              addressLocality: 'Los Angeles',
              addressRegion: 'CA',
              postalCode: '90017',
              addressCountry: 'US',
            },
            telephone: '+12136299191',
            email: 'bez@bezambar.com',
            foundingDate: '1979',
            sameAs: [
              'https://www.instagram.com/bezambarjewelry/',
              'https://www.pinterest.com/bezambarinc/',
              'https://www.youtube.com/@BezAmbarInc/',
              'https://www.tiktok.com/@bezambar',
              'https://www.linkedin.com/in/bez-ambar-869936a/',
            ],
          }) }}
        />
        <link rel="preconnect" href="https://webfonts.fontstand.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://webfonts.fontstand.com/WF-099839-d89c1d499f0c1f40d1e6d7330af17f97.css"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <DrawerProvider>
            <Header />
            {children}
            <Footer />

            {/* Overlays present on every page */}
            <NavMenuData />
            <InquiryDrawer />
            <ConciergeDrawer />
            <SearchOverlay />
          </DrawerProvider>
          <FreshchatScript />
      </body>
    </html>
  )
}
