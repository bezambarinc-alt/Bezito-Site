import type { Metadata } from 'next'
import { Open_Sans, Lora } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-opensans',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
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
    images: [
      {
        url: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1200/v1785615928/Hero-Model-Earrings-Yellow-Black-Shhhh_copy_uibife.avif',
        width: 1200,
        height: 630,
        alt: 'Bez Ambar — Fine Jewelry, Los Angeles',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
}

// Bare root — just HTML/body + fonts + globals.
// Site chrome (Header/Footer/Drawers) lives in (public)/layout.tsx.
// Admin chrome lives in (admin)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${lora.variable}`}>
      <head>
        <link rel="preconnect" href="https://webfonts.fontstand.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://webfonts.fontstand.com" />
        <link
          rel="stylesheet"
          href="https://webfonts.fontstand.com/WF-099839-d89c1d499f0c1f40d1e6d7330af17f97.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
