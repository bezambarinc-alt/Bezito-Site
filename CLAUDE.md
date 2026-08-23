# CLAUDE.md — Bez Ambar Next.js Site

> Read this before touching anything. Updated 2026-08-14.

---

## Branch & Repo

- **Always work on `main`** — direct push, no PRs required for normal work
- **GitHub:** `bezambarinc-alt/Bezito-Site`
- **Local:** `/home/bezito/.openclaw/workspace/web/bez-ambar`
- **Remote:** `origin → https://github.com/bezambarinc-alt/Bezito-Site.git`

Retired branches — never reference, never check out:
- `feat/astro-migration` — merged 2026-07-13
- `feat/nextjs-migration` — merged 2026-08-12

---

## Vercel Deployment

| Project | ID | Live URL |
|---|---|---|
| `bezambar-nextjs` | `prj_YIYwbBNqU7GFLwpuzWNlwGiZx475` | `bezambar-web2026.vercel.app` |

Auto-deploys on every push to `main`. Vercel token: `~/.openclaw/credentials/vercel.json`.

**Hard rule:** Never change the `bezito-site` Vercel project settings (framework, aliases, autoAssignCustomDomains).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Database | Neon Postgres — raw SQL via `pg` Pool, no ORM |
| Auth | Jose JWT — separate admin + client cookies |
| Password hashing | bcryptjs (cost 10 standard, 12 for PIN) |
| Validation | Zod on all API inputs |
| Media | Cloudinary (`dlg2mou53`) — all images + videos |
| PIM | Plytix — product data source of truth |
| CRM | Freshsales (`bezambar.myfreshworks.com`) |
| Analytics | Custom — Neon `page_views` table |
| Fonts | Lyon Text Regular (Fontstand CDN, domain-locked) + Open Sans (system stack). No Cormorant. No Google Fonts. |

---

## App Structure

```
app/
├── (public)/              # Public site — Header/Footer/Drawer chrome
│   ├── layout.tsx         # DrawerProvider + site chrome
│   ├── jewelry/[category]/[slug]/
│   │   ├── page.tsx       # Product detail — ISR 1h
│   │   └── layouts/       # Template registry + TSX layout variants
│   ├── preview/[slug]/    # PIN-gated client previews (force-dynamic)
│   └── ...
├── (admin)/admin/         # Admin dashboard
│   ├── login/             # Email + password login
│   └── (protected)/       # All auth-gated admin routes
│       ├── products/      # Product grid (Plytix cache)
│       ├── pages/         # Client pages + proposals management
│       ├── clients/       # Portal client accounts
│       ├── templates/     # Product layout templates
│       ├── analytics/     # Site analytics
│       ├── leads/         # Inquiry leads
│       └── settings/      # PIN, users, IP whitelist
├── (portal)/portal/       # Client portal
│   ├── login/             # Client login
│   └── dashboard/         # Client dashboard (pages, PIN gen, requests)
├── client/[slug]/         # Legacy PW-gated marketing pages
├── api/
│   ├── auth/              # Admin: login, logout, PIN
│   ├── portal/auth        # Client: login, logout
│   ├── portal/pages/      # Client page PIN generation
│   ├── portal/requests    # Client page requests
│   ├── admin/pages/       # CRUD — client pages
│   ├── admin/clients/     # CRUD — portal clients
│   ├── admin/products/    # Product status toggle
│   ├── admin/templates/   # Template activation
│   ├── admin/analytics/   # Analytics aggregations
│   ├── admin/settings/    # PIN + user management
│   ├── lead/              # Inquiry capture → Neon + Freshsales
│   ├── cron/plytix-sync   # Plytix → Neon (every 4h)
│   ├── track/             # Page view ingestion
│   ├── search/            # Product search
│   ├── preview/[slug]/verify-pin  # PIN verification
│   └── draft/             # Draft mode for template preview

lib/
├── db.ts              # pg Pool + sql<T>() helper — import this for all DB access
├── auth.ts            # getSession() — admin JWT from 'session' cookie
├── client-auth.ts     # getClientSession() — client JWT from 'client_session' cookie
├── queries.ts         # Product read helpers (getProductBySlug, getAllProducts, etc.)
├── audit.ts           # audit(action, actor, detail?) — all mutating actions
├── rate-limit.ts      # DB-backed rate limiter (login_attempts table)
├── whitelist.ts       # IP trust list (whitelisted_ips table)
├── geo.ts             # Geo parsing from Vercel x-vercel-ip-* headers
├── track.ts           # UA + source + path classification (pure functions)
├── page-gate.ts       # Client page password gate (ba_page_access cookie)
└── data/              # Static data files (categories, blog, story, archive, etc.)

components/layout/
├── Header.tsx         # Fixed header — hamburger + wordmark + search/concierge icons
├── MenuOverlay.tsx    # Slide-in nav — ROOT items + dynamic jewelry/atelier sub-columns
├── Footer.tsx         # Site footer
├── ConciergeDrawer.tsx  # Atelier concierge slide panel
├── InquiryDrawer.tsx    # Inquiry form slide panel
├── SearchOverlay.tsx    # Full-screen search
├── DrawerContext.tsx    # Shared drawer state (openMenu, openSearch, openConcierge, etc.)
├── NavMenuData.tsx      # Server component — fetches Neon data for menu
├── ProdPill.tsx         # Floating product pill (shown on product pages)
└── DraftModeBanner.tsx  # Admin-only draft mode indicator
```

---

## Hard Rules

- **No public mention of "Alara Cut"** — patent pending (USPTO 30/004,203), not yet granted. Never in copy, meta tags, schema.org, page titles, or any user-visible output. Acceptable cuts: Princess Cut, Blaze®, Elysian Cut™.
- **No secrets in the repo** — all API keys/tokens via environment variables only.
- **Cloudinary URLs only** — never commit image/video binary files.
- **Raw SQL, parameterized queries** — `sql<T>(text, params?)` from `lib/db.ts`. No string concatenation in SQL. No ORM.
- **Audit all mutating actions** — admin + portal mutations go through `audit()` from `lib/audit.ts`.
- **Lead durability** — always write to Neon before CRM push. CRM failure must never cause a 500.
- **No `as never` hacks** — if a type needs a new union member, add it to `AuditAction` in `lib/audit.ts`.

---

## ⚠️ Next.js 16 — Things Agents Get Wrong

These rules exist because AI agents consistently apply stale Next.js conventions from training data. Read each one before writing any code.

### 1. Middleware filename is `proxy.ts` — NOT `middleware.ts`

Next.js 16 renamed the middleware file. `middleware.ts` is the **old convention** and is NOT compiled by the framework. The correct file is `proxy.ts` at the repo root.

- `PROXY_FILENAME = 'proxy'` is hardcoded in `node_modules/next/dist/lib/constants.js`
- The function must be a **default export** (`export default async function`) — the function name does not matter
- `export const config = { matcher: [...] }` is the correct export for route matching
- **There must never be a `middleware.ts` in this project.** If you see one, it is a bug.
- Our `proxy.ts` handles: `ba_sid` session cookie, analytics `logView()`, admin JWT gate, portal JWT gate

### 2. Vercel env vars — never audit from `.env.local`

`.env.local` is a local dev file. Production values live in Vercel. Before declaring an env var "missing":
- Hit the Vercel API: `GET /v1/projects/{projectId}/env` with the token at `~/.openclaw/credentials/vercel.json`
- All critical vars are set in Vercel production: `DATABASE_URL`, `JWT_SECRET`, `FRESHSALES_API_KEY`, `CRON_SECRET`, `APP_URL`, `BEZITO_SECRET`, `PLYTIX_API_KEY`, `PLYTIX_API_PASSWORD`, `TRACK_SECRET`, `CLOUDINARY_*`, `ADMIN_*`

### 3. Font stack — no Cormorant Garamond anywhere

Cormorant Garamond has been fully removed. The correct stack:

| Role | Value | CSS var |
|------|-------|---------|
| Editorial/serif | `'Lyon Text Regular', Georgia, serif` | `var(--ba-font-editorial)` |
| Body/sans | `'Open Sans', Helvetica, Arial, sans-serif` | `var(--ba-font-sans)` |

- Lyon Text Regular is served by **Fontstand** (domain-locked CDN via `<link>` in `app/layout.tsx`)
- The Fontstand `<link>` must NOT have `referrerPolicy="no-referrer"` — that strips the `Referer` header and causes Fontstand's license check to 403
- Never add Cormorant, Playfair Display, or Inter to this project

### 4. CTA pattern — InquiryDrawer, never hard `/contact` links

All public-page CTAs open the `InquiryDrawer` with a pre-filled intent. Zero hard navigation to `/contact` on any public page.

- Use `<InquiryButton intent="..." label="..." />` from `components/layout/InquiryButton.tsx`
- Valid intents are in `lib/data/inquiry-constants.ts`
- The ConciergeDrawer is the concierge panel (top-level). It passes through to InquiryDrawer for specific intents.
- `PageCta` component supports `drawer + intent` props for server pages

### 5. Button aesthetic — ghost pill, no gold fills

This project follows a Patek-style ghost pill system. No gold-filled buttons anywhere.

- **Light bg context:** ink ghost pill (black border + text, transparent → slight fill on hover)
- **Dark bg context:** white ghost pill (white border + text, transparent → 7% white fill on hover)
- Floating `ProdPill`: white/96 outer pill + inner ghost ink pill → solid ink fill on hover

---

## Database (Neon Postgres)

Connection via `DATABASE_URL`. Pool in `lib/db.ts` — shared across all routes, Vercel drains it cleanly.

Key tables:

| Table | Purpose |
|---|---|
| `products` | Plytix read cache — **never write manually**, rebuilt by cron |
| `pages` | Client pages + proposals (`blocks` JSONB, `doc_type`, `template_id`) |
| `clients` | Portal client accounts |
| `leads` | Inquiry leads — durable, written before CRM call |
| `admin_users` | Dashboard accounts |
| `admin_settings` | Key-value config (`admin_pin`, `active_product_template`, `active_showcase_template`) |
| `audit_log` | All mutating actions (admin + portal) |
| `page_views` | Analytics hits — bot-filtered, daily-salted IP hash |
| `login_attempts` | Rate-limit tracking (5 attempts / 15 min) |
| `whitelisted_ips` | IP trust list for progressive auth (30-day expiry) |
| `blog_posts` | Journal/blog content |
| `archive` | Legacy product archive (GIFs + video) |
| `generations` | AI generation log (Kevin's debug tools) |

Schema reference: `db/schema.sql`. Migrations: `db/migrations/NNN_description.sql`.

Apply a migration: `psql $DATABASE_URL -f db/migrations/NNN_name.sql`

---

## Auth Model

Three independent layers — separate cookies, separate JWT payloads:

| Layer | Cookie | TTL | Verify with |
|---|---|---|---|
| Admin | `session` | 2h | `getSession()` in `lib/auth.ts` |
| Client portal | `client_session` | 8h | `getClientSession()` in `lib/client-auth.ts` |
| Preview PIN | `ba_preview_${slug}` | 48h (PIN expiry) | Manual check in `preview/[slug]/page.tsx` |

Rate limiting applies to all login endpoints: 5 attempts / 15 min per IP.

---

## Template System

Product page layouts live in `app/(public)/jewelry/[category]/[slug]/layouts/`.

- **Registry:** `layouts/index.ts` — `TEMPLATES` object. Add new layout variants here.
- **Active template (global):** `admin_settings.active_product_template` for product pages; `active_showcase_template` for preview pages.
- **Per-page override:** `pages.template_id` — takes precedence over global setting.
- **Admin UI:** `/admin/templates` — preview + activate per scope (product / proposal / showcase).
- **Currently registered:** `default` only (as of 2026-08-14).

To add a new layout: write the TSX file implementing `ProductLayoutProps`, add to `TEMPLATES`, commit. It auto-appears in the admin template picker.

---

## Product Sync (Plytix → Neon)

`GET /api/cron/plytix-sync` — runs every 4h via Vercel cron (`vercel.json`).

- Authenticates with Plytix, lists all `Completed` products
- Fetches full attributes per product (separate detail endpoint — search returns empty attrs)
- Upserts into `products` table
- `active` and `featured` columns are **excluded from the upsert** — managed in admin only
- Deletes stale rows not returned by Plytix this run
- `revalidateTag('products')` busts ISR cache after sync

Manual trigger: `GET /api/cron/plytix-sync` with `Authorization: Bearer <BEZITO_SECRET>`.

---

## Environment Variables

See `.env.example` for the full list. Minimum for local dev:
- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — 32+ char random string (shared by admin + client JWT)
- `CRON_SECRET` — Vercel cron auth secret

---

## Common Commands

```bash
npm run dev      # Dev server → http://localhost:3000
npm run build    # Production build (catches type errors)
npm run lint     # ESLint
```

---

## Key URLs

| What | URL |
|---|---|
| Live site | `bezambar-web2026.vercel.app` (→ `bezambar.com` after DNS cutover) |
| Admin dashboard | `/admin` |
| Client portal | `/portal` |
| Bez × Kevin working page | https://bezito.co/page/bez-kevin (PW: 1465) |
| Galleries / bezito.co | https://bezito.co |

---

## Working With Bezito

Bezito has full context on this project. Ask for:
- Cloudinary asset URLs
- Plytix product data
- Deploy status / Vercel logs
- DB queries + migrations
- Any code changes

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
