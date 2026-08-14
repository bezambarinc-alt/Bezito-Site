# Components

All components are in `components/`. CSS Modules are co-located (`ComponentName.module.css`).

---

## Layout

### `Header`
Fixed header — `components/layout/Header.tsx`

Transparent on page load, transitions to solid white on scroll (`scrollY > 20`). Three zones:
- **Left:** hamburger + "Menu" label → `openMenu()`
- **Center:** "Bez Ambar" wordmark → `<Link href="/">`
- **Right:** search icon → `openSearch()`, concierge bell → `openConcierge()`

Scroll state + drawer actions via `useDrawers()` from `DrawerContext`.

---

### `MenuOverlay`
Slide-in navigation — `components/layout/MenuOverlay.tsx`

Two-column layout:
- **Column 1 (root):** static `ROOT` items — Jewelry (expand), Atelier (expand), Blog, The Archive, Service
- **Column 2 (sub):** dynamic sub-menu rendered when an expand item is active

Root items are data-driven (`ROOT` array at top of file). Jewelry sub-items are built from Neon data passed via `NavMenuData` (categories, collections, featured products).

Service item calls `openConcierge()` — the only CTA in the menu. Do not add additional CTAs.

---

### `NavMenuData`
Server component — `components/layout/NavMenuData.tsx`

Fetches `getActiveCategories()`, `getActiveCollections()`, `getFeaturedProducts()` from Neon and renders `<MenuOverlay>` with the data. Injected into the public layout; `MenuOverlay` is client-side.

---

### `DrawerContext`
Shared drawer state — `components/layout/DrawerContext.tsx`

`DrawerProvider` wraps the public layout. Provides `useDrawers()` hook:

```typescript
const { active, openMenu, closeMenu, openSearch, openConcierge, openInquiryDrawer, close } = useDrawers()
```

`active` can be `'menu' | 'search' | 'concierge' | 'inquiry' | null`. Only one drawer open at a time.

---

### `ConciergeDrawer`
Atelier concierge slide panel — `components/layout/ConciergeDrawer.tsx`

Opens from the right. Contains service options (consultation booking, care, custom work). May link to Freshchat if/when the chat integration is re-added.

---

### `InquiryDrawer`
Inquiry form slide panel — `components/layout/InquiryDrawer.tsx`

Primary conversion surface. Can be opened with context:
```typescript
openInquiryDrawer({ intent?: string, sku?: string, title?: string })
```

On submit: `POST /api/lead` with name, email, message, intent, SKU.

---

### `SearchOverlay`
Full-screen search — `components/layout/SearchOverlay.tsx`

Searches `products` table via `GET /api/search`. Live-updates as user types.

---

### `Footer`
Site footer — `components/layout/Footer.tsx`

---

### `DraftModeBanner`
Admin-only — `components/layout/DraftModeBanner.tsx`

Shown on product pages when Next.js draft mode is active (template preview). Shows the active template name and an exit link.

---

### `ProdPill`
Floating product pill — `components/layout/ProdPill.tsx`

Sticky pill shown on product pages. Contains piece name + inquiry CTA. Appears after scroll threshold.

---

## Blocks

Content blocks used by page templates. Each block handles one content type.

| Component | Purpose |
|---|---|
| `BlockRenderer` | Dispatches to the correct block component by `type` |
| `HeroSplit` | Two-column hero — video/image left, text right |
| `HeroVideo` | Full-bleed video hero |
| `ContentSplit` | Text left, image/content right |
| `SpecAccordion` | Technical details accordion (gem, metal, size, etc.) |
| `ImageGrid` | Multi-image grid |
| `Editorial` | Full-width editorial text block |
| `PullQuote` | Large pull quote |
| `Richtext` | Markdown body text |
| `Segment` | Generic section wrapper |
| `InquireCta` | Inline inquiry CTA button |
| `InquireFooter` | Page footer inquiry block |

---

## Product

### `ProductCard`
Product grid card — `components/product/ProductCard.tsx`

Shows hero video (looped, muted) or image + piece name. Links to `/jewelry/[category]/[slug]`.

### `ProductGrid`
Grid layout for product cards — `components/product/ProductGrid.tsx`

### `ProductGallery`
Product image gallery on detail pages — `components/product/ProductGallery.tsx`

### `CategoryRefine`
Category filter pill row — `components/product/CategoryRefine.tsx`

---

## Home

### `HomeSegment`
Homepage section wrapper with reveal animation — `components/home/HomeSegment.tsx`

### `HomeHeroImage`
Homepage hero image — `components/home/HomeHeroImage.tsx`

### `Newsletter`
Newsletter signup form — `components/home/Newsletter.tsx`

Submits to `POST /api/lead` with `intent: 'newsletter'`.

### `ConciergeCtaButton`
Floating concierge CTA on homepage — `components/home/ConciergeCtaButton.tsx`

---

## Common

### `FadeIn`
Intersection-observer fade-in animation wrapper — `components/common/FadeIn.tsx`

### `LazyVideo`
Cloudinary video with lazy loading + poster — `components/common/LazyVideo.tsx`

### `ScrollWipeCarousel`
Scroll-driven wipe carousel — `components/common/ScrollWipeCarousel.tsx`

### `PageCta`
Full-width page CTA block — `components/common/PageCta.tsx`

---

## Blog

### `BlogBody`
Markdown blog post renderer — `components/blog/BlogBody.tsx`

Uses `react-markdown` + `rehype-sanitize`.

### `Reveal`
Scroll-reveal wrapper for blog content — `components/blog/Reveal.tsx`

---

## Archive

### `ArchiveClient`
Client-side archive grid with filtering — `components/archive/ArchiveClient.tsx`

### `ArchiveGrid`
Masonry grid of archive items — `components/archive/ArchiveGrid.tsx`

### `ArchiveModal`
Video player + inquiry modal for archive items — `components/archive/ArchiveModal.tsx`

### `ArchiveFilterPill` / `ArchiveGifCard`
Filter controls + individual archive item card.

---

## Page-specific

### `PinGate` (`app/(public)/preview/[slug]/PinGate.tsx`)
Client-side 4-digit PIN entry. Shown when preview page requires PIN and cookie is absent. Submits to `POST /api/preview/[slug]/verify-pin`.

### `ScrollSpyTabs` (`app/(public)/diamond-education/ScrollSpyTabs.tsx`)
Sticky tab bar that tracks which section is in view.

### `ChapterReveal` / `StoryNav` (`app/(public)/the-story/`)
Scroll-driven chapter reveal + sticky nav for the brand story page.

### `CuratorFeed` (`app/(public)/journal/CuratorFeed.tsx`)
Curated journal feed with category filtering.
