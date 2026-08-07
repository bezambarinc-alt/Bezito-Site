/**
 * archive.ts — SERVER-ONLY data layer for the archive feature.
 * Queries the Neon `archive` table (populated by /api/admin/seed-archive).
 *
 * ⚠️  Import ONLY in Server Components or Route Handlers.
 *     Client-safe types + constants live in archive-constants.ts.
 */
import 'server-only'
import { sql } from '@/lib/db'

// Re-export everything from constants so server code needs only one import.
export type { ArchiveEntry, CardSize } from './archive-constants'
export { CARD_SIZE_CYCLE, CATEGORY_FILTERS, SHAPE_FILTERS, COLOR_FILTERS } from './archive-constants'

// ── Internal row shape from Neon ──────────────────────────────────────────────

interface ArchiveRow {
  slug:     string
  title:    string
  sku:      string
  category: string
  gif_url:  string
  mp4_url:  string
  shapes:   string[]
  colors:   string[]
}

// ── Public query ──────────────────────────────────────────────────────────────

/**
 * Fetch all archive entries from Neon, ordered by display_order then slug.
 * Throws if the table doesn't exist yet — callers should catch and show an
 * empty-state rather than a 500. See archive/page.tsx for the graceful fallback.
 */
export async function getArchiveEntries() {
  const rows = await sql<ArchiveRow>(
    `SELECT slug, title, sku, category, gif_url, mp4_url, shapes, colors
       FROM archive
      WHERE gif_url != ''
      ORDER BY display_order ASC, slug ASC`,
  )

  return rows.map(row => ({
    slug:     row.slug,
    title:    row.title,
    sku:      row.sku,
    gifUrl:   row.gif_url,
    mp4Url:   row.mp4_url,
    category: row.category,
    shapes:   Array.isArray(row.shapes) ? row.shapes : [],
    colors:   Array.isArray(row.colors) ? row.colors : [],
  }))
}
