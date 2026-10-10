/**
 * archive.ts — SERVER-ONLY data layer for the archive feature.
 * Queries the Neon `archive` table (populated by /api/admin/seed-archive).
 *
 * ⚠️  Import ONLY in Server Components or Route Handlers.
 *     Client-safe types + constants live in archive-constants.ts.
 */
import 'server-only'
import { sql } from '@/lib/db'

// Re-export from constants so server code needs only one import.
export type { ArchiveEntry } from './archive-constants'
export { CATEGORY_FILTERS } from './archive-constants'
import { CATEGORY_FILTERS } from './archive-constants'

// ── Internal row shape from Neon ──────────────────────────────────────────────

interface ArchiveRow {
  slug:        string
  title:       string
  sku:         string
  category:    string
  mp4_url:     string
  shapes:      string[]
  colors:      string[]
  description: string | null
}

// ── Public query ──────────────────────────────────────────────────────────────

/**
 * Fetch all archive entries from Neon, ordered by display_order then slug.
 * Throws if the table doesn't exist yet — callers should catch and show an
 * empty-state rather than a 500. See archive/page.tsx for the graceful fallback.
 */
export async function getArchiveEntries() {
  const rows = await sql<ArchiveRow>(
    `SELECT slug, title, sku, category, mp4_url, shapes, colors
       FROM archive
      WHERE mp4_url IS NOT NULL AND mp4_url != ''
      ORDER BY display_order ASC, slug ASC`,
  )

  return rows.map(row => ({
    slug:     row.slug,
    title:    row.title,
    sku:      row.sku,
    mp4Url:   row.mp4_url,
    category: row.category,
    shapes:   Array.isArray(row.shapes) ? row.shapes : [],
    colors:   Array.isArray(row.colors) ? row.colors : [],
  }))
}

/**
 * Fetch the archive categories that actually have at least one entry, returned
 * in CATEGORY_FILTERS order with proper labels (so `mens` → "Men's"). The
 * synthetic `all` filter is excluded — callers add their own "All Pieces" link.
 * Powers the expandable Archive section in the nav menu.
 */
export async function getArchiveCategories(): Promise<{ value: string; label: string }[]> {
  const rows = await sql<{ category: string }>(
    `SELECT DISTINCT category
       FROM archive
      WHERE mp4_url IS NOT NULL AND mp4_url != ''
        AND category IS NOT NULL AND category != ''`,
  )
  const present = new Set(rows.map(r => r.category))
  return CATEGORY_FILTERS
    .filter(f => f.value !== 'all' && present.has(f.value))
    .map(f => ({ value: f.value, label: f.label }))
}

/**
 * Fetch archive entries for a single category, ordered the same way as the full
 * list. Used by the /archive/[category] landing pages.
 */
export async function getArchiveByCategory(category: string) {
  const rows = await sql<ArchiveRow>(
    `SELECT slug, title, sku, category, mp4_url, shapes, colors
       FROM archive
      WHERE category = $1
        AND mp4_url IS NOT NULL AND mp4_url != ''
      ORDER BY display_order ASC, slug ASC`,
    [category],
  )

  return rows.map(row => ({
    slug:     row.slug,
    title:    row.title,
    sku:      row.sku,
    mp4Url:   row.mp4_url,
    category: row.category,
    shapes:   Array.isArray(row.shapes) ? row.shapes : [],
    colors:   Array.isArray(row.colors) ? row.colors : [],
  }))
}

/**
 * Fetch a single archive entry by slug.
 * Returns null if not found — callers should call notFound().
 */
export async function getArchiveBySlug(slug: string) {
  const rows = await sql<ArchiveRow>(
    `SELECT slug, title, sku, category, mp4_url, shapes, colors, description
       FROM archive
      WHERE slug = $1
        AND mp4_url IS NOT NULL AND mp4_url != ''
      LIMIT 1`,
    [slug],
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    slug:        row.slug,
    title:       row.title,
    sku:         row.sku,
    mp4Url:      row.mp4_url,
    category:    row.category,
    shapes:      Array.isArray(row.shapes) ? row.shapes : [],
    colors:      Array.isArray(row.colors) ? row.colors : [],
    description: row.description ?? null,
  }
}
