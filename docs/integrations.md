# Integrations

Five external systems. Each has a specific role — they do not overlap.

| System | Role | Credentials |
|---|---|---|
| **Neon** | Primary database | `DATABASE_URL` env var |
| **Zoho CRM** | Product PIM + lead CRM | `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` |
| **Cloudinary** | All video + image media | Credentials in workspace Controller dir |
| **Vercel** | Hosting + auto-deployment | Token at `~/.openclaw/credentials/vercel.json` |
| **Fontstand** | Lyon Text font CDN license | Domain-locked CDN — no credentials needed |

---

## Zoho CRM (PIM + CRM)

Zoho CRM serves two roles: **product data source of truth** (via Products module) and **lead CRM** (via Leads module). Replaced Plytix (PIM) on 2026-08-31 and Freshsales (CRM) on 2026-08-28.

### Auth

OAuth 2.0 with a long-lived refresh token. The token exchange is handled by `lib/zoho-auth.ts`:

```
POST https://accounts.zoho.com/oauth/v2/token
Body: { grant_type: 'refresh_token', client_id, client_secret, refresh_token }
Response: { access_token, expires_in }
```

Token is cached in memory with a TTL buffer. Every Zoho API call goes through `lib/zoho-auth.ts` — never call the Zoho API directly without it.

**Env vars required in Vercel (`bezambar-nextjs` project):**
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- DC is US (`accounts.zoho.com`) — if org moves DC, add `ZOHO_ACCOUNTS_URL`

### Product sync (PIM)

```
GET /api/cron/pim-sync (every 4h via Vercel cron)
  │
  ├─ Authenticate → get access_token
  ├─ GET /crm/v6/Products (paginated, Product_Active=true)
  ├─ For each product: derive SEO slug via deriveSlug(Product_Name, category)
  ├─ Upsert into Neon products table
  │    ← active + featured excluded from ON CONFLICT UPDATE (admin-managed)
  ├─ Delete stale rows (not returned by Zoho this run, unless zoho_id starts with 'pending-')
  └─ revalidatePath('/jewelry', 'layout') → bust ISR product page cache
```

Slug formula: `Product_Name` parts split on `|`, joined + singular category keyword appended + SKU collision fallback.

Function timeout: `export const maxDuration = 300` — 98 products + upserts exceeds the default limit.

### Zoho CRM Products field mapping

| Zoho CRM field | Neon column | Notes |
|---|---|---|
| `id` | `zoho_id` | Zoho record ID |
| `Product_Code` | `sku` | Primary key |
| `Product_Name` | `name` | `"NAME \| Variant"` format |
| `Product_Category` | `category` | Title-case in Zoho → lowercase in Neon |
| `Subtitle` | `subtitle` | |
| `Editorial` | `editorial` | |
| `Metal` | `metal` | |
| `Stone_Shape` | `stone_shape` | |
| `Stone_Color` | `stone_color` | |
| `Stone_Clarity` | `stone_clarity` | |
| `Stone_Carats` | `stone_carats` | |
| `Total_Carat_Weight` | `total_carat_weight` | |
| `Center_Stone_Weight` | `center_stone_weight` | |
| `Collection` | `collection` | |
| `Hero_Visual` | `hero_visual` | Cloudinary URL (video preferred) |
| `Editorial_Visual` | `editorial_visual` | Cloudinary URL (image) |
| `Visual_Top` | `view_1_url` | |
| `Visual_Concept` | `view_2_url` | |
| `Visual_Stone_Sketch` | `view_3_url` | |

### Lead ingestion (CRM)

```
POST /api/lead (browser → Next.js)
  │
  ├─ Validate email
  ├─ INSERT INTO leads (always succeeds first)
  └─ POST https://www.zohoapis.com/crm/v6/Leads (best-effort)
       │
       ├─ Success: UPDATE leads SET crm_status='synced', crm_id=lead.id
       └─ Failure: UPDATE leads SET crm_status='failed'
           (lead is safe in Neon — CRM failure is non-fatal)
```

Key rules (see `CLAUDE.md` § 6 for full detail):
- `Lead_Source` is always `'Web Site'` — hardcoded, never dynamic
- `Last_Name` is required — use `parseZohoName()` from `lib/zoho-auth.ts`
- Check `data[0].status === 'success'` — Zoho returns 207 on per-record failure
- `AbortSignal.timeout(5000)` on every fetch — CRM is best-effort

**Files:**
- `lib/zoho-auth.ts` — token cache + `parseZohoName` + `invalidateZohoToken`
- `app/api/lead/route.ts` — newsletter/archive modal leads
- `app/actions/inquiry.ts` — InquiryDrawer + ContactForm leads
- `app/api/admin/leads/retry/route.ts` — admin retry for `crm_status='failed'` leads

---

## Cloudinary

All media (video + images) is hosted on Cloudinary and served via Cloudinary's CDN.

- **Account ID:** `dlg2mou53`
- **CSP:** `proxy.ts` already includes `res.cloudinary.com` in `img-src` and `media-src`

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
- Cron schedule (`/api/cron/pim-sync` every 4h)

Security headers + CSP are set in `proxy.ts` (not `vercel.json`).

---

## Fontstand / Lyon Text

Lyon Text is loaded via Fontstand CDN under a domain-licensed webfont agreement:

```html
<link rel="stylesheet" href="https://webfonts.fontstand.com/WF-099839-d89c1d499f0c1f40d1e6d7330af17f97.css" />
```

- Licensed for `bezambar.com` only — will not render on other domains or localhost
- In local dev the fallback kicks in (Georgia)
- Do not self-host or copy the CSS file — violates the license
- If Fontstand sends a new key URL, update it in `app/layout.tsx`
