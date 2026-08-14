# Database

**Neon Postgres.** Raw SQL only — no ORM. All queries go through `lib/db.ts`.

---

## Connection

```typescript
// lib/db.ts — import this everywhere
import { sql } from '@/lib/db'

const rows = await sql<{ name: string }>(
  `SELECT name FROM products WHERE sku = $1`,
  [sku],
)
```

`sql<T>()` returns `T[]`. Always parameterized — never concatenate values into the query string.

Pool configuration: `max: 10` connections. `attachDatabasePool(pool)` lets Vercel drain idle connections cleanly before suspending the function (Fluid compute).

---

## Schema

Full schema: `db/schema.sql`. Apply migrations in order from `db/migrations/`.

---

## Table reference

### `products`
Plytix read cache. **Never write manually** — rebuilt by the cron sync every 4h.

| Column | Type | Notes |
|---|---|---|
| `sku` | TEXT PK | Plytix SKU (e.g. `C0493`) |
| `slug` | TEXT UNIQUE | URL-safe (generated from SKU at sync time) |
| `plytix_id` | TEXT UNIQUE | Plytix internal UUID |
| `name` | TEXT | Display name (from Plytix `label`) |
| `category` | TEXT | `rings`, `bracelets`, `earrings`, `necklaces`, `pendants`, `bands` |
| `subtitle` | TEXT | Secondary descriptor |
| `editorial` | TEXT | Long editorial copy |
| `description` | TEXT | Short factual description |
| `hero_visual` | TEXT | Cloudinary URL — mp4 video or image |
| `editorial_visual` | TEXT | Cloudinary URL — poster/thumbnail |
| `metal` | TEXT | e.g. `18k Yellow Gold` |
| `stone_shape` | TEXT | e.g. `Princess`, `Round`, `Emerald` |
| `stone_carats` | TEXT | Display carat string |
| `stone_clarity` | TEXT | Diamond clarity grade |
| `stone_color` | TEXT | Diamond color grade or gemstone color |
| `stone_notes` | TEXT | Free-text stone context |
| `total_carat_weight` | NUMERIC(8,3) | |
| `center_stone_weight` | NUMERIC(8,3) | |
| `collection` | TEXT | Collection name if applicable |
| `active` | BOOLEAN | Show on public site — managed in admin, NOT overwritten by sync |
| `featured` | BOOLEAN | Appears in 'From the Atelier' nav — managed in admin, NOT overwritten by sync |
| `sort_order` | INTEGER | Manual sort within category |
| `view_1_url` | TEXT | Three-views image 1 (Cloudinary) |
| `view_2_url` | TEXT | Three-views image 2 |
| `view_3_url` | TEXT | Three-views image 3 |
| `synced_at` | TIMESTAMPTZ | Last Plytix sync timestamp |

Indexes: `(active, featured DESC, sort_order ASC)`, `(category)`.

---

### `pages`
Client-facing pages and proposals created by admin or Bezito.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `slug` | TEXT UNIQUE | URL-safe, `^[a-z0-9-]+$` |
| `tenant` | TEXT | Default `bezambar` |
| `title` | TEXT | Display title |
| `blocks` | JSONB | Content blocks array `[{ type, ... }]` |
| `status` | TEXT | `draft` \| `live` \| `archived` |
| `doc_type` | TEXT | `showcase` \| `proposal` |
| `client_id` | INT FK→clients | Assigned retail client (nullable) |
| `template_id` | TEXT | Per-page layout override (nullable) |
| `customer_pin` | TEXT | 4-digit PIN for preview access (nullable) |
| `pin_expires_at` | TIMESTAMPTZ | PIN expiry (nullable) |
| `password` | TEXT | Legacy page-gate password (nullable) |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

---

### `clients`
Portal client accounts (retail partners).

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `slug` | TEXT UNIQUE | URL-safe identifier |
| `name` | TEXT | Display name (e.g. `Polacheck's`) |
| `contact_email` | TEXT | Login email |
| `password_hash` | TEXT | bcrypt hash (cost 10) |
| `active` | BOOLEAN | Must be true to allow login |
| `created_at` | TIMESTAMPTZ | |

---

### `leads`
Inquiry leads. Written before CRM push — durable copy.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `page_slug` | TEXT FK→pages.slug | If from a specific page (nullable) |
| `sku` | TEXT | Product SKU if inquiry is piece-specific (nullable) |
| `intent` | TEXT | e.g. `consultation`, `inquiry` (nullable) |
| `name` | TEXT | (nullable) |
| `email` | TEXT | Required |
| `message` | TEXT | Free text (nullable) |
| `crm_status` | TEXT | `pending` \| `synced` \| `failed` |
| `crm_id` | TEXT | Freshsales contact ID if synced (nullable) |
| `created_at` | TIMESTAMPTZ | |

---

### `admin_users`
Admin dashboard accounts.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `email` | TEXT UNIQUE | Login email |
| `password_hash` | TEXT | bcrypt hash |
| `role` | TEXT | `bez` \| `kevin` \| `admin` |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `admin_settings`
Key-value config table.

| Key | Value |
|---|---|
| `admin_pin` | bcrypt hash of the current admin PIN |
| `active_product_template` | Template ID for product pages (default: `default`) |
| `active_proposal_template` | Template ID for proposal pages |
| `active_showcase_template` | Template ID for client preview pages |

---

### `audit_log`
Immutable record of all mutating admin + portal actions.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `actor` | TEXT | Email of the user who performed the action |
| `action` | TEXT | `AuditAction` enum value (see `lib/audit.ts`) |
| `target` | TEXT | (nullable) |
| `detail` | JSONB | Additional context (nullable) |
| `created_at` | TIMESTAMPTZ | |

Audit actions are typed — see `lib/audit.ts` for the full `AuditAction` union. **Never use `as never`** to bypass the type — add the action to the union instead.

---

### `page_views`
Analytics. Bot-filtered at query time (not insert time).

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `path` | TEXT | URL path (e.g. `/jewelry/rings/c0493`) |
| `page_type` | TEXT | `home`, `product`, `category`, `blog`, etc. |
| `sku` | TEXT | Product SKU if product page (nullable) |
| `ip_hash` | TEXT | Daily-salted SHA-256 (8 bytes) — raw IP never stored |
| `country` | TEXT | From Vercel `x-vercel-ip-country` header |
| `device` | TEXT | `desktop`, `mobile`, `tablet`, `bot` |
| `browser` | TEXT | |
| `os` | TEXT | |
| `source` | TEXT | `Direct`, `Organic`, `Social`, `Email`, `Referral` |
| `referer` | TEXT | (nullable) |
| `is_bot` | BOOLEAN | |
| `viewed_at` | TIMESTAMPTZ | |

Indexes: `(path, viewed_at)`, `(is_bot, viewed_at)`, `(ip_hash, viewed_at)`.

---

### `login_attempts`
Rate limiting. One row per login attempt per IP.

| Column | Type |
|---|---|
| `id` | BIGSERIAL PK |
| `ip` | TEXT |
| `success` | BOOLEAN |
| `attempted_at` | TIMESTAMPTZ (default now()) |

Window: 15 minutes. Max attempts before lockout: 5.

---

### `whitelisted_ips`
Server-side IP trust list for progressive auth (PIN-only login on trusted devices).

| Column | Type | Notes |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `ip_address` | TEXT UNIQUE | |
| `label` | TEXT | Human-readable location (nullable) |
| `expires_at` | TIMESTAMPTZ | Default now() + 30 days |
| `created_at` | TIMESTAMPTZ | |

---

### `blog_posts`
Journal/blog content. Populated by `/api/blogimport` (one-time migration from Astro).

---

### `archive`
Legacy product archive — 559 animated GIFs + video drawer content.

---

### `generations`
AI generation log for Kevin's debug tools. Not used in the public site.

---

## Migration guide

1. Write the SQL in `db/migrations/NNN_description.sql` (increment NNN)
2. Apply: `psql $DATABASE_URL -f db/migrations/NNN_description.sql`
3. Update `db/schema.sql` to reflect the new state
4. Document any new columns in this file

**Never apply migrations to production without testing on a local/staging Neon branch first.**
