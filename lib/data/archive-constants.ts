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

// ── Card size cycle (12-step, matches Astro pattern exactly) ─────────────────

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

/**
 * Shape filters — ordered by entry count (from data analysis):
 * round(51) radiant(36) framed(33) oval(21) pear(16) cushion(7)
 * princess(5) emerald-cut(4) baguette(3) asscher(1)
 */
export const SHAPE_FILTERS = [
  { value: 'all',         label: 'All Shapes' },
  { value: 'round',       label: 'Round' },
  { value: 'radiant',     label: 'Radiant' },   // 36 entries — was missing, now added
  { value: 'framed',      label: 'Framed' },
  { value: 'oval',        label: 'Oval' },
  { value: 'pear',        label: 'Pear' },
  { value: 'cushion',     label: 'Cushion' },
  { value: 'princess',    label: 'Princess' },
  { value: 'emerald-cut', label: 'Emerald Cut' },
  { value: 'baguette',    label: 'Baguette' },
  { value: 'asscher',     label: 'Asscher' },
  { value: 'elysian',     label: 'Elysian' },
]

/**
 * Color filters — ordered by entry count:
 * emerald(6) sapphire(6) fancy-yellow(4) ruby(3) fancy-pink(1) tourmaline(1)
 */
export const COLOR_FILTERS = [
  { value: 'all',          label: 'All Colors' },
  { value: 'emerald',      label: 'Emerald' },
  { value: 'sapphire',     label: 'Sapphire' },
  { value: 'fancy-yellow', label: 'Fancy Yellow' },
  { value: 'ruby',         label: 'Ruby' },
  { value: 'fancy-pink',   label: 'Fancy Pink' },
  { value: 'tourmaline',   label: 'Tourmaline' },
]
