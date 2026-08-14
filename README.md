# Bez Ambar — bezambar.com

Official website for **Bez Ambar**, independent fine jewelry designer and maker, Los Angeles.
Next.js 15 App Router · Neon Postgres · Vercel.

---

## What this is

The site serves three audiences:

| Audience | Entry point | What they do |
|---|---|---|
| **Public visitors** | `/` | Browse pieces, read editorial, submit inquiries |
| **Admin (Bez/Kevin)** | `/admin` | Manage products, client pages, templates, analytics |
| **Retail partners** | `/portal` | View proposals, share PIN-gated previews with customers |

**No cart. No checkout. No prices.** Every CTA leads to a human conversation.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Database | Neon Postgres — raw SQL via `pg`, no ORM |
| Auth | Jose JWT — separate admin + client session cookies |
| PIM | Plytix (product data source of truth) |
| CRM | Freshsales — inquiry leads |
| Media | Cloudinary `dlg2mou53` — all images + video |
| Deployment | Vercel `bezambar-nextjs` — auto-deploys on push to `main` |
| Fonts | Cormorant Garamond + Open Sans (next/font) · Lyon Text (Fontstand CDN) |

---

## Local development

```bash
# 1. Clone + install
git clone https://github.com/bezambarinc-alt/Bezito-Site.git
cd Bezito-Site
npm install

# 2. Environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET, CRON_SECRET at minimum

# 3. Apply DB schema (first time only)
psql $DATABASE_URL -f db/schema.sql

# 4. Start
npm run dev     # → http://localhost:3000
npm run build   # production build (catches TS errors)
npm run lint    # ESLint
```

---

## Project structure

```
app/
├── (public)/                  # Public site — Header/Footer/Drawers chrome
│   ├── jewelry/[category]/[slug]/
│   │   ├── page.tsx           # Product detail (ISR 1h)
│   │   └── layouts/           # Template registry + TSX layout variants
│   ├── preview/[slug]/        # PIN-gated client previews (force-dynamic)
│   └── ...                    # Homepage, collection, archive, blog, about, etc.
├── (admin)/admin/             # Admin dashboard (/admin/*)
│   ├── login/                 # Email + password
│   └── (protected)/           # Auth-gated routes
│       ├── products/          # Product grid + status toggle
│       ├── pages/             # Client pages + proposals
│       ├── clients/           # Portal client accounts
│       ├── templates/         # Layout template management
│       ├── analytics/         # Traffic + lead analytics
│       ├── leads/             # Inquiry lead log
│       └── settings/          # PIN, users, IP whitelist
├── (portal)/portal/           # Client portal (/portal/*)
│   ├── login/
│   └── dashboard/             # Pages, PIN generation, page requests
├── client/[slug]/             # Legacy PW-gated marketing pages
└── api/                       # All API routes (see docs/api.md)

components/
├── layout/                    # Header, Footer, MenuOverlay, Drawers, SearchOverlay
├── blocks/                    # Content blocks (HeroSplit, SpecAccordion, etc.)
├── product/                   # ProductCard, ProductGrid, ProductGallery
└── common/                    # FadeIn, LazyVideo, ScrollWipeCarousel

lib/
├── db.ts                      # pg Pool + sql<T>() — all DB access goes here
├── auth.ts                    # Admin JWT (getSession)
├── client-auth.ts             # Client JWT (getClientSession)
├── queries.ts                 # Product read helpers
├── audit.ts                   # Audit log
├── rate-limit.ts              # DB-backed rate limiter
└── ...

db/
├── schema.sql                 # Full schema (apply manually with psql)
└── migrations/                # Numbered SQL migrations (001–NNN)

docs/                          # Technical documentation (read before changing things)
```

---

## Key workflows

### Product appears on the site
1. Update/add product in Plytix (source of truth)
2. Trigger sync: `GET /api/cron/plytix-sync` with `Authorization: Bearer <BEZITO_SECRET>`
   — or wait for the automatic 4h cron
3. Product appears in `/jewelry/[category]/[slug]`

### Client receives a preview
1. Admin creates a client in `/admin/clients`
2. Admin assigns a page to the client in `/admin/pages`
3. Client logs into `/portal`, generates a 4-digit PIN, shares `/preview/[slug]`
4. Customer enters PIN → views the piece in full product template

### Add a new product layout template
1. Write a TSX component implementing `ProductLayoutProps` (see `layouts/types.ts`)
2. Register it in `app/(public)/jewelry/[category]/[slug]/layouts/index.ts`
3. Push to `main` — it appears in `/admin/templates` as a draft
4. Activate via the admin UI

### Apply a DB migration
```bash
psql $DATABASE_URL -f db/migrations/NNN_description.sql
```

---

## Documentation

| Doc | Contents |
|---|---|
| [CLAUDE.md](CLAUDE.md) | AI agent context — hard rules, structure, auth model, DB |
| [docs/architecture.md](docs/architecture.md) | System design, data flow, caching |
| [docs/api.md](docs/api.md) | All API routes — method, auth, params, response |
| [docs/auth.md](docs/auth.md) | Auth model — admin, client portal, preview PIN |
| [docs/db.md](docs/db.md) | Database schema + table reference |
| [docs/integrations.md](docs/integrations.md) | Plytix, Freshsales, Cloudinary |
| [docs/brand.md](docs/brand.md) | Brand positioning, voice, hard copy rules |
| [docs/colors.md](docs/colors.md) | CSS design tokens |
| [docs/typography.md](docs/typography.md) | Font stacks + usage |
| [docs/components.md](docs/components.md) | Component catalog |
