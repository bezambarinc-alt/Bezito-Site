# API Routes

All routes live under `app/api/`. Every route uses Next.js Route Handlers (App Router).

## Conventions

- **Auth:** Admin routes call `getSession()` and return 401 if absent. Client portal routes call `getClientSession()`. No middleware — each route verifies independently.
- **Validation:** All POST/PATCH bodies are parsed with Zod. Invalid input → 400 with `{ error, issues? }`.
- **Errors:** `{ error: string }` with appropriate HTTP status. Never expose stack traces in production.
- **Audit:** All mutating admin + portal actions write to `audit_log` via `lib/audit.ts`.

---

## Public

### `POST /api/lead`
Inquiry lead capture. No auth required.

**Body:**
```json
{
  "name": "string (optional)",
  "email": "string (required)",
  "message": "string (optional)",
  "intent": "string (optional)",
  "sku": "string (optional)",
  "page_slug": "string (optional, alias for sku)"
}
```

**Flow:** Writes to `leads` table first (always). Then pushes to Freshsales CRM (best-effort). Returns 200 regardless of CRM outcome.

**Response:** `{ ok: true }`

---

### `POST /api/track`
Analytics page view ingestion. No auth required.

Records a page view in `page_views`. Bot detection via User-Agent. IP is daily-salted SHA-256 hashed — raw IP never stored.

---

### `GET /api/search`
Product search across Neon `products` table. Returns active products matching query.

---

### `GET /api/pages`
Returns public-facing page metadata (for client page routing).

---

## Auth — Admin

### `POST /api/auth/login`
Admin email + password login.

**Body:** `{ email, password, trustDevice? }`

**Rate limited:** 5 attempts / 15 min per IP.

**Flow:** Bcrypt compare (always runs, even on unknown email). On success, signs a JWT and sets `session` cookie (httpOnly, secure, sameSite strict, 2h TTL). If `trustDevice: true`, adds IP to `whitelisted_ips` (30-day).

**Response:** `{ ok: true, role: string }`

---

### `POST /api/auth/logout`
Deletes the `session` cookie.

---

### `POST /api/auth/pin`
Admin PIN login (second factor for whitelisted IPs).

---

## Auth — Client Portal

### `POST /api/portal/auth`
Client portal login.

**Body:** `{ email, password }`

**Rate limited:** 5 attempts / 15 min per IP.

**Flow:** Same timing-safe bcrypt pattern as admin. Sets `client_session` cookie (httpOnly, secure, sameSite lax, 8h TTL).

**Response:** `{ ok: true }`

---

### `DELETE /api/portal/auth`
Client portal logout. Destroys `client_session` cookie.

---

## Portal

### `GET /api/portal/pages`
Returns pages assigned to the authenticated client.

**Auth:** Client session required.

---

### `POST /api/portal/pages/[slug]/pin`
Generates a 4-digit cryptographically random PIN for a preview page.

**Auth:** Client session required. Page must belong to this client.

**Response:** `{ pin: string, expires: ISO8601 }` (48h TTL)

---

### `DELETE /api/portal/pages/[slug]/pin`
Revokes the current PIN for a preview page.

**Auth:** Client session required. Page must belong to this client.

---

### `POST /api/portal/requests`
Client submits a page request (product SKU + message).

**Auth:** Client session required.

---

## Preview

### `POST /api/preview/[slug]/verify-pin`
Verifies a PIN against `pages.customer_pin`. On success, sets `ba_preview_${slug}` cookie (httpOnly, 48h).

---

## Admin — Pages

### `GET /api/admin/pages`
Returns all showcase + proposal pages with client assignment and PIN status.

**Auth:** Admin session required.

---

### `PATCH /api/admin/pages/[slug]`
Updates a page's fields.

**Auth:** Admin session required.

**Body (all optional):**
```json
{
  "client_id": "number | null",
  "doc_type": "showcase | proposal",
  "status": "draft | live | archived",
  "template_id": "string (must be in TEMPLATES registry)"
}
```

**Response:** `{ ok: true }`

---

### `DELETE /api/admin/pages/[slug]`
Soft-archives a page (`status = 'archived'`). Never hard-deletes.

**Auth:** Admin session required.

---

## Admin — Clients

### `GET /api/admin/clients`
Returns all clients with page counts.

**Auth:** Admin session required.

---

### `POST /api/admin/clients`
Creates a new portal client account.

**Auth:** Admin session required.

**Body:** `{ name, slug, contact_email, password }` (password min 8 chars, hashed with bcrypt cost 10)

**Response:** `{ ok: true, id: number }`

---

### `PATCH /api/admin/clients/[id]`
Updates client fields (name, email, active status).

**Auth:** Admin session required.

---

## Admin — Products

### `PATCH /api/admin/products/[slug]`
Toggles `active` or `featured` flags on a product.

**Auth:** Admin session required.

Note: `active` and `featured` are **intentionally excluded** from the Plytix sync upsert — admin-managed only.

---

## Admin — Templates

### `POST /api/admin/templates/activate`
Sets the active template for a given scope and busts the ISR cache.

**Auth:** Admin session required.

**Body:** `{ id: string, scope: 'product' | 'proposal' | 'showcase' }`

Saves to `admin_settings`:
- `product` → key `active_product_template`
- `proposal` → key `active_proposal_template`
- `showcase` → key `active_showcase_template`

---

## Admin — Analytics

### `GET /api/admin/analytics?days=7|30|90`
Returns analytics aggregations for the given window. Default 30 days.

**Auth:** Admin session required.

**Response shape:**
```json
{
  "days": 30,
  "kpis": { "total", "unique", "today", "leadsWeek", "realtime" },
  "timeseries": [{ "day", "views", "unique" }],
  "sources": { "Direct": 0, "Organic": 0, ... },
  "geo": [{ "country", "views" }],
  "devices": [{ "device", "views" }],
  "topPages": [{ "path", "type", "views", "unique" }],
  "funnel": { "productViews", "totalLeads", "synced" }
}
```

---

## Admin — Settings

### `PATCH /api/admin/settings/pin`
Changes the admin PIN.

**Auth:** Admin session required. **Body:** `{ pin: string (min 4) }`

---

### `GET/POST /api/admin/settings/users`
Manage admin user accounts.

---

### `GET/POST/DELETE /api/admin/settings/whitelist`
Manage the server-side IP whitelist.

---

## Cron

### `GET /api/cron/plytix-sync`
Plytix → Neon products cache sync.

**Auth:** `Authorization: Bearer <CRON_SECRET>` (Vercel injects automatically) or `Bearer <BEZITO_SECRET>` (manual trigger).

**Flow:** Lists all Plytix `Completed` products → fetches detail per product → upserts to `products` table → deletes stale rows → `revalidateTag('products')`.

**Response:** `{ ok: true, listed: N, upserted: N, deleted: N, errors: [] }`

---

## Draft mode

### `GET /api/draft`
Enables Next.js draft mode for template preview. Sets `preview_template` cookie.

### `GET /api/draft/exit`
Exits draft mode.

---

## Blog import

### `POST /api/blogimport`
Bulk import blog posts from the old Astro static site. One-time use.
