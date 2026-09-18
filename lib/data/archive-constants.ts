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

export interface FilterOption {
  value: string
  label: string
}

export const CATEGORY_FILTERS: FilterOption[] = [
  { value: 'all',       label: 'All Pieces' },
  { value: 'rings',     label: 'Rings' },
  { value: 'bands',     label: 'Bands' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'earrings',  label: 'Earrings' },
  { value: 'mens',      label: "Men's" },
]

/**
 * Shape tokens stored in archive.shapes[]. Order is by live frequency
 * (round dominates at ~40% of pieces) so the most-used cuts read first.
 * Values are the exact lowercase tokens the enrichment writes — they must
 * match e.shapes.includes(value) in ArchiveClient.
 */
export const SHAPE_FILTERS: FilterOption[] = [
  { value: 'all',         label: 'All Shapes' },
  { value: 'round',       label: 'Round' },
  { value: 'emerald-cut', label: 'Emerald Cut' },
  { value: 'oval',        label: 'Oval' },
  { value: 'princess',    label: 'Princess' },
  { value: 'cushion',     label: 'Cushion' },
  { value: 'baguette',    label: 'Baguette' },
  { value: 'heart',       label: 'Heart' },
  { value: 'pear',        label: 'Pear' },
  { value: 'radiant',     label: 'Radiant' },
  { value: 'marquise',    label: 'Marquise' },
  { value: 'asscher',     label: 'Asscher' },
  { value: 'trillion',    label: 'Trillion' },
  { value: 'half-moon',   label: 'Half Moon' },
]

/**
 * Stone-type tokens stored in archive.colors[]. Despite the column name these
 * are stone TYPES, not literal colours. Diamond dominates (~96% of pieces);
 * the coloured stones are surfaced so a client can jump straight to them.
 * Values match e.colors.includes(value) in ArchiveClient.
 */
export const COLOR_FILTERS: FilterOption[] = [
  { value: 'all',            label: 'All Stones' },
  { value: 'diamond',        label: 'Diamond' },
  { value: 'yellow-diamond', label: 'Yellow Diamond' },
  { value: 'emerald',        label: 'Emerald' },
  { value: 'sapphire',       label: 'Sapphire' },
  { value: 'ruby',           label: 'Ruby' },
  { value: 'peridot',        label: 'Peridot' },
  { value: 'garnet',         label: 'Garnet' },
  { value: 'tourmaline',     label: 'Tourmaline' },
]
