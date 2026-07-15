# Bez Ambar — Website

Production site for [bezambar.com](https://bezambar.com). Built with Astro, deployed to Vercel.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build) v5 (static output) |
| Deployment | Vercel (account: `bezambarinc-alt`) |
| Search | Pagefind (static, runs post-build) |
| Fonts | Open Sans (npm), Cormorant Garamond variable (npm), Lyon Text (Fontstand CDN) |
| Forms / CRM | FreshSales via `bezito-forms.bezambarinc.workers.dev` |
| Media | Cloudinary (`dlg2mou53`) |
| Smooth scroll | Lenis |
| CSS | Vanilla CSS — single global design system, no CSS framework |

## Local Development

```bash
npm install
npm run dev        # starts dev server at localhost:4321
```

Lyon Text loads via the Fontstand CDN license — it may not render in local dev if the license is domain-locked. Falls back to Cormorant Garamond.

## Build & Deploy

```bash
npm run build      # astro build → pagefind index
npm run preview    # preview the built output locally
```

Deploys automatically to Vercel on push to `main`. Preview deployments fire on all branches.

Live URL: `https://bezambar-web2026.vercel.app` (pre-cutover) → `https://bezambar.com` (post-cutover, target Aug 2026)

## Project Structure

```
web/bez-ambar/
├── docs/              ← design & dev documentation (read this first)
├── public/            ← static assets (archive-data.json, robots.txt)
├── src/
│   ├── content/       ← Astro content collections
│   │   ├── blog/      ← blog posts (.md)
│   │   └── products/  ← jewelry products (data-driven product pages)
│   ├── layouts/
│   │   └── Layout.astro   ← single page shell for all pages
│   ├── components/    ← Header, Nav, Footer, SearchOverlay, InquiryDrawer, SocialLinks
│   ├── pages/         ← one .astro file per route
│   └── styles/
│       ├── global.css             ← design tokens + all component styles
│       └── templates/             ← page-type-specific overrides
│           ├── home.css
│           ├── product.css
│           ├── editorial.css
│           ├── blog.css
│           ├── contact.css
│           ├── legal.css
│           └── 404.css
├── astro.config.mjs
├── vercel.json        ← headers, redirects, CSP
└── package.json
```

## Documentation

See [`docs/`](docs/README.md) for design and development decisions:

- [Typography](docs/typography.md) — fonts, base rules, exceptions
- [Colors](docs/colors.md) — CSS token values
- [Layout](docs/layout.md) — Layout.astro structure and props
- [Pages](docs/pages.md) — route map, page types, dynamic data
- [Components](docs/components.md) — component reference

**Check docs before changing CSS or layout. Update docs in the same commit when a decision changes.**

## Key Conventions

- All styling is vanilla CSS — no Tailwind, no CSS modules
- Design tokens live in `:root` in `global.css` — change a value once, it cascades everywhere
- Sans-font elements (Open Sans) are always uppercase with letter-spacing 0 — controlled by `--sans-transform` and `--sans-letter-spacing` tokens
- Dynamic pages (category, collection) are driven by data maps inside the page file — add a new category or collection by adding one entry to the map, no new file needed
- Blog is the only page type with different typography rules (serif headings inside articles)
- The InquiryDrawer is global (on every page). The Archive page has its own separate modal — do not conflate them
