/**
 * archive-constants.ts — shared types + constants for the archive feature.
 * Safe to import in client components (no Node.js deps).
 *
 * Server-only data loading (readFileSync) lives in archive.ts.
 */

// ── Shared type ───────────────────────────────────────────────────────────────

export interface ArchiveEntry {
  slug: string
  title: string
  sku: string
  gifUrl: string
  mp4Url: string
  /** Normalised: rings | bands | bracelets | necklaces | earrings | mens | all */
  category: string
  /** Parsed shape tags (may be empty) */
  shapes: string[]
}

// ── Card size cycle (12-step, matches Astro pattern) ─────────────────────────

export const CARD_SIZE_CYCLE = [
  'md','lg','sm','md','sm','lg','md','sm','lg','md','lg','sm',
] as const
export type CardSize = typeof CARD_SIZE_CYCLE[number]

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

export const SHAPE_FILTERS = [
  { value: 'all',          label: 'All Shapes' },
  { value: 'round',        label: 'Round' },
  { value: 'oval',         label: 'Oval' },
  { value: 'pear',         label: 'Pear' },
  { value: 'framed',       label: 'Framed' },
  { value: 'princess',     label: 'Princess' },
  { value: 'emerald-cut',  label: 'Emerald Cut' },
  { value: 'baguette',     label: 'Baguette' },
  { value: 'asscher',      label: 'Asscher' },
  { value: 'cushion',      label: 'Cushion' },
  { value: 'elysian',      label: 'Elysian' },
]
