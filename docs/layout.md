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

- **UTM capture** — reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from URL params and saves to `sessionStorage` for form submission
- **Video loop** — detects video `timeupdate` events and resets to 0 at `duration - 3s` to avoid end-of-clip freeze frame
