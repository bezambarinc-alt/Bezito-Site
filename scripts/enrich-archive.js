#!/usr/bin/env node
/**
 * enrich-archive.js — one-shot enrichment of the Neon `archive` table.
 *
 * Fills three columns from local data sources (no network reads except Neon):
 *   category  (text)   — rings | bands | earrings | necklaces | bracelets | mens
 *   shapes    (text[]) — every identified stone shape; multi-stone pieces carry
 *                        all shapes and self-file under each filter. No catch-all.
 *   colors    (text[]) — stone TYPE tokens (diamond, yellow-diamond, ruby, ...)
 *
 * Sources, in precedence order per field:
 *   1. Shopify export2 CSV  (tags + title + body prose)   → category, shapes, type
 *   2. ERP SKU master JSON  (serial = slug prefix)         → shapes (set-stone cuts)
 *   3. Style-code slug tokens (1rofcus → cushion, ...)     → shapes (last resort)
 *
 * Match key: archive slug ← gif_url last path segment (minus extension), lowered,
 * mapped through gif-map to the Shopify Image Src → Handle.
 *
 * Usage:
 *   node scripts/enrich-archive.js            # DRY RUN — prints plan, writes nothing
 *   node scripts/enrich-archive.js --commit   # writes UPDATEs to Neon
 */
const fs = require('fs')
const path = require('path')

const WS = '/home/bezito/.openclaw/workspace'
const GIF_MAP = path.join(WS, 'data/archive-gif-map.json')
const ERP = path.join(WS, 'data/bez-ambar-sku-master.json')
const CSV = path.join(WS, 'media/inbound/openclaw-staged-49914d91-799f-4574-9f1e-c1324418bcba/input-products_export_2---ac22ffae-dd34-4571-bda8-e2045b94e537.csv')

const COMMIT = process.argv.includes('--commit')

// ── shape vocab ───────────────────────────────────────────────────────────────
const SHAPE = {
  round:'round', radiant:'radiant', oval:'oval', pear:'pear', cushion:'cushion',
  emerald:'emerald-cut', 'emerald-cut':'emerald-cut', heart:'heart',
  princess:'princess', quad:'princess', quadra:'princess', quadrillion:'princess',
  asscher:'asscher', marquis:'marquise', marquise:'marquise',
  trillion:'trillion', trilliant:'trillion', baguette:'baguette', kite:'kite',
  'half-moon':'half-moon', 'half moon':'half-moon', square:'princess',
}
const ERP_CUT = Object.assign({}, SHAPE, {
  quadra:'princess', trilliant:'trillion', 'elysian-cut':'elysian', ashoka:'ashoka',
})
// style-code tokens inside slug segments (longest-first to avoid partial hits)
const CODE_TOKENS = [
  ['cush','cushion'],['cus','cushion'],
  ['emc','emerald-cut'],['ec','emerald-cut'],
  ['rad','radiant'],
  ['ovl','oval'],['ov','oval'],
  ['pr','pear'],
  ['hrt','heart'],['hr','heart'],
  ['mq','marquise'],['mrq','marquise'],
  ['asc','asscher'],['asch','asscher'],
  ['bgt','baguette'],['bag','baguette'],['bg','baguette'],
  ['trl','trillion'],['tril','trillion'],
  ['sq','princess'],
  ['rnd','round'],['rd','round'],
]

// ── stone TYPE vocab (colors column) ──────────────────────────────────────────
// order matters: check compound "yellow diamond" before bare "diamond"
const TYPE_RULES = [
  [/\byellow\s+diamond|fancy\s+yellow|canary\b/i, 'yellow-diamond'],
  [/\bemerald(?!\s*[- ]?cut)\b|\bemeralds\b/i, 'emerald'],
  [/\bsapphire/i, 'sapphire'],
  [/\brub(y|ies)\b/i, 'ruby'],
  [/\bperidot\b/i, 'peridot'],
  [/\btourmaline\b/i, 'tourmaline'],
  [/\bgarnet\b/i, 'garnet'],
  [/\bamethyst\b/i, 'amethyst'],
  [/\bcitrine\b/i, 'citrine'],
  [/\baquamarine\b/i, 'aquamarine'],
  [/\btopaz\b/i, 'topaz'],
  [/\bcognac\b/i, 'cognac-diamond'],
]

// ── helpers ───────────────────────────────────────────────────────────────────
const stripHtml = s => (s || '').replace(/<[^>]+>/g, ' ')
const norm = s => (s || '').toLowerCase()

function slugOf(url) {
  const seg = url.replace(/\/+$/, '').split('/').pop()
  return seg.replace(/\.[^.]+$/, '').toLowerCase()
}

function parseCSV(text) {
  // RFC4180-ish: handles quoted fields with embedded commas/newlines/quotes
  const rows = []
  let field = '', row = [], inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false }
      else field += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* skip */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ── shape extractors ──────────────────────────────────────────────────────────
function tagShapes(tags) {
  const t = norm(tags)
  const out = new Set()
  for (const k in SHAPE) if (new RegExp('\\b' + k.replace(/[-]/g, '[- ]') + '\\b').test(t)) out.add(SHAPE[k])
  return out
}
function proseShapes(text) {
  const t = norm(text)
  const out = new Set()
  for (const k in SHAPE) {
    if (k === 'square' || k === 'quad') continue // too ambiguous in prose
    if (new RegExp('\\b' + k.replace(/[-]/g, '[- ]') + '\\b').test(t)) out.add(SHAPE[k])
  }
  return out
}
function erpShapes(slug, erpBySerial) {
  const serial = slug.split('-')[0].toUpperCase()
  const e = erpBySerial[serial] || erpBySerial[serial.replace(/^0+/, '')]
  const out = new Set()
  if (e && Array.isArray(e.stones)) {
    for (const s of e.stones) {
      const c = norm(s.cut).trim()
      if (ERP_CUT[c] && ERP_CUT[c] !== 'elysian' && ERP_CUT[c] !== 'ashoka') out.add(ERP_CUT[c])
    }
  }
  return out
}
function codeShapes(slug) {
  const parts = slug.split('-').slice(1) // skip serial prefix
  const out = new Set()
  for (let p of parts) {
    p = p.toLowerCase()
    for (const [tok, nrm] of CODE_TOKENS) {
      if (new RegExp('(?<![a-z])' + tok + '(?![a-z])').test(p)) { out.add(nrm); break }
    }
  }
  return out
}

// ── category extractor (from Shopify tags/type) ───────────────────────────────
function deriveCategory(tags, type, title) {
  const t = norm(tags + ' ' + type + ' ' + title)
  if (/\bmen('|)s\b|\bmens\b|\bfor him\b/.test(t)) return 'mens'
  if (/\bbracelet/.test(t)) return 'bracelets'
  if (/\bnecklace|\bpendant|\bcross\b/.test(t)) return 'necklaces'
  if (/\bearring|\bhoop|\bstud/.test(t)) return 'earrings'
  if (/\bband\b|\beternity\b/.test(t)) return 'bands'
  if (/\bring\b/.test(t)) return 'rings'
  return ''
}

// ── stone type extractor ──────────────────────────────────────────────────────
function deriveTypes(title) {
  const out = new Set()
  for (const [re, tok] of TYPE_RULES) if (re.test(title)) out.add(tok)
  if (out.size === 0 || (out.size === 1 && out.has('yellow-diamond'))) out.add('diamond')
  // any colored/ fancy stone piece that also implies plain diamonds keeps only its stated types;
  // default rule above guarantees at least one token and diamond for the colorless default.
  if (out.size === 0) out.add('diamond')
  return out
}

// ── load sources ──────────────────────────────────────────────────────────────
console.log('Loading sources...')
const gifMap = JSON.parse(fs.readFileSync(GIF_MAP, 'utf8'))
const erp = JSON.parse(fs.readFileSync(ERP, 'utf8'))
const csvRows = parseCSV(fs.readFileSync(CSV, 'utf8'))

const erpBySerial = {}
for (const i of erp) {
  const sn = String(i.serialNo || '').trim().toUpperCase()
  if (sn) { erpBySerial[sn] = i; erpBySerial[sn.replace(/^0+/, '')] = i }
}

// CSV → per-handle merged rows; and Image Src → handle map
const header = csvRows[0]
const col = name => header.indexOf(name)
const cH = col('Handle'), cTitle = col('Title'), cBody = col('Body (HTML)'),
      cTags = col('Tags'), cType = col('Type'), cImg = col('Image Src')

const byHandle = {}
const img2handle = {}
for (let r = 1; r < csvRows.length; r++) {
  const row = csvRows[r]
  if (!row || row.length < header.length) continue
  const h = row[cH]
  if (!h) continue
  ;(byHandle[h] = byHandle[h] || []).push(row)
  const img = row[cImg]
  if (img) img2handle[img] = h
}
const fne = (rows, c) => { for (const row of rows) { const v = (row[c] || '').trim(); if (v) return v } return '' }

// ── build enrichment plan ─────────────────────────────────────────────────────
const plan = []
const stats = { matched: 0, cat: 0, shape: 0, type: 0, shapeSrc: { tag: 0, prose: 0, erp: 0, code: 0 }, blanks: 0 }
const filterCounts = {}

for (const [gifUrl, cloudUrl] of Object.entries(gifMap)) {
  const slug = slugOf(cloudUrl)
  const h = img2handle[gifUrl]
  const rows = h ? byHandle[h] : null
  if (rows) stats.matched++

  const tags = rows ? fne(rows, cTags) : ''
  const type = rows ? fne(rows, cType) : ''
  const title = rows ? fne(rows, cTitle) : ''
  const body = rows ? stripHtml(fne(rows, cBody)) : ''

  // category
  const category = deriveCategory(tags, type, title)

  // shapes — union of all sources, tracking provenance
  const shapes = new Set()
  const st = tagShapes(tags); st.forEach(x => shapes.add(x)); if (st.size) stats.shapeSrc.tag++
  const sp = proseShapes(title + ' ' + body); sp.forEach(x => shapes.add(x)); if (sp.size) stats.shapeSrc.prose++
  const se = erpShapes(slug, erpBySerial); se.forEach(x => shapes.add(x)); if (se.size) stats.shapeSrc.erp++
  if (shapes.size === 0) { const sc = codeShapes(slug); sc.forEach(x => shapes.add(x)); if (sc.size) stats.shapeSrc.code++ }

  // stone type
  const types = title ? deriveTypes(title) : new Set(['diamond'])

  const shapeArr = [...shapes].sort()
  const colorArr = [...types].sort()

  if (category) stats.cat++
  if (shapeArr.length) { stats.shape++; shapeArr.forEach(s => filterCounts[s] = (filterCounts[s] || 0) + 1) }
  else stats.blanks++
  if (colorArr.length) stats.type++

  plan.push({ slug, category, shapes: shapeArr, colors: colorArr })
}

// ── report ────────────────────────────────────────────────────────────────────
console.log('\n=== ENRICHMENT PLAN ===')
console.log(`gif-map entries:      ${plan.length}`)
console.log(`Shopify-matched:      ${stats.matched}`)
console.log(`category filled:      ${stats.cat}`)
console.log(`shapes filled:        ${stats.shape}  (blanks: ${stats.blanks})`)
console.log(`stone-type filled:    ${stats.type}`)
console.log(`shape source hits:    tag ${stats.shapeSrc.tag} · prose ${stats.shapeSrc.prose} · erp ${stats.shapeSrc.erp} · code ${stats.shapeSrc.code}`)
console.log('\nper-filter counts:')
Object.entries(filterCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k.padEnd(12)} ${v}`))

const catDist = {}
plan.forEach(p => { if (p.category) catDist[p.category] = (catDist[p.category] || 0) + 1 })
console.log('\ncategory dist:', JSON.stringify(catDist))

// ── write ─────────────────────────────────────────────────────────────────────
async function commit() {
  const env = fs.readFileSync(path.join(WS, 'web/bez-ambar/.env.local'), 'utf8')
  const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^["']|["']$/g, '')
  const { Pool } = require('pg')
  const pool = new Pool({ connectionString: url })
  let updated = 0, missing = 0
  try {
    for (const p of plan) {
      const res = await pool.query(
        `UPDATE archive SET category=$2, shapes=$3, colors=$4 WHERE slug=$1`,
        [p.slug, p.category, p.shapes, p.colors],
      )
      if (res.rowCount === 0) missing++
      else updated += res.rowCount
    }
    console.log(`\n✅ COMMIT DONE — rows updated: ${updated}, slugs not found in table: ${missing}`)
  } finally {
    await pool.end()
  }
}

if (COMMIT) {
  console.log('\n--commit set → writing to Neon...')
  commit().catch(e => { console.error('COMMIT ERROR:', e.message); process.exit(1) })
} else {
  console.log('\n(DRY RUN — no DB writes. Re-run with --commit to apply.)')
  // spot-check a few rows
  console.log('\nsample rows:')
  plan.slice(0, 5).forEach(p => console.log(`  ${p.slug} | cat=${p.category} | shapes=[${p.shapes}] | colors=[${p.colors}]`))
}
