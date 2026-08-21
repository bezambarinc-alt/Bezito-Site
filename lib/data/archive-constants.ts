/**
 * archive-constants.ts — shared types + filter constants for the archive feature.
 * Safe to import in client AND server components (no Node.js deps).
 *
 * Server-only data loading (Neon query) lives in archive.ts.
 */

// ── Shared type ───────────────────────────────────────────────────────────────

export interface ArchiveEntry {
  slug:     string
  title:    string
  sku:      string
  gifUrl:   string
  mp4Url:   string
  /** Normalised: rings | bands | bracelets | necklaces | earrings | mens | all */
  category: string
  /** Shape tags — stored as text[] in Neon */
  shapes:   string[]
  /** Color tags — stored as text[] in Neon */
  colors:   string[]
}

// ── Filter group definitions ──────────────────────────────────────────────────

export const CATEGORY_FILTERS = [
  { value: 'all',       label: 'All Pieces' },
  { value: 'rings',     label: 'Rings' },
  { value: 'bands',     label: 'Bands' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings',  label: 'Earrings' },
  { value: 'mens',      label: "Men's" },
]
