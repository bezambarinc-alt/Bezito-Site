# Components

All components live in `src/components/`. They are rendered by `Layout.astro` and appear on every page unless noted.

## Header (`Header.astro`)

Fixed top bar. Always rendered.

- Left: hamburger button that opens `Nav`
- Center: "BEZ AMBAR" wordmark link → `/`
- Right: search icon (opens `SearchOverlay`), contact icon (opens `InquiryDrawer`)
- Transparent at page top; JS adds `.is-solid` (white background) on scroll
- All styles in `global.css` section 7 — no scoped `<style>` block in the component

## Nav (`Nav.astro`)

Slide-left menu overlay. Always rendered, hidden until toggled.

- Root column: top-level items (Jewelry, Atelier, Blog, The Archive, Service)
- Sub-columns: Jewelry (Collections + Browse + From the Atelier), Atelier, Service
- "Browse" section: Rings → Bands → Bracelets → Earrings → Necklaces → Pendants (no Engagement Rings, no Wedding Bands as separate items)
- "From the Atelier" section: featured highlight pieces and new concepts
- Bottom CTA: "Arrange a Private Consultation" → opens InquiryDrawer with `intent: 'consultation'`
- Mobile: single-panel slide (root slides left, sub-column slides in from right)

## Footer (`Footer.astro`)

Five-column footer. Always rendered.

- Column 1: Brand — wordmark, tagline, `<SocialLinks />`, Blaze® credit
- Columns 2–5: Shop / Atelier / Service / Contact+Address link groups
- Accordion on mobile (each column collapses)
- Imports `SocialLinks`

## SearchOverlay (`SearchOverlay.astro`)

Full-screen frosted-glass search panel. Always rendered, hidden until triggered.

- Powered by Pagefind (static search, built at deploy time)
- Triggered by header search icon
- Renders live results below input as user types

## InquiryDrawer (`InquiryDrawer.astro`)

Slide-right inquiry/contact panel. Always rendered, hidden until triggered.

- Opens via `window.openInquiryDrawer({ title?, sku?, intent? })`
- Submits to FreshSales worker: `https://bezito-forms.bezambarinc.workers.dev/api/contact`
- Payload includes: firstName, lastName, email, phone, intent, message, pieceTitle, pieceSku, UTM fields
- Used site-wide for general inquiries, bespoke commissions, and service requests
- **Note:** The Archive page has its own separate modal (video left + form right) — it does NOT use this drawer

## SocialLinks (`SocialLinks.astro`)

Icon-only social row. Used inside `Footer` and `InquiryDrawer`.

- Instagram → `https://www.instagram.com/bezambarjewelry/`
- Pinterest → `https://www.pinterest.com/bezambarinc/`
- Accepts optional `class` prop for layout overrides
