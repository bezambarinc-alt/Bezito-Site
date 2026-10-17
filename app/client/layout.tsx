import { DrawerProvider } from '@/components/layout/DrawerContext'
import InquiryDrawer from '@/components/layout/InquiryDrawer'

/**
 * Client pages are unbranded presentations served to Bez's clients (and proxied
 * as bezito.co/c/<token>), so this layout deliberately mounts none of the site
 * chrome from (public)/layout.tsx — no Header, Footer, Newsletter, analytics,
 * or JSON-LD that would name the house.
 *
 * DrawerProvider + InquiryDrawer are the one exception: InquireCta blocks and
 * ProdPill call useDrawers(), which throws without a provider — a client page
 * with an inquiry CTA 500s on render without this layout.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrawerProvider>
      {/* No site header — zero out header offset; transparent split bg so blocks inherit the white body */}
      <div style={{ '--ba-header-h': '0px', '--ba-split-bg': 'transparent' } as React.CSSProperties}>
        {children}
      </div>
      <InquiryDrawer />
    </DrawerProvider>
  )
}
