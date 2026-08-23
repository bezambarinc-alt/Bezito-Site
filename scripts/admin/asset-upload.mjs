/**
 * asset-upload.mjs — Download Dropbox assets and upload them to Cloudinary.
 *
 * Uses dropbox-fetch.mjs for resilient downloads (HEAD check + auto-retry).
 * Handles all 5 product asset slots: video, model, top, concept, stone.
 *
 * Usage:
 *   node scripts/admin/asset-upload.mjs \
 *     --sku C0486 \
 *     --category bands \
 *     [--video <url>] \
 *     [--model <url>] \
 *     [--top   <url>] \
 *     [--concept <url>] \
 *     [--stone  <url>]
 *
 * Prints a JSON object to stdout:
 *   { "video": "<cloudinary_url>", "model": "...", "top": "...", "concept": "...", "stone": "..." }
 * Only keys where a URL was provided appear in output.
 * Exits 1 if any download or upload fails.
 */

import { createReadStream, mkdirSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, extname } from 'node:path'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fetchDropbox } from './dropbox-fetch.mjs'

// ── Cloudinary config ─────────────────────────────────────────────────────────
const CREDS_PATH = '/home/bezito/.openclaw/credentials/cloudinary.json'
let _creds
function creds() {
  if (!_creds) _creds = JSON.parse(readFileSync(CREDS_PATH, 'utf8'))
  return _creds
}
const CLOUD = () => creds().cloud_name ?? 'dlg2mou53'
const API_KEY = () => creds().api_key ?? '165917429927314'
const API_SECRET = () => creds().api_secret

function cloudinarySign(params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return createHash('sha1').update(sorted + API_SECRET()).digest('hex')
}

/**
 * Upload a local file to Cloudinary.
 * @param {string} localPath  Absolute path to the file
 * @param {string} publicId   Cloudinary public_id (no extension)
 * @param {'image'|'video'} resourceType
 * @returns {Promise<string>} secure_url
 */
async function uploadToCloudinary(localPath, publicId, resourceType = 'image') {
  const ts = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp: ts }
  const sig = cloudinarySign(params)

  const form = new FormData()
  form.append('file', new Blob([readFileSync(localPath)]))
  form.append('api_key', API_KEY())
  form.append('timestamp', String(ts))
  form.append('public_id', publicId)
  form.append('signature', sig)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD()}/${resourceType}/upload`,
    { method: 'POST', body: form }
  )
  const json = await res.json()
  if (!json.secure_url) {
    throw new Error(`Cloudinary upload failed for ${publicId}: ${JSON.stringify(json.error ?? json)}`)
  }
  return json.secure_url
}

// ── Argument parsing ──────────────────────────────────────────────────────────
function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : null
}

const sku      = arg('sku')
const category = arg('category')

if (!sku || !category) {
  console.error('Usage: asset-upload.mjs --sku <SKU> --category <category> [--video <url>] [--model <url>] [--top <url>] [--concept <url>] [--stone <url>]')
  process.exit(1)
}

const slots = {
  video:   { url: arg('video'),   folder: `Jewelry Videos/${cat(category)}`, suffix: '',          rtype: 'video' },
  model:   { url: arg('model'),   folder: `Jewelry Images/${cat(category)}`, suffix: '-model',     rtype: 'image' },
  top:     { url: arg('top'),     folder: `Jewelry Images/${cat(category)}`, suffix: '-top',       rtype: 'image' },
  concept: { url: arg('concept'), folder: `Jewelry Images/${cat(category)}`, suffix: '-concept',   rtype: 'image' },
  stone:   { url: arg('stone'),   folder: `Jewelry Images/${cat(category)}`, suffix: '-stone',     rtype: 'image' },
}

function cat(c) {
  const norm = { bands: 'Bands', bracelets: 'Bracelets', rings: 'Rings', earrings: 'Earrings', necklaces: 'Necklaces', pendants: 'Pendants' }
  return norm[c.toLowerCase()] ?? c.charAt(0).toUpperCase() + c.slice(1)
}

// ── Main ──────────────────────────────────────────────────────────────────────
const tmp = join(tmpdir(), `ba-upload-${sku}-${Date.now()}`)
mkdirSync(tmp, { recursive: true })

const results = {}
const errors  = []

for (const [slot, { url, folder, suffix, rtype }] of Object.entries(slots)) {
  if (!url) continue

  const ext      = extname(new URL(url.replace('?', '/?')).pathname) || (rtype === 'video' ? '.mp4' : '.avif')
  const tmpFile  = join(tmp, `${slot}${ext}`)
  const publicId = `${folder}/${sku.toUpperCase()}${suffix}`

  process.stderr.write(`[${slot}] Downloading…\n`)
  try {
    await fetchDropbox(url, tmpFile)
    process.stderr.write(`[${slot}] Uploading to Cloudinary (${rtype})…\n`)
    const cloudUrl = await uploadToCloudinary(tmpFile, publicId, rtype)
    process.stderr.write(`[${slot}] ✅ ${cloudUrl}\n`)
    results[slot] = cloudUrl
  } catch (err) {
    process.stderr.write(`[${slot}] ❌ ${err.message}\n`)
    errors.push({ slot, error: err.message })
  } finally {
    try { unlinkSync(tmpFile) } catch {}
  }
}

// Clean up tmp dir
try { require('fs').rmdirSync(tmp) } catch {}

process.stdout.write(JSON.stringify(results, null, 2) + '\n')

if (errors.length) {
  process.stderr.write(`\nFailed slots:\n`)
  for (const { slot, error } of errors) {
    process.stderr.write(`  ${slot}: ${error}\n`)
  }
  process.exit(1)
}
