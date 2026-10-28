import type { Metadata } from 'next'
import { Open_Sans, Lora } from 'next/font/google'
import Script from 'next/script'
import { BRAND_OG_IMAGE } from '@/lib/og'
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
  metadataBase: new URL('https://www.bezambar.com'),
  title: {
    default: 'Bez Ambar | Chiseling Light',
    template: '%s · Bez Ambar',
  },
  description:
    'Bez Ambar, designer of the Princess Cut. Fine jewelry from the Los Angeles atelier.',
  openGraph: {
    type: 'website',
    siteName: 'Bez Ambar',
    title: 'Bez Ambar | Chiseling Light',
    description: 'Designer of the Princess Cut. Fine jewelry, Los Angeles.',
    images: [
      {
        ...BRAND_OG_IMAGE,
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  verification: {
    google: [
      '6B00ZEERW59xG2W7AUJ-m73zIGF3KmoDGVWcObCK9Lg',
      'ofEgZRIXlvyvcbQRIrjgbZZbBJ9R6RJbRCMOE9_b2yU',
      'U4_vdQbk7Ym-z5Oo3ody-_YIC9RcNCykEd8vyEDq6MA',
    ],
    other: {
      'msvalidate.01': 'EA37A4F49A2AF9C2B2597B96B7B398F8',
    },
  },
}

// Bare root — just HTML/body + fonts + globals.
// Site chrome (Header/Footer/Drawers) lives in (public)/layout.tsx.
// Admin chrome lives in (admin)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${lora.variable}`}>
      <body>
        {/* Consent Mode v2 defaults — must fire before gtag.js loads */}
        <Script id="gtag-consent-default" strategy="beforeInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
        `}</Script>
        <Script id="clarity-stub" strategy="beforeInteractive">{`
          window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
        `}</Script>
        <Script
          id="clarity"
          strategy="afterInteractive"
          src="https://www.clarity.ms/tag/yx99t20kqu"
        />
        {children}
      </body>
    </html>
  )
}
