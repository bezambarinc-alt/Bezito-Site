#!/usr/bin/env node
/**
 * Internal link enrichment — appends a "Continue Reading" block to every
 * live blog post that has zero internal links in its body.
 *
 * Each post gets:
 *   • 2–3 cross-links to other posts in the same category
 *   • 1 collection/landing page link (by category)
 *   • 1 /contact CTA
 *
 * Run: node --env-file=.env.local scripts/enrich-internal-links.js [--dry-run]
 */

import pg from 'pg'
const { Pool } = pg

const DRY_RUN = process.argv.includes('--dry-run')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ---------------------------------------------------------------------------
// Category → collection page + anchor text
// text = full anchor text used as: Browse the full <a href=page>text</a>.
// Set text=null to suppress the collection line entirely.
// ---------------------------------------------------------------------------
const CAT_META = {
  'engagement-rings':  { page: '/jewelry/rings',      text: 'the Bez Ambar engagement ring collection' },
  'diamonds':          { page: '/diamond-education',   text: 'the Bez Ambar diamond education guide' },
  'diamond-education': { page: '/diamond-education',   text: 'the Bez Ambar diamond education guide' },
  'wedding-rings':     { page: '/jewelry/bands',       text: 'the Bez Ambar wedding band collection' },
  'bands':             { page: '/jewelry/bands',       text: 'the Bez Ambar wedding band collection' },
  'earrings':          { page: '/jewelry/earrings',    text: 'the Bez Ambar earring collection' },
  'necklaces':         { page: '/jewelry/necklaces',   text: 'the Bez Ambar necklace collection' },
  'pendants':          { page: '/jewelry/necklaces',   text: 'the Bez Ambar necklace & pendant collection' },
  'bracelets':         { page: '/jewelry/bracelets',   text: 'the Bez Ambar bracelet collection' },
  'colored-stones':    { page: '/jewelry/rings',       text: 'the Bez Ambar colored stone collection' },
  'celebrity':         { page: '/about-bez-ambar',     text: 'the Bez Ambar story' },
  'guides':            { page: '/jewelry/rings',       text: 'the Bez Ambar fine jewelry collection' },
  'brand':             { page: '/about-bez-ambar',     text: 'the Bez Ambar story' },
  'craftsmanship':     { page: '/about-bez-ambar',     text: 'the Bez Ambar atelier' },
  'jewelry-care':      { page: null,                   text: null },
  'mens-jewelry':      { page: '/jewelry/mens',        text: "the Bez Ambar men's jewelry collection" },
}

const DEFAULT_CAT_META = { page: '/jewelry/rings', text: 'the Bez Ambar fine jewelry collection' }

// ---------------------------------------------------------------------------
// Build the "Continue Reading" HTML block
// ---------------------------------------------------------------------------
function buildRelatedBlock(post, relatedPosts, catMeta) {
  const { page, text } = catMeta

  const relatedItems = relatedPosts
    .map(p => `<li><a href="/blog/${p.slug}">${escHtml(p.title)}</a></li>`)
    .join('\n')

  const collectionLink = page && text
    ? `\n<p>Explore <a href="${page}">${escHtml(text)}</a>.</p>`
    : ''

  return `
<hr>
<div class="related-reading">
<h3>Continue Reading</h3>
<ul>
${relatedItems}
</ul>${collectionLink}
<p>Ready to start your own piece? <a href="/contact">Contact the studio</a> for a private consultation.</p>
</div>`
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hasInternalLinks(body) {
  return body && body.includes('<a href="/')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const { rows: allPosts } = await pool.query(
  `SELECT slug, title, category, body FROM blog_posts WHERE status = 'live' ORDER BY category, slug`
)

// Group by category for cross-linking
const byCategory = {}
for (const p of allPosts) {
  const cat = p.category || 'guides'
  if (!byCategory[cat]) byCategory[cat] = []
  byCategory[cat].push(p)
}

// Posts needing enrichment: no internal links at all
const toEnrich = allPosts.filter(p => !hasInternalLinks(p.body))
console.log(`Posts needing enrichment: ${toEnrich.length} / ${allPosts.length}`)

// Cross-category fallbacks for small/singleton categories
const CROSS_CAT = {
  'celebrity':      ['engagement-rings', 'diamonds'],
  'brand':          ['engagement-rings', 'guides'],
  'craftsmanship':  ['engagement-rings', 'guides'],
  'jewelry-care':   ['guides', 'engagement-rings'],
  'mens-jewelry':   ['rings', 'guides'],
}

let updated = 0
let skipped = 0

for (const post of toEnrich) {
  const cat = post.category || 'guides'
  const catMeta = CAT_META[cat] || DEFAULT_CAT_META

  // Pick related posts — rotate by index within category for even distribution
  const catPosts = (byCategory[cat] || [])
  const selfIdx = catPosts.findIndex(p => p.slug === post.slug)
  let pool_ = []
  if (catPosts.length > 1) {
    // Take neighbors: next 3 slots (wrapping), skipping self
    for (let delta = 1; pool_.length < 3 && delta < catPosts.length; delta++) {
      const candidate = catPosts[(selfIdx + delta) % catPosts.length]
      if (candidate.slug !== post.slug) pool_.push(candidate)
    }
  }

  // If fewer than 2 from same category, add posts from fallback categories
  if (pool_.length < 2) {
    const fallbacks = CROSS_CAT[cat] || ['engagement-rings', 'diamonds']
    for (const fallCat of fallbacks) {
      const extra = (byCategory[fallCat] || []).filter(p => p.slug !== post.slug)
      pool_ = pool_.concat(extra)
      if (pool_.length >= 3) break
    }
  }

  // Cap at 3
  const related = pool_.slice(0, 3)

  if (related.length === 0) {
    console.log(`  SKIP (no related): ${post.slug}`)
    skipped++
    continue
  }

  const block = buildRelatedBlock(post, related, catMeta)
  const newBody = (post.body || '') + block

  if (DRY_RUN) {
    console.log(`\n--- DRY RUN: ${post.slug} (${cat}) ---`)
    console.log(block.trim())
    console.log()
  } else {
    await pool.query(
      `UPDATE blog_posts SET body = $1, updated_at = NOW() WHERE slug = $2`,
      [newBody, post.slug]
    )
    console.log(`  ✓ ${post.slug}`)
    updated++
  }
}

await pool.end()

console.log(`\n${ DRY_RUN ? '[DRY RUN] Would update' : 'Updated' }: ${updated || toEnrich.length - skipped} posts. Skipped: ${skipped}.`)
