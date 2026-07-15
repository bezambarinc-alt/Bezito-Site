# Layout

## Layout.astro Shell

Every page wraps in `src/layouts/Layout.astro`. It renders this structure on every page, in this order:

```
<html>
  <head>
    <!-- meta, OG, Twitter Card, canonical, robots -->
    <!-- favicon (inline SVG data URI) -->
    <!-- preconnects: Vimeo, Cloudinary -->
    <!-- Lyon Text external CSS (Fontstand) -->
    <!-- JSON-LD structured data (org schema + page schema) -->
    <!-- Open Sans + Cormorant Garamond bundled by Astro -->
    <!-- global.css bundled by Astro -->
  </head>
  <body>
    <Header />
    <Nav />
    <SearchOverlay />
    <InquiryDrawer />
    <main data-pagefind-body>
      <slot />   ← page content goes here
    </main>
    <Footer data-pagefind-ignore />
    <script>  ← UTM capture + video loop (fires on every page)
  </body>
</html>
```

## Layout Props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `title` | string | required | `<title>` tag |
| `description` | string | required | meta description + OG description |
| `canonical` | string | auto (from `Astro.url`) | canonical URL |
| `ogImage` | string | Cloudinary default | OG + Twitter image |
| `ogType` | string | `'website'` | OG type |
| `pageType` | `'website'` \| `'product'` \| `'article'` | `'website'` | Semantic page classification — product pages pass `'product'`, blog posts pass `'article'`, all other pages default to `'website'` |
| `structuredData` | object \| object[] | — | Additional JSON-LD schemas (merged with org schema) |
| `theme` | `'light'` \| `'dark'` | `'light'` | `page-dark` body class on dark pages |
| `headerLight` | boolean | `false` | `page-header-light` body class — header starts in ink color on light-bg pages |
| `noindex` | boolean | `false` | Sets `noindex,nofollow` robots meta |

## Header Behavior

The header is transparent at page top by default. JS adds `is-solid` (white background) on scroll. Pages with `headerLight={true}` start in a dark/ink state instead of transparent.

## Global Scripts (fire on every page)

- **UTM capture** — reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from URL params and saves to `sessionStorage` for form submission.
  - **Why `sessionStorage` (not `localStorage` or cookie):** clears on tab/browser close — single-session attribution only. No cross-session persistence, no consent banner requirements.
- **Video loop** — listens to `timeupdate` on all `<video>` elements; when playback reaches `duration - 3s`, jumps back to 0. This avoids freeze frames or black endings that commonly appear in the final seconds of looped clips. The video files themselves are not trimmed — only playback is interrupted early.
  - **Why 3 seconds:** a conservative buffer that catches freeze/black frames that typically occur in the final 1–2s of web-encoded MP4s. Source clips are not re-encoded when the threshold needs adjusting — change the constant in the script only.
  - **Why JS interrupt vs trimming files:** keeps source assets untouched and allows future adjustment of the threshold per-clip without touching Cloudinary.

## Search Indexing

`<main>` carries `data-pagefind-body` — Pagefind indexes only content inside this attribute. `<Footer>` carries `data-pagefind-ignore`.

**Why ignore the footer:** footer navigation text (collection names, service labels, address) would match on every single page and pollute search result ranking. Only page-specific content should be indexed.
