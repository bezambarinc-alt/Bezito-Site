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

async function search(resourceType) {
  const expr = encodeURIComponent(`tags=${ref.toLowerCase()}`)
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/resources/search?expression=${expr}&max_results=50&resource_type=${resourceType}`
  const res = await fetch(url, { headers: { Authorization: `Basic ${creds}` } })
  const json = await res.json()
  if (!res.ok) { console.error(`Cloudinary error (${resourceType}):`, json); return [] }
  return (json.resources || []).map(r => ({
    type: resourceType,
    public_id: r.public_id,
    url: r.secure_url,
    format: r.format,
    folder: r.public_id.split('/').slice(0, -1).join('/'),
  }))
}

const [images, videos] = await Promise.all([search('image'), search('video')])
const all = [...images, ...videos]

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
