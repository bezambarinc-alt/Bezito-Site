# Bez Ambar — Site Documentation

**bezambar.com** — the official website for Bez Ambar, independent fine jewelry designer and maker, Los Angeles.

This README is the entry point for design, development, brand, and integration documentation. Read it fully before touching any part of the codebase. Every decision documented here has been confirmed — do not deviate without updating the docs first.

---

## Brand & Design Philosophy

### Positioning

Bez Ambar is a **private atelier**, not a retail jeweler. The site is modeled on the presentation standard of the highest tier of the watch and jewelry world — Patek Philippe, Van Cleef & Arpels, Graff. The operative word is **exclusive**: pieces are made to order, pricing is by request, and the site is built to generate qualified inquiry, not impulse purchases.

Every design decision flows from this:
- No "Add to Cart" button exists anywhere on the site
- No prices are displayed
- The primary conversion action is **inquiry** — a human conversation, not a transaction
- Copy is editorial, not promotional
- Photography and video are the product, not decoration

### Voice

- **Spare.** Few words. Each one earns its place.
- **Authoritative.** Not aspirational copy — declarative statements about craft and material.
- **No retail language.** Never: "shop", "buy", "purchase", "deal", "sale", "affordable", "price match". Always: "inquire", "commission", "arrange", "request", "made to order".
- **Present tense.** The stone does this. The setting does that. Not "will dazzle you."
- **No superlatives without specifics.** Never "stunning" or "breathtaking." Say what the stone weighs and what the light does.

### Visual Language

- **Patek-style luxury.** High contrast, significant white space, type set in Open Sans (uppercase, tight tracking) for UI elements, Lyon Text for body and display when serif is called for.
- **Motion is information.** Cloudinary MP4 video on product cards and heroes — not for decoration, to show how the piece moves.
- **Dark and light coexist.** Homepage and collection heroes use dark cinematic backdrops. Inner pages and editorial content use warm white/paper tones.
- **No stock imagery.** Every image is either a real piece or an AI-rendered concept of a real piece.

For full typography and color specs: → [docs/typography.md](docs/typography.md) · [docs/colors.md](docs/colors.md)

---

## Inquiry Model

The site does not have a shopping cart or checkout. The entire conversion funnel is:

```
Visitor sees piece → watches video → clicks inquiry CTA → InquiryDrawer opens → form submits → FreshSales CRM → Bez/team follows up
```

### InquiryDrawer

A slide-right panel present on every page via `Layout.astro`. Opens via:

```js
window.openInquiryDrawer({ title?: string, sku?: string, intent?: string })
```

Submits to the **FreshSales Worker** at `https://bezito-forms.bezambarinc.workers.dev/api/contact`.

Form fields (visible): `name`, `email`. All other context is set programmatically.

Payload fields: `firstName`, `lastName` (split from single Name input at first space), `email`, `intent` (set programmatically), `pieceTitle`, `pieceSku`, `utmSource`, `utmMedium`, `utmCampaign`.

UTM fields are captured from the URL on page load and saved to `sessionStorage` — they're included automatically in every form submission.

### Archive Modal

The Archive page (`/archive`) has its own separate video + inquiry modal. It is **not** the global InquiryDrawer. It shows a Cloudinary MP4 on the left and the inquiry form on the right. Do not conflate the two.

---

## Key Decisions

These are the non-obvious choices with explicit rationale. Do not revisit them without updating this doc.

| Decision | Choice | Why |
|---|---|---|
| No shopping cart | Inquiry-only | Made-to-order pieces require a conversation. Cart checkout is structurally incompatible with this product. |
| Framework | Astro (static) | No user sessions, no server-side personalization, no dynamic data at runtime. Static output = best performance, simplest hosting, lowest cost. SSR adds complexity with no benefit here. |
| Search | Pagefind | No API key, no external service, zero cost, works offline. Fully client-side. Adequate for ~50–200 SKUs. |
| PXM | Plytix | Product data feeds three channels (Astro site, Klaviyo, CF Workers). A headless CMS would compromise the data model to fit the website's needs. Plytix is built for multi-channel product distribution. |
| Form proxy | CF Worker | FreshSales API key never touches the browser. Worker handles validation, rate limiting, and CRM integration server-side. |
| Form fields | Name + Email only | Lower friction = higher submit rate. All other context (piece, intent, UTM) is passed programmatically. The conversation after submission collects everything else. |
| UTM storage | `sessionStorage` | Single-session attribution. Clears on tab close. No cross-session persistence, no cookie consent requirement. |
| Video delivery | Cloudinary URL transforms | Transcoding and quality/format optimization at request time via URL params. No need to store multiple pre-encoded versions per clip. |
| Video loop | JS interrupt at `duration - 3s` | Source files stay untouched. Avoids freeze frames that appear in the final 1–2s of web-encoded MP4s. Threshold adjustable in code without re-encoding. |
| Category/collection config | Data map in page file | Config co-located with the template that renders it. Categories/collections change rarely and always require a developer; a CMS abstraction adds overhead with no editorial benefit. |
| InquiryDrawer | Always-in-DOM, hidden | Zero open latency — can be triggered from anywhere on the page. Mounting on demand would introduce a flicker on the primary conversion action. |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Astro v5 | Static output |
| Deployment | Vercel (`bezambarinc-alt`) | Auto-deploys on push to `main` |
| Search | Pagefind | Static index, built post-`astro build` |
| Fonts | Open Sans, Cormorant Garamond, Lyon Text | See [typography doc](docs/typography.md) |
| Media | Cloudinary (`dlg2mou53`) | All video + image assets |
| Forms | FreshSales Worker | CF Worker at `bezito-forms.bezambarinc.workers.dev` |
| CRM | FreshSales Enterprise | `bezambar.myfreshworks.com` |
| PXM | Plytix | Product data source of truth |
| Email | Klaviyo | Campaigns fed by Plytix product data |
| Smooth scroll | Lenis | Desktop only |
| CSS | Vanilla CSS | No framework — global design system in `global.css` |

---

## Integrations

### Plytix (PXM — Product Experience Management)

Plytix is the **single source of truth for all product data**. ~50-200 SKUs. Every product attribute lives here: title, description, stone specs, metal, video URLs, image URLs, category, collection, status.

- **API access:** active (credentials in workspace)
- **Export format:** CSV (`data/plytix-import.csv`) with columns: `slug`, `sku`, `ref_code`, `title`, `subtitle`, `category`, `collection`, `status`, `metal`, `description`, `editorial`, `stone_*` fields, `hero_video`, `hero_image`, `inquiry_subject`, `pretty_url`
- **Sync:** `scripts/sync-plytix.js` fetches from Plytix API and writes to `src/content/products/` as Astro content collection entries
- **Feeds:** Astro site (product pages), Klaviyo (campaign segmentation), CF Worker landing pages

When product data needs updating, the change goes into Plytix first, then the sync script runs. Do not hand-edit `src/content/products/` files directly.

### FreshSales (CRM)

FreshSales Enterprise is the CRM for all inquiry leads.

- **Domain:** `bezambar.myfreshworks.com`
- **API base:** `https://bezambar.myfreshworks.com/crm/sales/api`
- **Credentials:** `workspace/credentials/freshsales.json` (API key stored there)
- **Contacts:** All Contacts view ID `127026373115`
- **Lead source:** All website inquiry form submissions via the CF Worker

The CF Worker (`bezito-forms.bezambarinc.workers.dev`) receives form POSTs from the site and creates/updates FreshSales contacts + deals.

### Cloudinary

All media (video + images) is hosted on Cloudinary.

- **Account:** `dlg2mou53`
- **Video path convention:** `videos/<piece-type>/` (e.g. `archive/videos/<id>.mp4`)
- **Image transformations:** applied via URL params (`f_auto,q_auto,w_<n>`)
- **Credentials:** in workspace Controller dir
- **Uploader:** `scripts/cloudinary-upload.js`

CSP in `vercel.json` already includes `media-src https://res.cloudinary.com` and `img-src https://res.cloudinary.com`.

### Klaviyo

Email campaign platform. Fed product data from Plytix for campaign segmentation. Not yet fully integrated — planned as part of the CRM stack buildout.

### Vercel

- **Account:** `bezambarinc-alt`
- **Project:** `bezito-site`
- **Token:** `~/.openclaw/credentials/vercel.json` (expires ~2026-08-02 — rotate before then)
- **Deploys:** auto on push to `main`; preview on all branches
- **Config:** `vercel.json` at repo root — handles headers, CSP, redirects

### Pagefind

Static search index built after `astro build`. Run via `npm run build` (`astro build && pagefind --site dist`). The `SearchOverlay` component queries it client-side.

---

## Development

### Local Setup

```bash
npm install
npm run dev        # dev server at localhost:4321
npm run build      # full production build (astro + pagefind)
npm run preview    # preview built output
```

Lyon Text (Fontstand CDN) may not render in local dev if the license is domain-locked. Falls back to Cormorant Garamond automatically.

### Branch & Deploy

- All work goes to **`main`** branch in `bezambarinc-alt/Bezito-Site`
- There is no other active branch — `feat/astro-migration` is retired and must not be referenced
- Every push to `main` triggers a Vercel deploy

### Key Conventions

- Design tokens live in `:root` in `global.css` — change a token once, it cascades everywhere. Never hardcode values that have a token.
- Sans-font elements (Open Sans) are always uppercase with letter-spacing 0, controlled by `--sans-transform` and `--sans-letter-spacing` tokens. Do not add hardcoded `text-transform` or `letter-spacing` to individual sans rules.
- Dynamic pages (categories, collections) are driven by data maps inside the page file. Add a new category or collection by adding one entry to the map — no new `.astro` file.
- Product data changes go into Plytix first, then sync to `src/content/products/` — do not hand-edit content files.
- Blog is the only page type with different typography rules. See [typography doc](docs/typography.md).
- The `InquiryDrawer` is global. The Archive modal is separate. Do not conflate.
- Check `docs/` before any CSS or layout change. Update `docs/` in the same commit when a decision changes.

---

## Project Structure

```
web/bez-ambar/
├── docs/                   ← design & dev documentation (READ FIRST)
│   ├── README.md           ← docs index
│   ├── brand.md
│   ├── inquiry-model.md
│   ├── integrations.md
│   ├── typography.md
│   ├── colors.md
│   ├── layout.md
│   ├── pages.md
│   └── components.md
├── public/
│   ├── archive-data.json   ← 562 archive video entries (lazy-loaded by /archive)
│   └── robots.txt
├── src/
│   ├── content/
│   │   ├── blog/           ← blog post markdown files
│   │   └── products/       ← product data (synced from Plytix via sync-plytix.js)
│   ├── layouts/
│   │   └── Layout.astro    ← single shell for all pages
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── SearchOverlay.astro
│   │   ├── InquiryDrawer.astro
│   │   └── SocialLinks.astro
│   ├── pages/              ← one .astro per route
│   └── styles/
│       ├── global.css      ← design tokens + all component styles
│       └── templates/      ← page-type overrides (home, product, editorial, blog, contact, legal, 404)
├── astro.config.mjs
├── vercel.json             ← headers, CSP, redirects
└── package.json
```

---

## Documentation Index

| Doc | What it covers |
|---|---|
| [docs/typography.md](docs/typography.md) | Font stacks, base rules, sans tokens, hero overrides, blog exception |
| [docs/colors.md](docs/colors.md) | All CSS custom property token values |
| [docs/layout.md](docs/layout.md) | Layout.astro structure, props, global scripts |
| [docs/pages.md](docs/pages.md) | Full route map, page types, where dynamic data lives |
| [docs/components.md](docs/components.md) | All 6 components with behavior and integration notes |
