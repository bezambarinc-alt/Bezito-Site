/**
 * GET /api/admin/seed-archive
 *
 * One-time (idempotent) endpoint that:
 *  1. Creates the `archive` table if it doesn't exist.
 *  2. Reads public/archive-data.json (the Astro-era static file).
 *  3. Parses shape + color tags from each entry.
 *  4. Upserts all 562 rows into Neon.
 *
 * Safe to run multiple times — ON CONFLICT updates the row.
 * After first run, archive-data.json can be retired.
 *
 * TODO: add admin-session auth guard before exposing to production.
 */

import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { sql } from '@/lib/db'

// ── Raw JSON shape ────────────────────────────────────────────────────────────

interface RawEntry {
  title: string
  sku: string
  category: string
  htmlCategory: string
  desc: string
  specs: string
  mp4Url: string
  gifUrl: string
}

// ── Tag parsers (comprehensive — informed by data analysis of all 562 entries) ─

const SHAPE_PATTERNS: Array<[string, RegExp]> = [
  ['oval',         /\boval\b/i],
  ['pear',         /\bpear\b/i],
  ['round',        /\bround\b/i],
  ['radiant',      /\bradiant\b/i],          // 36 entries — most common shape after round
  ['framed',       /\bframed\b/i],           // 33 entries — Bez Ambar "Framed" setting style
  ['princess',     /\bprincess\b|\bquadrillion\b/i],
  ['emerald-cut',  /\bemerald[\s-]cut\b/i],
  ['cushion',      /\bcushion\b/i],
  ['baguette',     /\bbaguette\b/i],
  ['asscher',      /\basscher\b/i],
  ['elysian',      /\belysian\b/i],
  ['marquise',     /\bmarquise\b/i],
  ['trillion',     /\btrillion\b/i],
]

const COLOR_PATTERNS: Array<[string, RegExp]> = [
  ['fancy-yellow', /fancy.*(yellow|canary)|yellow.*diamond|canary.*diamond/i],
  ['fancy-pink',   /fancy.*(pink|rose)|pink.*diamond/i],
  ['fancy-blue',   /fancy.*blue|blue.*diamond/i],
  ['ruby',         /\bruby\b/i],
  ['sapphire',     /\bsapphire\b/i],
  // emerald STONE — do NOT match "emerald cut" (that's a shape, not a color)
  ['emerald',      /\bemerald\b(?![\s-]*cut)/i],
  ['tourmaline',   /\btourmaline\b/i],
]

function parseShapes(text: string): string[] {
  return SHAPE_PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name)
}

function parseColors(text: string): string[] {
  return COLOR_PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name)
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

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // 1. Ensure table + indexes exist
    await sql(`
      CREATE TABLE IF NOT EXISTS archive (
        slug          text        PRIMARY KEY,
        title         text        NOT NULL DEFAULT '',
        sku           text        NOT NULL DEFAULT '',
        category      text        NOT NULL DEFAULT 'all',
        gif_url       text        NOT NULL DEFAULT '',
        mp4_url       text        NOT NULL DEFAULT '',
        shapes        text[]      NOT NULL DEFAULT '{}',
        colors        text[]      NOT NULL DEFAULT '{}',
        description   text        NOT NULL DEFAULT '',
        display_order integer     NOT NULL DEFAULT 0,
        synced_at     timestamptz NOT NULL DEFAULT now()
      )
    `)

    await sql(`CREATE INDEX IF NOT EXISTS idx_archive_category ON archive (category)`)
    await sql(`CREATE INDEX IF NOT EXISTS idx_archive_shapes   ON archive USING GIN (shapes)`)
    await sql(`CREATE INDEX IF NOT EXISTS idx_archive_colors   ON archive USING GIN (colors)`)

    // 2. Read source JSON
    const raw: Record<string, RawEntry> = JSON.parse(
      readFileSync(join(process.cwd(), 'public/archive-data.json'), 'utf8'),
    )

    // 3. Upsert each entry
    let seeded = 0
    let skipped = 0
    let i = 0

    for (const [slug, entry] of Object.entries(raw)) {
      if (!entry.gifUrl) { skipped++; i++; continue }

      const searchText = `${entry.category} ${entry.htmlCategory} ${entry.specs} ${entry.title} ${entry.desc}`
      const category   = normalizeCategory(entry.htmlCategory || entry.category)
      const shapes     = parseShapes(searchText)
      const colors     = parseColors(searchText)

      await sql(
        `INSERT INTO archive
           (slug, title, sku, category, gif_url, mp4_url, shapes, colors, description, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (slug) DO UPDATE SET
           title         = EXCLUDED.title,
           sku           = EXCLUDED.sku,
           category      = EXCLUDED.category,
           gif_url       = EXCLUDED.gif_url,
           mp4_url       = EXCLUDED.mp4_url,
           shapes        = EXCLUDED.shapes,
           colors        = EXCLUDED.colors,
           description   = EXCLUDED.description,
           display_order = EXCLUDED.display_order,
           synced_at     = now()`,
        [slug, entry.title || '', entry.sku || '', category,
         entry.gifUrl, entry.mp4Url || '',
         shapes, colors,
         entry.desc || '',
         i],
      )

      seeded++
      i++
    }

    return NextResponse.json({
      ok: true,
      seeded,
      skipped,
      total: i,
      message: `Archive seeded: ${seeded} rows upserted, ${skipped} skipped (no gifUrl).`,
    })

  } catch (err) {
    console.error('seed-archive error:', err)
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    )
  }
}
