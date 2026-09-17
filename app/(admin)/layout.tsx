import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Bez Ambar Admin' },
  robots: { index: false, follow: false },
}

/**
 * Everything under /admin renders per-request — same reason as the portal
 * group: proxy.ts serves /admin the strict nonce CSP, and a nonce cannot exist
 * in prerendered HTML, so a static page here ships bootstrap chunks that
 * 'strict-dynamic' then blocks. See the note in app/(portal)/layout.tsx.
 *
 * Every page under (protected) already declares this individually because they
 * read the session; declaring it at the group means the login page and any new
 * route inherit it instead of having to remember.
 */
export const dynamic = 'force-dynamic'

// Completely isolated from the public site — no Header, Footer, Drawers.
// Uses --font-opensans loaded by the root layout (app/layout.tsx).
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ba-admin-root">
      {children}
    </div>
  )
}
