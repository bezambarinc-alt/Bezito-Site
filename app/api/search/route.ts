import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * /api/search — instant catalog search across products + archive.
 *
 * Next-idiomatic replacement for Astro's build-time Pagefind index (which does
 * not exist here). Case-insensitive ILIKE across the searchable text fields of
 * both tables, capped + ranked (exact prefix > word start > substring).
 *
 * GET /api/search?q=<query>   ->  { query, results: SearchResult[] }
 *
 * Result URLs:
 *   product  ->  /jewelry/<category>/<sku>   (detail page; slug === sku)
 *   archive  ->  /archive?id=<slug>          (opens the archive modal)
 */

export const dynamic = 'force-dynamic'

interface SearchResult {
  type: 'product' | 'archive'
  title: string
  sku: string | null
  category: string | null
  href: string
  thumb: string | null
}

const LIMIT = 12

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()

  // Require at least 2 chars to avoid scanning on single keystrokes.
  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [] })
  }

  const like = `%${q}%`
  const prefix = `${q}%`

  const results: SearchResult[] = []

  // ── Products ──────────────────────────────────────────────────────────────
  try {
    const rows = await sql<{
      sku: string
      name: string | null
      category: string | null
      media: unknown
    }>(
      `SELECT sku,
              name,
              specs->>'category' AS category,
              media
         FROM products
        WHERE name ILIKE $1
           OR sku  ILIKE $1
           OR specs->>'category' ILIKE $1
        ORDER BY
          (CASE WHEN name ILIKE $2 THEN 0
                WHEN sku  ILIKE $2 THEN 1
                ELSE 2 END),
          name ASC
        LIMIT $3`,
      [like, prefix, LIMIT],
    )
    for (const r of rows) {
      const category = (r.category ?? 'jewelry').toLowerCase()
      results.push({
        type: 'product',
        title: r.name ?? r.sku,
        sku: r.sku,
        category,
        href: `/jewelry/${category}/${r.sku}`,
        thumb: firstMedia(r.media),
      })
    }
  } catch {
    // products table missing/empty — degrade gracefully, still return archive hits
  }

  // ── Archive ───────────────────────────────────────────────────────────────
  try {
    const rows = await sql<{
      slug: string
      title: string
      sku: string | null
      category: string | null
      gif_url: string | null
    }>(
      `SELECT slug, title, sku, category, gif_url
         FROM archive
        WHERE title    ILIKE $1
           OR sku      ILIKE $1
           OR category ILIKE $1
        ORDER BY
          (CASE WHEN title ILIKE $2 THEN 0
                WHEN sku   ILIKE $2 THEN 1
                ELSE 2 END),
          display_order ASC
        LIMIT $3`,
      [like, prefix, LIMIT],
    )
    for (const r of rows) {
      results.push({
        type: 'archive',
        title: r.title,
        sku: r.sku,
        category: r.category,
        href: `/archive?id=${encodeURIComponent(r.slug)}`,
        thumb: r.gif_url || null,
      })
    }
  } catch {
    // archive table missing/empty — degrade gracefully
  }

  return NextResponse.json({ query: q, results: results.slice(0, LIMIT * 2) })
}

/** Pull a usable thumbnail URL out of the products.media jsonb (best-effort). */
function firstMedia(media: unknown): string | null {
  if (!media) return null
  try {
    if (typeof media === 'string') return media
    if (Array.isArray(media)) {
      const first = media[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object' && 'url' in first) return String((first as { url: unknown }).url)
      return null
    }
    if (typeof media === 'object') {
      const m = media as Record<string, unknown>
      if (typeof m.hero === 'string') return m.hero
      if (typeof m.url === 'string') return m.url
      if (Array.isArray(m.images) && typeof m.images[0] === 'string') return m.images[0]
    }
  } catch {
    return null
  }
  return null
}
