# Architecture

## System overview

```
Browser
  │
  ├─► Vercel (Next.js 15 App Router)
  │     ├─► Server Components → Neon Postgres (read)
  │     ├─► API Routes → Neon Postgres (read/write)
  │     └─► API Routes → Plytix (read, sync cron)
  │                    → Freshsales (write, best-effort)
  │
  ├─► Cloudinary CDN (media delivery — images + video)
  └─► Fontstand CDN (Lyon Text font license)
```

---

## Request lifecycle

### Public product page (`/jewelry/[category]/[slug]`)
1. Next.js checks ISR cache (`revalidate: 3600` — 1 hour)
2. Cache miss → Server Component fetches product via `getProductBySlug()` → Neon query
3. Reads `admin_settings.active_product_template` (cached with tag `product-template`)
4. Renders the active `Layout` component (default or variant)
5. JSON-LD `Product` schema injected in `<script type="application/ld+json">`
6. Response cached at Vercel edge for 1h

### Admin dashboard request
1. `(admin)/(protected)/layout.tsx` calls `getSession()` — verifies `session` JWT cookie
2. Invalid/missing → `redirect('/admin/login')`
3. Every admin API route independently re-verifies the session (no middleware shortcut)
4. All mutating actions call `audit()` to write to `audit_log`

### Client portal request
1. `(portal)/portal/dashboard/page.tsx` calls `getClientSession()` — verifies `client_session` JWT
2. Invalid/missing → redirect to `/portal/login`
3. Dashboard loads client's pages from Neon

### Preview page (`/preview/[slug]`)
1. `force-dynamic` — never cached (PIN state changes between requests)
2. Fetches page from Neon: must be `status = 'live'` and `doc_type = 'showcase'`
3. Not found or wrong status → `notFound()`
4. Admin bypass: `?tpl=<id>` + valid `session` cookie → skip PIN, use specified template
5. PIN check: if `customer_pin` set and not expired, look for `ba_preview_${slug}` cookie
6. Cookie absent → render `<PinGate>` (client-side PIN entry component)
7. Cookie present → fetch product by SKU from blocks, render via template layout

### Lead capture (`POST /api/lead`)
1. Validate email (basic regex — intentionally minimal, reduces false negatives)
2. Check if `sku` is a real page slug (FK lookup) — write `fkPageSlug` only if valid
3. `INSERT INTO leads` — **always succeeds first** (durable write)
4. Push to Freshsales API (best-effort) — update `crm_status` to `synced` or `failed`
5. Return 200 regardless of CRM outcome — lead is never lost

### Analytics hit (`POST /api/track`)
1. Parse User-Agent → device, browser, OS, bot flag
2. Classify source from UTM params + Referer
3. Classify path → page type + SKU
4. Daily-salted SHA-256 hash of IP (privacy-first — raw IP never stored)
5. Insert into `page_views` — bots are flagged but still stored (filtered at query time)

---

## Caching strategy

| Data | Strategy | Bust trigger |
|---|---|---|
| Product pages (`/jewelry/*`) | ISR 1h | `revalidateTag('products')` after Plytix sync |
| Active product template | `unstable_cache` tagged `product-template` | `revalidatePath('/jewelry', 'layout')` on template activate |
| Active showcase template | Fetched fresh per preview request | n/a (force-dynamic) |
| Category listing pages | ISR 1h | — |
| Preview pages | `force-dynamic` (no cache) | — |
| Admin + portal | `force-dynamic` (no cache) | — |
| Homepage | ISR (default) | — |

---

## Background jobs

| Job | Schedule | Endpoint | Auth |
|---|---|---|---|
| Plytix → Neon sync | Every 4h | `GET /api/cron/plytix-sync` | Vercel cron Bearer token or BEZITO_SECRET |

Vercel cron config lives in `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/plytix-sync", "schedule": "0 */4 * * *" }] }
```

---

## Data flow

```
Plytix (PIM — source of truth for products)
    ↓  every 4h (GET /api/cron/plytix-sync)
Neon: products table (read cache — never write manually)
    ↓  via lib/queries.ts
Server Components → product pages, category pages, nav menu

User inquiry form
    ↓  POST /api/lead
Neon: leads table (durable)
    ↓  best-effort push
Freshsales CRM

Browser page views
    ↓  POST /api/track
Neon: page_views table
    ↓  aggregated by GET /api/admin/analytics
Admin analytics dashboard

Admin mutating action
    ↓  API route
Neon: target table + audit_log entry
```

---

## Security model

### Auth
- Admin JWT: HS256, signed with `JWT_SECRET`, 2h TTL, `httpOnly` + `secure` + `sameSite: strict`
- Client JWT: HS256, same secret, 8h TTL, `sameSite: lax` (portal UX requires lax)
- Preview PIN: 4-digit cryptographically random (`node:crypto` `randomInt`), 48h window

### Rate limiting
All login endpoints (admin + client portal): 5 attempts / 15 min per IP. DB-backed via `login_attempts` table. Returns `429` with `Retry-After: 900`.

### Input validation
All API routes validate input with Zod before any DB operation. Invalid input returns 400 with issue details (admin routes) or a generic error (public routes).

### SQL injection prevention
All queries use parameterized statements via the `sql<T>(text, params[])` helper. No string concatenation in SQL.

### CSP
Configured in `next.config.ts`. Allows Cloudinary (media), Freshworks (CRM), Fontstand (fonts). `unsafe-eval` only in development.

### Timing attacks
Bcrypt comparison always runs even when the email doesn't match (dummy hash). Prevents timing side-channel that reveals email existence.

---

## Route groups

| Group | Path prefix | Auth | Chrome |
|---|---|---|---|
| `(public)` | `/`, `/jewelry/*`, `/blog/*`, etc. | None | Header + Footer + Drawers |
| `(admin)` | `/admin/*` | Admin JWT | Admin sidebar |
| `(portal)` | `/portal/*` | Client JWT | Portal header only |
| Root | `/client/*`, `/preview/*` | Page-gate / PIN | None |
