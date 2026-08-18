// cloudinary-search.mjs — find Cloudinary assets by ref_code
// Usage: node scripts/admin/cloudinary-search.mjs <ref_code>
// Returns all images + videos tagged with that ref_code

import { env } from './_env.mjs'

const ref = process.argv[2]
if (!ref) { console.error('Usage: cloudinary-search.mjs <ref_code>'); process.exit(1) }

const CLOUD = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME || 'dlg2mou53'
const KEY = env.CLOUDINARY_API_KEY
const SECRET = env.CLOUDINARY_API_SECRET

if (!KEY || !SECRET) {
  console.error('Cloudinary credentials not in .env.local (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)')
  process.exit(1)
}

const creds = Buffer.from(`${KEY}:${SECRET}`).toString('base64')

// Assets are organized as Jewelry Images/<Cat>/<sku>-<view> — no tags.
// The Search API ignores resource_type as a URL param; include it in the expression.
// One call returns both image and video, deduped by public_id.
async function searchAll() {
  const expr = encodeURIComponent(`filename:${ref.toLowerCase()}*`)
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/resources/search?expression=${expr}&max_results=100`
  const res = await fetch(url, { headers: { Authorization: `Basic ${creds}` } })
  const json = await res.json()
  if (!res.ok) { console.error(`Cloudinary error:`, json); return [] }
  return (json.resources || []).map(r => ({
    type: r.resource_type,
    public_id: r.public_id,
    url: r.secure_url,
    format: r.format,
    folder: r.public_id.split('/').slice(0, -1).join('/'),
  }))
}

const all_raw = await searchAll()
// Dedupe by public_id (Search API can return same asset twice under image+video)
const seen = new Set()
const all = all_raw.filter(r => { const k = r.public_id; if (seen.has(k)) return false; seen.add(k); return true })

if (!all.length) {
  console.log(`No Cloudinary assets found for ref_code: ${ref}`)
  process.exit(0)
}

console.log(`\nCloudinary assets for ${ref} (${all.length} found):\n`)
for (const a of all) {
  console.log(`  [${a.type.toUpperCase()}] ${a.public_id}`)
  console.log(`         ${a.url}`)
}
console.log()

// Machine-readable output on stdout as JSON if --json flag
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(all))
