# Pages

## Route Map

| Route | File | Template CSS | Notes |
|---|---|---|---|
| `/` | `pages/index.astro` | `templates/home.css` | Homepage |
| `/about-bez-ambar` | `pages/about-bez-ambar.astro` | `templates/editorial.css` | |
| `/archive` | `pages/archive.astro` | `templates/editorial.css` + inline `<style is:global>` | Lazy-loaded video grid; has its own modal |
| `/blog` | `pages/blog/index.astro` | `templates/blog.css` | Blog listing |
| `/blog/[slug]` | `pages/blog/[slug].astro` | `templates/blog.css` | Blog article — **different typography rules, see typography.md** |
| `/contact` | `pages/contact.astro` | `templates/contact.css` | |
| `/collection` | `pages/collection/index.astro` | global.css only | Collection hub |
| `/collection/[slug]` | `pages/collection/[slug].astro` | global.css only | Dynamic — driven by `COLLECTIONS` map in the file |
| `/diamond-education` | `pages/diamond-education.astro` | `templates/editorial.css` | |
| `/elysian-cut` | `pages/elysian-cut.astro` | `templates/editorial.css` | |
| `/jewelry/[category]` | `pages/jewelry/[category].astro` | global.css only | Dynamic — driven by `meta` map in the file |
| `/jewelry/[category]/[slug]` | `pages/jewelry/[category]/[slug].astro` | `templates/product.css` | Product detail page |
| `/journal` | `pages/journal.astro` | `templates/editorial.css` | |
| `/press` | `pages/press.astro` | `templates/editorial.css` | |
| `/privacy-policy` | `pages/privacy-policy.astro` | `templates/legal.css` | |
| `/ring-size-chart` | `pages/ring-size-chart.astro` | `templates/editorial.css` | |
| `/terms` | `pages/terms.astro` | `templates/legal.css` | |
| `/warranty` | `pages/warranty.astro` | `templates/legal.css` | |
| `/404` | `pages/404.astro` | `templates/404.css` | |

## Page Type Groups

### Home
Single page. Uses full-bleed cinematic hero, segment modules, feature rows. Template: `home.css`.

### Editorial
Long-form content pages. Standard inner hero + prose well layout. Template: `editorial.css`. Used by: about, diamond education, elysian cut, journal, press, ring size chart.

### Product
Jewelry piece detail pages. Two-column layout with video left, specs and inquiry CTA right. Template: `product.css`. Generated dynamically from content collection.

### Category
Jewelry category listings (rings, bracelets, etc.). Product grid with hero. No separate template CSS — built from global component classes. Generated dynamically; metadata (title, lede, quote) in `CATEGORY_META` map inside the file.

### Collection
Named collection landing pages (Bloom, Dentelle, etc.). Hero + spotlight modules + product grid + CTA. No separate template CSS — built from global component classes. Generated dynamically; metadata in `COLLECTIONS` map inside `[slug].astro`. **Add a new collection by adding one entry to that map — no new file needed.**

### Blog
Article listing + article pages. **Only page type with different typography rules.** Template: `blog.css`. Article h1 is Lyon Text italic; section headings inside articles are also serif italic.

### Legal
Plain text pages (privacy policy, terms, warranty). Minimal layout. Template: `legal.css`.

### Archive
Video archive grid. Lazy-loads cards from `/public/archive-data.json`. Has its own Cloudinary video modal (not the global InquiryDrawer). Uses `editorial.css` plus additional modal styles in an inline `<style is:global>` block.

## Dynamic Page Data

- **Category pages** — `CATEGORY_META` record at the top of `pages/jewelry/[category].astro`
- **Collection pages** — `COLLECTIONS` record at the top of `pages/collection/[slug].astro`
- **Product pages** — Astro content collection at `src/content/products/`
- **Blog pages** — Astro content collection at `src/content/blog/`
