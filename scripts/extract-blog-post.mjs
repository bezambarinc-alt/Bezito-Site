// Extract a blog post from dist/blog/<slug>/index.html into an import row.
// Usage: node scripts/extract-blog-post.mjs <slug>
// Prints JSON to stdout. Titles kept verbatim; body copy untouched.
import { readFile } from 'node:fs/promises'

const slug = process.argv[2]
if (!slug) { console.error('need slug'); process.exit(1) }

const html = await readFile(`dist/blog/${slug}/index.html`, 'utf8')

const pick = (re) => { const m = html.match(re); return m ? m[1].trim() : null }

const title = pick(/<meta property="og:title" content="([^"]*?)(?:\s*\|\s*Bez Ambar)?"/)
  || pick(/<title>([^<]*?)(?:\s*\|\s*Bez Ambar)?<\/title>/)
const excerpt = pick(/<meta name="description" content="([^"]*)"/) || ''
const category = pick(/class="ba-post-hero__cat">([^<]*)</) || 'guides'
const heroImageOg = pick(/<meta property="og:image" content="([^"]*)"/)

// dates from Article JSON-LD
const artLd = html.match(/"@type":"Article"[^]*?"datePublished":"([^"]*)"[^]*?"dateModified":"([^"]*)"/)
const date = artLd ? artLd[1] : new Date().toISOString()
const updatedDate = artLd ? artLd[2] : null

// hero media
const heroVideo = pick(/ba-post-img--video[^]*?<source src="([^"]*)"/)
let heroImage = null, heroImageAlt = null
if (!heroVideo) {
  const im = html.match(/<div class="ba-post-img"[^>]*>\s*<img src="([^"]*)"[^>]*alt="([^"]*)"/)
  if (im) { heroImage = im[1]; heroImageAlt = im[2] }
}
// fall back to og:image for schema even when hero is video
const ogImage = heroImageOg

// body: the ba-post-content inner HTML (kept verbatim — we do NOT rewrite copy)
const bodyMatch = html.match(/<div class="ba-post-content">([^]*?)<\/div>\s*<div class="ba-post-cta"/)
const body = bodyMatch ? bodyMatch[1].trim() : null

const schemaFaq = /"@type":"FAQPage"/.test(html)

const row = {
  slug, title, date, updatedDate,
  category: category.toLowerCase().replace(/\s+/g, '-'),
  excerpt,
  heroImage: heroImage || (heroVideo ? ogImage : ogImage),
  heroVideo: heroVideo || null,
  heroImageAlt: heroImageAlt || title,
  author: 'Bez Ambar',
  status: 'live',
  schemaType: 'Article',
  schemaFaq,
  body,
  displayOrder: 0,
}

// validation
const missing = ['slug','title','date','category','excerpt','body'].filter(k => !row[k])
if (missing.length) { console.error('MISSING:', missing.join(',')); process.exit(2) }
if (!row.heroImage && !row.heroVideo) { console.error('NO HERO MEDIA'); process.exit(3) }

process.stdout.write(JSON.stringify(row))
