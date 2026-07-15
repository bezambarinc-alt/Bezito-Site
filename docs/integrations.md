# Integrations

## Overview

The Bez Ambar site connects to six external systems. Each has a specific role; they do not overlap.

| System | Role | Access |
|---|---|---|
| **Plytix** | Product data source of truth (PXM) | API active |
| **FreshSales** | CRM — all inquiry leads | API active |
| **Cloudinary** | All video and image media | Credentials in workspace |
| **Vercel** | Hosting + deployment | Token at `~/.openclaw/credentials/vercel.json` |
| **Pagefind** | Static search index | Built at deploy time |
| **Fontstand** | Lyon Text font CDN license | Domain-locked CDN |

---

## Plytix (PXM)

**Plytix** is the Product Experience Management platform — the single source of truth for all product data. Nothing about a product (title, description, stone specs, media URLs, categories) should be changed anywhere other than Plytix. The Astro site reads from it; it does not write to it.

### Data Model

The canonical data structure is the CSV export at `data/plytix-import.csv`:

| Column | Description |
|---|---|
| `slug` | URL-safe product identifier, used in Astro routes (`/products/[slug]`) |
| `sku` | Internal SKU (e.g. `C0754`) |
| `ref_code` | Reference code for ordering / internal use |
| `title` | Display title (e.g. "Single Row Flex Bracelet") |
| `subtitle` | Secondary descriptor |
| `category` | `rings`, `bracelets`, `earrings`, `necklaces`, `pendants`, `bands` |
| `collection` | Collection slug if the piece belongs to one (e.g. `bloom`) |
| `status` | `active`, `archive`, `coming-soon` |
| `metal` | e.g. `18k Yellow Gold`, `Platinum` |
| `description` | Short factual description for product pages |
| `editorial` | Longer editorial text (used in spotlight sections on collection pages) |
| `stone_shape` | e.g. `princess`, `round`, `baguette`, `cushion` |
| `stone_carats_exact` | Exact total carat weight if fixed |
| `stone_carats_min` | Min carat weight for configurable ranges |
| `stone_carats_max` | Max carat weight for configurable ranges |
| `stone_carats_display` | Display string (e.g. "3.0–5.0 ct") |
| `stone_color` | Diamond color grade or gemstone color |
| `stone_clarity` | Diamond clarity or gemstone quality note |
| `stone_notes` | Free-text stone context |
| `hero_video` | Cloudinary video URL for product hero / card |
| `hero_image` | Cloudinary image URL for fallback / OG image |
| `inquiry_subject` | Pre-filled subject line when InquiryDrawer opens from this product |
| `pretty_url` | Canonical public URL (e.g. `https://bezambar.com/products/single-row-flex-bracelet`) |

### Sync Flow

```
Plytix (source of truth)
       ↓  scripts/sync-plytix.js
src/content/products/*.md   (Astro content collection entries)
       ↓  astro build
/products/[slug]   (static HTML pages)
```

**Script:** `scripts/sync-plytix.js` — fetches product data from the Plytix API and writes individual `.md` files into `src/content/products/`. Run this whenever product data changes in Plytix before building.

**Do not hand-edit** `src/content/products/` files directly. They are generated output. Changes will be overwritten on next sync.

### API Access

- **API access:** active. Credentials stored in workspace (ask Kevin or check the Controller dir).
- Plytix also feeds Klaviyo (campaign segmentation) and CF Workers (landing pages) — not only the Astro site.

---

## FreshSales (CRM)

FreshSales Enterprise handles all inquiry leads from the website.

- **Domain:** `bezambar.myfreshworks.com`
- **API base URL:** `https://bezambar.myfreshworks.com/crm/sales/api`
- **Credentials:** `workspace/credentials/freshsales.json`
  ```json
  {
    "domain": "bezambar.myfreshworks.com",
    "base_url": "https://bezambar.myfreshworks.com/crm/sales/api",
    "plan": "Enterprise",
    "user": "bez@bezambar.com"
  }
  ```
- **All Contacts view ID:** `127026373115`

### Lead Flow

The site never calls FreshSales directly. The `InquiryDrawer` form POSTs to the CF Worker:

```
POST https://bezito-forms.bezambarinc.workers.dev/api/contact
```

The CF Worker:
1. Validates the payload
2. Checks FreshSales for an existing contact by email
3. Creates or updates the contact
4. Creates a new deal/lead with piece context + UTM attribution
5. Returns `{ success: true }` or error message

### Field Mapping

| Form field | FreshSales field |
|---|---|
| firstName + lastName (split from Name input) | Contact name |
| email | Contact email |
| intent (programmatic) | Deal description + custom field |
| pieceTitle + pieceSku | Deal name / description |
| utmSource / utmMedium / utmCampaign | Custom UTM fields on deal |

---

## Cloudinary

All media (video + images) is hosted on Cloudinary and served via Cloudinary's CDN.

- **Account ID:** `dlg2mou53`
- **Credentials:** in workspace Controller dir
- **Uploader script:** `scripts/cloudinary-upload.js`

### URL Patterns

Images:
```
https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_800/v1/<public-id>
```

Video (for product heroes and archive):
```
https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1/<public-id>
```

Transformations are applied via URL parameters — never transform at upload time. This allows re-delivery at different sizes without re-uploading.

### Folder Structure

- `archive/` — archive videos (562 entries, sourced in `public/archive-data.json`)
- `videos/<piece-type>/` — active product videos (e.g. `videos/bracelets/`, `videos/rings/`)
- `inspirations/rings/` — design reference images for internal Inspirations gallery

### CSP

`vercel.json` includes Cloudinary in Content Security Policy:
```
media-src https://res.cloudinary.com
img-src https://res.cloudinary.com
```

Do not change these without updating `vercel.json`.

---

## Vercel

All deployments go through Vercel.

- **Account:** `bezambarinc-alt`
- **Project:** `bezito-site`
- **Token:** `~/.openclaw/credentials/vercel.json` — ⚠️ expires ~2026-08-02, rotate before then
- **Output:** `static` (via `@astrojs/vercel/static` adapter)
- **Trigger:** auto-deploy on every push to `main`

`vercel.json` at repo root controls:
- HTTP response headers (CSP, X-Frame-Options, etc.)
- Any redirects needed for domain cutover
- Build output configuration

---

## Pagefind (Static Search)

Pagefind generates a static search index at build time. The site uses it for in-page full-text search.

Build command (in `package.json`):
```
astro build && pagefind --site dist
```

The index is written into `dist/pagefind/` at build time. It is served as a static asset — no server-side search, no API call.

The `SearchOverlay` component loads Pagefind's JS at runtime and queries the index client-side. No external network call during search.

`astro.config.mjs` marks `/pagefind/pagefind.js` as external (Rollup doesn't try to bundle it at build time):
```js
external: ['/pagefind/pagefind.js']
```

Do not remove this — it will break the build.

---

## Fontstand / Lyon Text

Lyon Text is loaded via **Fontstand's CDN** under a domain-licensed webfont agreement.

```html
<link rel="stylesheet" href="https://webfonts.fontstand.com/WF-099839-d89c1d499f0c1f40d1e6d7330af17f97.css" />
```

**What this means:**
- The font is licensed for `bezambar.com` only — it will not render on other domains or localhost without a separate license
- In local dev the fallback kicks in (Cormorant Garamond)
- Do not self-host Lyon Text or copy the CSS file — this would violate the license
- If the CDN stylesheet URL changes (Fontstand sends a new key), update it in `Layout.astro`

Lyon Text is used for:
- Body text (`--prose` font stack)
- Serif display headings (homepage hero h1, blog h1-h6)
- Pull quotes

Cormorant Garamond (npm, `@fontsource-variable/cormorant-garamond`) is the production fallback and the local-dev stand-in.
