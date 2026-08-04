import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

import { DrawerProvider } from '@/components/layout/DrawerContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MenuOverlay from '@/components/layout/MenuOverlay'
import InquiryDrawer from '@/components/layout/InquiryDrawer'
import ConciergeDrawer from '@/components/layout/ConciergeDrawer'
import SearchOverlay from '@/components/layout/SearchOverlay'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
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
    <html lang="en" className={playfair.variable}>
      <body>
        <DrawerProvider>
          <Header />
          {children}
          <Footer />

          {/* Overlays present on every page */}
          <MenuOverlay />
          <InquiryDrawer />
          <ConciergeDrawer />
          <SearchOverlay />
        </DrawerProvider>
      </body>
    </html>
  )
}
