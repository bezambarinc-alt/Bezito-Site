/**
 * archive.ts — SERVER-ONLY data loader for the archive feature.
 * Reads public/archive-data.json at request time, enriches with parsed tags.
 *
 * ⚠️  Import ONLY in Server Components or Route Handlers.
 *     Client-safe types/constants live in archive-constants.ts.
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import type { ArchiveEntry } from './archive-constants'

// Re-export everything from constants so server components can use one import.
export type { ArchiveEntry, CardSize } from './archive-constants'
export { CARD_SIZE_CYCLE, CATEGORY_FILTERS, SHAPE_FILTERS } from './archive-constants'

// ── Raw JSON schema ───────────────────────────────────────────────────────────

interface RawEntry {
  title: string
  sku: string
  category: string
  htmlCategory: string
  desc: string
  specs: string
  mp4Url: string
  vimeoId: string
  gifUrl: string
}

// ── Tag parsing ───────────────────────────────────────────────────────────────

const SHAPE_PATTERNS: Array<[string, RegExp]> = [
  ['oval',         /\boval\b/i],
  ['pear',         /\bpear\b/i],
  ['round',        /\bround\b/i],
  ['framed',       /\bframed\b/i],
  ['princess',     /\bprincess\b|\bquadrillion\b/i],
  ['emerald-cut',  /\bemerald[\s-]cut\b/i],
  ['baguette',     /\bbaguette\b/i],
  ['asscher',      /\basscher\b/i],
  ['cushion',      /\bcushion\b/i],
  ['elysian',      /\belysian\b/i],
]

function parseShapes(entry: RawEntry): string[] {
  const text = `${entry.category} ${entry.specs} ${entry.title}`
  return SHAPE_PATTERNS
    .filter(([, re]) => re.test(text))
    .map(([name]) => name)
}

function normalizeCategory(raw: string): string {
  const lc = (raw || '').toLowerCase().trim()
  if (lc.startsWith('ring'))     return 'rings'
  if (lc.startsWith('band'))     return 'bands'
  if (lc.startsWith('bracelet')) return 'bracelets'
  if (lc.startsWith('necklace')) return 'necklaces'
  if (lc.startsWith('earring'))  return 'earrings'
  if (lc === 'mens' || lc.startsWith('men')) return 'mens'
  return 'all'
}

// ── Module-level cache (static file, never changes at runtime) ────────────────

let _cache: ArchiveEntry[] | null = null

export function getArchiveEntries(): ArchiveEntry[] {
  if (_cache) return _cache

  const raw: Record<string, RawEntry> = JSON.parse(
    readFileSync(join(process.cwd(), 'public/archive-data.json'), 'utf8'),
  )

  _cache = Object.entries(raw)
    .filter(([, v]) => Boolean(v.gifUrl))
    .map(([slug, v]) => ({
      slug,
      title:    v.title  || '',
      sku:      v.sku    || '',
      gifUrl:   v.gifUrl,
      mp4Url:   v.mp4Url || '',
      category: normalizeCategory(v.htmlCategory || v.category),
      shapes:   parseShapes(v),
    }))

  return _cache
}
