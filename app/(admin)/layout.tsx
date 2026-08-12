import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './admin.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Bez Ambar Admin' },
  robots: { index: false, follow: false },
}

// Completely isolated from the public site — no Header, Footer, Drawers, Freshchat.
// Looks and behaves like a standalone CMS tool.
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ba-admin-root`}>
      {children}
    </div>
  )
}
