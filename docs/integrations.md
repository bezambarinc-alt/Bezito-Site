# Integrations

Five external systems. Each has a specific role — they do not overlap.

| System | Role | Credentials |
|---|---|---|
| **Neon** | Primary database | `DATABASE_URL` env var |
| **Plytix** | Product data source of truth (PIM) | `PLYTIX_API_KEY` + `PLYTIX_API_PASSWORD` |
| **Freshsales** | CRM — all inquiry leads | `FRESHSALES_API_KEY` |
| **Cloudinary** | All video + image media | Credentials in workspace Controller dir |
| **Vercel** | Hosting + auto-deployment | Token at `~/.openclaw/credentials/vercel.json` |
| **Fontstand** | Lyon Text font CDN license | Domain-locked CDN — no credentials needed |

---

## Plytix (PIM)

**Plytix** is the single source of truth for all product data. Nothing about a product should be changed anywhere other than Plytix. The Neon `products` table is a read cache — rebuilt by cron, never written manually.

### Auth

Plytix uses a short-lived Bearer token obtained per session:

```
POST https://auth.plytix.com/auth/api/get-token
Body: { api_key, api_password }
Response: { data: [{ access_token }] }
```

Note: the token is at `data[0].access_token` (not `.token`) — a documented Plytix quirk.

### Sync flow

```
GET /api/cron/plytix-sync (every 4h via Vercel cron)
  │
  ├─ Auth → get access_token
  ├─ POST /products/search (paginated, page_size=100, filter: status=Completed)
  │    ← Returns product IDs + labels only. Attributes always come back EMPTY here.
  ├─ For each ID: GET /products/{id}
  │    ← Returns full attributes (description, editorial, hero_visual, metal, stone_*, etc.)
  ├─ For each ID: GET /products/{id}/categories (taxonomy link → category name)
  ├─ Upsert into Neon products table
  │    ← active + featured excluded from ON CONFLICT UPDATE (admin-managed)
  ├─ Delete stale rows (not returned by Plytix this run)
  └─ revalidateTag('products') → bust ISR product page cache
```

Rate limiting: Plytix 429s on rapid GETs. The sync uses 200ms sleep between products and exponential backoff (up to 6 retries, 1500ms×attempt) on 429.

Function timeout: `export const maxDuration = 300` — 66 products + sequential fetches + upserts exceeds the default 10s limit.

### Plytix data model quirks

- `POST /products/search` → attributes always empty, use for IDs only
- `GET /products/{id}` → real attributes live here
- Categories live in a taxonomy (not an attribute) — fetch via `/products/{id}/categories`
- `featured` attribute: may be boolean, string `'true'`, or other truthy value — normalize on read

### Category attribute

Products use a single-select `category` attribute in Plytix (added 2026-08-08). The sync prefers this over the taxonomy link. Fallback order: `attribute.category` → taxonomy link → `'jewelry'`.

---

## Freshsales (CRM)

Freshsales Enterprise handles all inquiry leads.

- **Domain:** `bezambar.myfreshworks.com`
- **API base:** `https://bezambar.myfreshworks.com/crm/sales/api`
- **Auth:** `Authorization: Token token=<FRESHSALES_API_KEY>`

### Lead flow

```
POST /api/lead (browser → Next.js)
  │
  ├─ Validate email
  ├─ INSERT INTO leads (always succeeds first)
  └─ POST https://bezambar.myfreshworks.com/crm/sales/api/contacts (best-effort)
       │
       ├─ Success: UPDATE leads SET crm_status='synced', crm_id=contact.id
       └─ Failure: UPDATE leads SET crm_status='failed'
           (lead is safe in Neon — CRM failure is non-fatal)
```

The browser never calls Freshsales directly. The API key never appears in client-side code.

### Freshworks integrations (pending)

Full Freshworks integration (chat widget, live visitor tracking) is planned but not yet implemented. The Freshchat widget was evaluated and removed (2026-08-12). The CSP in `next.config.ts` includes Freshworks domains for the remaining CRM API calls from `/api/lead`.

---

## Cloudinary

All media (video + images) is hosted on Cloudinary and served via Cloudinary's CDN.

- **Account ID:** `dlg2mou53`
- **CSP:** `next.config.ts` already includes `res.cloudinary.com` in `img-src` and `media-src`

### URL patterns

Images:
```
https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_800/<public-id>
```

Video:
```
https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/<public-id>.mp4
```

Still poster from video (used as `heroPosterUrl`):
```
https://res.cloudinary.com/dlg2mou53/video/upload/so_1.0,f_jpg,w_1200,c_fit/<public-id>.jpg
```

### Folder structure

See `memory/cloudinary-folder-structure.md` for the full canonical map:

- `Jewelry Images/<Category>/` — product photos
- `Jewelry Videos/<Category>/` — product videos
- `Studio/prompt-creations/<category>/` — AI-generated images
- `Archive/` — legacy GIFs (559) + pre-2026 video masters

Never commit image/video binary files to the repo. Always use Cloudinary URLs.

### Video vs image detection

`rowToProduct()` in `lib/queries.ts` detects video vs image by URL:
1. If URL has image extension (`.jpg`, `.jpeg`, `.png`, `.webp`) → always image
2. If URL has video extension (`.mp4`, `.webm`, `.mov`) → video
3. If path contains `/video/upload/` → video (fallback)

This handles the case where a still image lives under `/video/upload/` in Cloudinary (common for product photos uploaded through the video pipeline).

---

## Vercel

- **Account:** `bezambarinc-alt`
- **Project:** `bezambar-nextjs` (`prj_YIYwbBNqU7GFLwpuzWNlwGiZx475`)
- **Token:** `~/.openclaw/credentials/vercel.json`
- **Live URL:** `bezambar-web2026.vercel.app`
- **Auto-deploys:** every push to `main`
- **Fluid compute:** enabled (supports long-running functions up to 300s)
- **Neon:** provisioned via Vercel Marketplace

`vercel.json` controls:
- Cron schedule (`/api/cron/plytix-sync` every 4h)

Security headers + CSP are set in `next.config.ts` (not `vercel.json`).

---

## Fontstand / Lyon Text

Lyon Text is loaded via Fontstand CDN under a domain-licensed webfont agreement:

```html
<link rel="stylesheet" href="https://webfonts.fontstand.com/WF-099839-d89c1d499f0c1f40d1e6d7330af17f97.css" />
```

- Licensed for `bezambar.com` only — will not render on other domains or localhost
- In local dev the fallback kicks in (Cormorant Garamond)
- Do not self-host or copy the CSS file — violates the license
- If Fontstand sends a new key URL, update it in `app/layout.tsx`
