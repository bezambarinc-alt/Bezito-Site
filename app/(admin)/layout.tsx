import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Bez Ambar Admin' },
  robots: { index: false, follow: false },
}

// Completely isolated from the public site — no Header, Footer, Drawers.
// Uses --font-opensans loaded by the root layout (app/layout.tsx).
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ba-admin-root">
      {children}
    </div>
  )
}
