// plytix-create-product.mjs — create a new product in Plytix
// Usage: node scripts/admin/plytix-create-product.mjs --json '{...}'
//
// Required fields in JSON payload:
//   sku           string  — canonical SKU (e.g. "C0825-5FLX30R" or "C0825")
//   label         string  — product name, 1-3 words (e.g. "The Crossover")
//   category      string  — rings|bracelets|earrings|necklaces|pendants
//   subtitle      string  — one atmospheric sentence
//   editorial     string  — 2-3 sentences, Patek tone
//   metal         string  — e.g. "18K yellow gold"
//   stone_shape   string  — e.g. "Oval", "Round brilliant"
//   stone_color   string  — e.g. "White diamond", "Fancy Yellow"
//   hero_visual   string  — Cloudinary URL (video preferred)
//   editorial_visual string — Cloudinary URL (image)
//
// Optional fields:
//   description, stone_clarity, stone_carats, stone_notes,
//   total_carat_weight, center_stone_weight, collection,
//   view_1_url, view_2_url, view_3_url
//
// Status: always created as "Draft" — call plytix-set-status.mjs to publish
//
// Exits 0 with { id, sku } on success

import { plytixToken, BASE_URL, agentHeaders } from './_env.mjs'

const PLYTIX_BASE = 'https://pim.plytix.com/api/v1'
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Category → Plytix taxonomy IDs (from spec Section 3)
const CATEGORY_IDS = {
  rings:     { categoryId: '6a581535c98bf70df17e9f19', familyId: '6a55e10eacdfd64f81c95106' },
  bracelets: { categoryId: '6a581538291cb8ca4e85147f', familyId: '6a55e0f0f5f38f9910441cc8' },
  earrings:  { categoryId: '6a5815395ea4f212d7676260', familyId: '6a55e0f1c4b68bdf5f86b2b7' },
  necklaces: { categoryId: '6a58153a291cb8ca4e851481', familyId: '6a55e0f0c4b68bdf5f86b2b3' },
  pendants:  { categoryId: '6a58153bed3a638d08aad447', familyId: '6a55e0f1c4b68bdf5f86b2b5' },
}

// Normalize category input to one of the 5 keys
const CATEGORY_NORM = {
  ring: 'rings', rings: 'rings',
  band: 'bracelets', bands: 'bracelets',
  bracelet: 'bracelets', bracelets: 'bracelets',
  earring: 'earrings', earrings: 'earrings',
  necklace: 'necklaces', necklaces: 'necklaces',
  pendant: 'pendants', pendants: 'pendants',
}

const flagIdx = process.argv.indexOf('--json')
if (flagIdx === -1 || !process.argv[flagIdx + 1]) {
  console.error('Usage: plytix-create-product.mjs --json \'{"sku":"...","label":"...","category":"rings","subtitle":"...","editorial":"...","metal":"...","stone_shape":"...","stone_color":"...","hero_visual":"...","editorial_visual":"..."}\'')
  process.exit(1)
}

let payload
try { payload = JSON.parse(process.argv[flagIdx + 1]) }
catch { console.error('Invalid JSON payload'); process.exit(1) }

const required = ['sku', 'label', 'category', 'subtitle', 'editorial', 'metal', 'stone_shape', 'stone_color', 'hero_visual', 'editorial_visual']
const missing = required.filter(f => !payload[f])
if (missing.length) { console.error('Missing required fields:', missing.join(', ')); process.exit(1) }

const catKey = CATEGORY_NORM[payload.category.toLowerCase()]
if (!catKey) {
  console.error(`Unknown category: "${payload.category}". Must be one of: rings, bracelets, earrings, necklaces, pendants`)
  process.exit(1)
}
const { categoryId, familyId } = CATEGORY_IDS[catKey]

const token = await plytixToken()
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

async function apiPost(path, body) {
  const res = await fetch(`${PLYTIX_BASE}${path}`, {
    method: 'POST', headers: H, body: JSON.stringify(body),
  })
  return { status: res.status, body: await res.json().catch(() => ({})) }
}

async function apiPatch(path, body) {
  for (let a = 0; a < 5; a++) {
    const res = await fetch(`${PLYTIX_BASE}${path}`, {
      method: 'PATCH', headers: H, body: JSON.stringify(body),
    })
    if (res.status === 429) { await sleep(1500 * (a + 1)); continue }
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }
  return { status: 429, body: {} }
}

// Check SKU doesn't already exist
const checkRes = await fetch(`${PLYTIX_BASE}/products/search`, {
  method: 'POST', headers: H,
  body: JSON.stringify({
    filters: [[{ field: 'sku', operator: 'eq', value: payload.sku }]],
    attributes: ['sku'], pagination: { page: 1, page_size: 1 },
  }),
})
const checkJson = await checkRes.json().catch(() => ({}))
if (checkJson.data?.length > 0) {
  console.error(`Product already exists in Plytix with SKU: "${payload.sku}" (id: ${checkJson.data[0].id})`)
  console.error('Use plytix-update-product.mjs to update an existing product.')
  process.exit(1)
}

// Build attributes object (all non-empty optional fields)
const ATTR_FIELDS = [
  'subtitle', 'editorial', 'description', 'metal', 'stone_shape', 'stone_color',
  'stone_clarity', 'stone_carats', 'stone_notes', 'total_carat_weight',
  'center_stone_weight', 'hero_visual', 'editorial_visual',
  'view_1_url', 'view_2_url', 'view_3_url', 'collection', 'category',
]

const attributes = {}
for (const field of ATTR_FIELDS) {
  if (payload[field] !== undefined && payload[field] !== null && payload[field] !== '') {
    attributes[field] = payload[field]
  }
}
// Always set category attribute (text version for the dropdown)
attributes.category = payload.category.charAt(0).toUpperCase() + payload.category.slice(1).toLowerCase()

// STEP 1: Create the product (status: Draft)
console.log(`\nCreating product in Plytix:`)
console.log(`  SKU:      ${payload.sku}`)
console.log(`  Label:    ${payload.label}`)
console.log(`  Category: ${catKey} (taxonomy id: ${categoryId})`)
console.log(`  Status:   Draft`)
console.log()

const createResult = await apiPost('/products', {
  sku: payload.sku,
  label: payload.label,
  status: 'Draft',
  categories: [{ id: categoryId }],
  attributes,
})

if (createResult.status >= 300) {
  console.error(`Failed to create product (${createResult.status}):`, JSON.stringify(createResult.body))
  process.exit(1)
}

const productId = createResult.body?.data?.id ?? createResult.body?.id
if (!productId) {
  console.error('Create succeeded but no product ID returned:', JSON.stringify(createResult.body))
  process.exit(1)
}

console.log(`Product created. ID: ${productId}`)

// STEP 2: Assign family
await sleep(300)
const familyResult = await apiPatch(`/products/${productId}`, {
  families: [{ id: familyId }],
})
if (familyResult.status >= 300) {
  console.warn(`Family assignment may have failed (${familyResult.status}) — product was still created. Check Plytix UI.`)
} else {
  console.log(`Family assigned (${catKey})`)
}

console.log(`\nDone. ${payload.sku} created in Plytix as Draft.`)
console.log(`To publish: node scripts/admin/plytix-set-status.mjs ${payload.sku} completed`)
console.log(`Then sync:  node scripts/admin/trigger-sync.mjs --wait`)

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ id: productId, sku: payload.sku, status: 'Draft' }))
}
