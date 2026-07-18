# CLAUDE.md — Bez Ambar Astro Site

## Active Branch
**Always work on `main`.** All dev goes directly to `main`.

> ⚠️ `feat/astro-migration` is **RETIRED** — merged 2026-07-13. Never check it out, reference it, or push to it. If git status shows this branch, run `git checkout main` immediately.

## Repo
- GitHub: `bezambarinc-alt/Bezito-Site`
- Local: this directory
- Remote: `origin` → `https://github.com/bezambarinc-alt/Bezito-Site.git`

## Vercel Deployments
| Project | ID | Notes |
|---|---|---|
| `bez-ambar` | `prj_mhVfnyU3q7jAN3gJuqoRudaIaB62` | **Primary** — push to `main` triggers this |
| `bezito-site` | `prj_lIHfwmsmI8QuJ5yfkQKsO9vJAaAQ` | Secondary — same repo, parallel deploy |
| `bezambar-web2026-legacy` | `prj_tL6Gju6TcftBWHUi7FHqGepeOlAk` | LEGACY — do NOT touch |

Preview URL pattern: `bez-ambar-[hash]-bezambarinc-alts-projects.vercel.app`

## Tech Stack
- **Framework:** Astro (static site generator)
- **Assets:** Cloudinary (all images + videos — never commit binary assets to repo)
- **PXM:** Plytix (Product Information Management — supersedes Airtable for product data)
- **Deploy:** Vercel (auto-deploy on push to `main`)

## Project Structure
```
src/
  pages/          # .astro page files — one file = one route
  layouts/        # Layout.astro (site chrome, header, footer)
  components/     # Reusable Astro components
  styles/         # Global CSS
  content/        # Content collections (if used)
  config/         # Site config
web/bez-ambar/    # Legacy HTML files (pre-Astro) — reference only, do not edit
```

## Product Page Template (LOCKED)
Every product page follows this exact structure — do not deviate:

1. Fixed transparent header (auto-inverting logo)
2. Single **900px hero video** with Patek-style overlay ref code
3. Single flowing **hero paragraph** (no eyebrow/subtitle above it)
4. **600px second hero** (image or video)
5. Tight story section
6. Guarantee callout
7. **Technical Details accordion** — Patek-style, four sections: Gem Stones / Metal / Size / More Details
8. **200px charcoal footer** with Lyon-serif contact list

File pattern: `src/pages/[slug].astro`
CSS classes: `section.hero` → `h1.hero__title` / `p.hero__lede`, `section.technical`, `section.product-cta`
Reference implementation: `src/pages/jewelry/` — look at existing product pages before building new ones.

## Hard Rules
- **No public mention of "Alara Cut" anywhere** — patent is pending (USPTO 30/004,203), not yet granted. No website copy, meta tags, schema.org, product names, emails, or social. Acceptable cut credits: **Princess Cut**, **Blaze®**, **Elysian Cut™**.
- **Never commit secrets** — API keys, tokens, credentials stay out of the repo.
- **Cloudinary URLs only** — never commit image/video files. Use Cloudinary delivery URLs.
- **No `prod-body` / 2-col layout** on product pages — that's the old pattern.

## Key URLs
- Production (canonical target): `bezambar.com` (cutover planned early Aug 2026)
- Current live preview: `bez-ambar-[hash]-bezambarinc-alts-projects.vercel.app`
- Galleries worker: `https://galleries.bezambarinc.workers.dev`

## Repos Under bezambarinc-alt (as of 2026-07-17)
- `Bezito-Site` — **this repo, active**
- `bezambar-web2026` — legacy, do not touch
- `elysian-cut-trade`, `bezambar-web`, `Goldberg`, `Heart-Ruby-Page`, `bezambar-website` — legacy/standalone

## Working With Bezito (AI assistant)
Bezito (the AI) has full context on this project. If you need:
- Cloudinary asset URLs → ask Bezito
- Plytix product data → ask Bezito
- Deploy status / Vercel logs → ask Bezito
- Bez × Kevin working page → `https://galleries.bezambarinc.workers.dev/page/bez-kevin` (PW: `1465`)
