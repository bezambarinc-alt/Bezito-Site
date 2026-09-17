#!/usr/bin/env node
/**
 * Redirect destination validator.
 *
 * redirects.ts carries 542 legacy WordPress URLs. Nothing verified that the
 * destinations still resolve, so 84 of them had quietly rotted into 301s
 * pointing at 404s — worse than no redirect, because Google keeps the old URL
 * in the index and follows it to a dead end.
 *
 * Checks every destination against:
 *   - the real route tree (app/**‌/page.tsx, dynamic segments resolved below)
 *   - products.slug / products.category / products.active   (Neon)
 *   - blog_posts.slug WHERE status='live'                   (Neon)
 *   - RETAILERS in lib/data/retailers.ts
 *   - legacy product slugs in lib/data/legacy-products.ts
 *   - products.collection for /collection/[slug]
 *
 * Run: node --env-file=.env.local scripts/check-redirects.js
 * Exits 1 if anything is broken, so it can gate CI.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { Pool } = require('pg')

const ROOT = path.resolve(__dirname, '..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
const slugsIn = (file) => new Set([...read(file).matchAll(/slug: '([^']+)'/g)].map((m) => m[1]))

function staticRoutes() {
  return new Set(
    execSync('find app -name page.tsx', { cwd: ROOT })
      .toString()
      .trim()
      .split('\n')
      .map((f) =>
        f
          .replace(/\/page\.tsx$/, '')
          .replace(/^app/, '')
          .replace(/\/\([a-z-]+\)/g, ''),
      )
      .map((s) => (s === '' ? '/' : s)),
  )
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const destinations = [
    ...new Set([...read('redirects.ts').matchAll(/destination: '([^']+)'/g)].map((m) => m[1])),
  ]

  const products = (await pool.query('SELECT slug, category, active, collection FROM products')).rows
  const bySlug = new Map(products.map((r) => [r.slug, r]))
  const categories = new Set(products.filter((r) => r.active && r.category).map((r) => r.category))
  const collections = new Set(products.filter((r) => r.active && r.collection).map((r) => r.collection))
  const blog = new Set(
    (await pool.query("SELECT slug FROM blog_posts WHERE status = 'live'")).rows.map((r) => r.slug),
  )
  await pool.end()

  const routes = staticRoutes()
  const legacy = slugsIn('lib/data/legacy-products.ts')
  const retailers = slugsIn('lib/data/retailers.ts')

  const broken = []
  for (const dest of destinations) {
    const p = dest.split('?')[0]
    if (routes.has(p)) continue

    let m
    if ((m = p.match(/^\/blog\/(.+)$/))) {
      if (!blog.has(m[1])) broken.push([dest, 'blog slug is not live'])
    } else if ((m = p.match(/^\/legacy\/(.+)$/))) {
      if (!legacy.has(m[1])) broken.push([dest, 'legacy slug missing'])
    } else if ((m = p.match(/^\/retailers\/(.+)$/))) {
      if (!retailers.has(m[1])) broken.push([dest, 'retailer slug missing'])
    } else if ((m = p.match(/^\/collection\/(.+)$/))) {
      if (!collections.has(m[1])) broken.push([dest, 'no active product in that collection'])
    } else if ((m = p.match(/^\/jewelry\/([^/]+)\/(.+)$/))) {
      const row = bySlug.get(m[2])
      if (!row) broken.push([dest, 'product slug not found'])
      else if (!row.active) broken.push([dest, 'product is inactive'])
      else if (row.category !== m[1])
        broken.push([dest, `category mismatch — live URL is /jewelry/${row.category}/${row.slug}`])
    } else if ((m = p.match(/^\/jewelry\/([^/]+)$/))) {
      if (!categories.has(m[1])) broken.push([dest, 'category has no active products'])
    } else {
      broken.push([dest, 'no matching route'])
    }
  }

  console.log(`Checked ${destinations.length} unique destinations.`)
  if (!broken.length) {
    console.log('All redirect destinations resolve. ✓')
    return
  }
  console.log(`${broken.length} broken:`)
  broken.forEach(([d, why]) => console.log(`  ${d.padEnd(56)} → ${why}`))
  process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
