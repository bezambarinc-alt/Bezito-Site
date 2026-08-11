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

interface MediaEntry {
  url?: string
  type?: string
  label?: string
}

/**
 * Pull a usable thumbnail URL out of the products.media jsonb.
 *
 * Priority:
 *  1. Array entry with type === 'image'                    (real photo)
 *  2. Array entry whose URL already contains f_jpg          (pre-computed Cloudinary poster)
 *  3. First video URL → synthesize Cloudinary poster frame  (so_0,f_jpg,c_fill,w_144,h_144)
 *  4. Plain string fallback
 */
function firstMedia(media: unknown): string | null {
  if (!media) return null
  try {
    // Flat array of media objects
    if (Array.isArray(media)) {
      const items = media as MediaEntry[]

      // 1. Prefer an explicit image entry
      const img = items.find((m) => m.type === 'image' && m.url)
      if (img?.url) return thumbify(img.url)

      // 2. Pre-computed poster frame (Cloudinary video URL with f_jpg transform already applied)
      const poster = items.find((m) => m.url && m.url.includes('f_jpg'))
      if (poster?.url) return thumbify(poster.url)

      // 3. Synthesize poster from first video URL
      const vid = items.find((m) => m.url)
      if (vid?.url) return videoToThumb(vid.url)

      return null
    }

    // Legacy: plain string
    if (typeof media === 'string') return thumbify(media)

    // Legacy: object with hero/url keys
    if (typeof media === 'object') {
      const m = media as Record<string, unknown>
      const url = (m.hero ?? m.url) as string | undefined
      if (typeof url === 'string') return thumbify(url)
    }
  } catch {
    return null
  }
  return null
}

/** Add small-size Cloudinary transformation to an existing image URL. */
function thumbify(url: string): string {
  if (!url.includes('res.cloudinary.com')) return url
  // Already has a size transform — leave as-is
  if (url.match(/[wh]_\d/)) return url
  return url.replace('/image/upload/', '/image/upload/c_fill,w_144,h_144,f_auto,q_auto/')
}

/**
 * Convert a Cloudinary video URL to a poster-frame image URL.
 * Uses so_0 (first frame), crops to square thumb.
 */
function videoToThumb(url: string): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url
  // Strip any existing transformation block (between /video/upload/ and the version/path)
  // Insert our poster transform, swap extension to .jpg
  return url
    .replace(
      /\/video\/upload\/((?:[^/]+,)?)/,
      '/video/upload/so_0,f_jpg,c_fill,w_144,h_144,q_auto/',
    )
    .replace(/\.[a-z0-9]+$/i, '.jpg')
}
