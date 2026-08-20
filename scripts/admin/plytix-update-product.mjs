// plytix-update-product.mjs — update attributes on an existing Plytix product
// Usage: node scripts/admin/plytix-update-product.mjs <sku> --attrs '{"editorial":"...","metal":"..."}'
//        node scripts/admin/plytix-update-product.mjs --id <plytix_id> --attrs '{...}'  ← preferred when ID is known
//
// --id <plytix_id>  Skip SKU search entirely — use the Plytix product ID directly (from Neon plytix_id column).
//                   This is the correct path for /edit-product flows where the slug → Neon lookup gives you
//                   the plytix_id. Avoids compound-SKU search failures (e.g. "B5993" ≠ "B5993 - 5FLX38R3").
//
// Updatable fields: any attribute from the Plytix attribute registry.
// Common: subtitle, editorial, description, metal, stone_shape, stone_color,
//         stone_clarity, stone_carats, stone_notes, total_carat_weight,
//         center_stone_weight, hero_visual, editorial_visual,
//         visual_top, visual_concept, visual_stone_sketch, collection, category
//
// To also update the product label (name), pass --label "New Name"
// To also update the product status, use plytix-set-status.mjs
//
// Exits 0 on success. Triggers sync if --sync flag passed.

import { plytixToken, BASE_URL, agentHeaders } from './_env.mjs'

const idIdx = process.argv.indexOf('--id')
const directId = idIdx !== -1 ? process.argv[idIdx + 1] : null
const sku = !directId ? process.argv[2] : null
const attrsIdx = process.argv.indexOf('--attrs')
const labelIdx = process.argv.indexOf('--label')

if (!directId && !sku || attrsIdx === -1 && labelIdx === -1) {
  console.error('Usage: plytix-update-product.mjs <sku> [--attrs \'{"field":"value"}\'] [--label "Name"] [--sync]')
  console.error('       plytix-update-product.mjs --id <plytix_id> [--attrs \'{"field":"value"}\'] [--label "Name"] [--sync]')
  process.exit(1)
}

let attrs = {}
if (attrsIdx !== -1 && process.argv[attrsIdx + 1]) {
  try { attrs = JSON.parse(process.argv[attrsIdx + 1]) }
  catch { console.error('Invalid JSON in --attrs'); process.exit(1) }
}
const newLabel = labelIdx !== -1 ? process.argv[labelIdx + 1] : null

const token = await plytixToken()
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Resolve SKU → product ID + current state
async function findProduct(sku) {
  const res = await fetch('https://pim.plytix.com/api/v1/products/search', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      filters: [[{ field: 'sku', operator: 'eq', value: sku }]],
      attributes: ['sku', 'label', 'status'],
      pagination: { page: 1, page_size: 1 },
    }),
  })
  const json = await res.json().catch(() => ({}))
  return json.data?.[0] ?? null
}

// Fetch full detail (attributes are only on GET /products/{id})
async function getDetail(id) {
  for (let a = 0; a < 5; a++) {
    const res = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, { headers: H })
    if (res.status === 429) { await sleep(1500 * (a + 1)); continue }
    const json = await res.json().catch(() => ({}))
    return json.data ?? json ?? {}
  }
  return {}
}

async function patchProduct(id, body) {
  for (let a = 0; a < 5; a++) {
    const res = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
      method: 'PATCH', headers: H, body: JSON.stringify(body),
    })
    if (res.status === 429) { await sleep(1500 * (a + 1)); continue }
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }
  return { status: 429, body: {} }
}

// Resolve: either use --id directly (no search) or find by exact SKU
let product
if (directId) {
  // Direct ID path — skip search, fetch detail to get label/sku for logging
  const detail = await getDetail(directId)
  const p = Array.isArray(detail) ? detail[0] : detail
  if (!p?.id && !p?.sku) {
    console.error(`Product not found in Plytix by id: "${directId}"`)
    process.exit(1)
  }
  product = { id: directId, label: p.label, sku: p.sku ?? directId }
} else {
  product = await findProduct(sku)
  if (!product) {
    console.error(`Product not found in Plytix: "${sku}"`)
    console.error('Tip: Plytix uses compound SKUs (e.g. "B5993 - 5FLX38R3"). Use --id <plytix_id> to skip search.')
    process.exit(1)
  }
}

console.log(`\nUpdating ${product.sku ?? product.id} (id: ${product.id}, label: ${product.label ?? '(none)'})`)

// Show current values for fields being changed
if (Object.keys(attrs).length > 0 || newLabel) {
  const detail = await getDetail(product.id)
  const current = detail.attributes ?? {}
  console.log('\nChanges:')
  if (newLabel) console.log(`  label: "${product.label}" → "${newLabel}"`)
  for (const [k, v] of Object.entries(attrs)) {
    const old = current[k] ?? '(not set)'
    const display = typeof old === 'string' ? old.slice(0, 80) : JSON.stringify(old)
    console.log(`  ${k}: "${display}" → "${String(v).slice(0, 80)}"`)
  }
}

// Build PATCH body
const patchBody = {}
if (newLabel) patchBody.label = newLabel
if (Object.keys(attrs).length > 0) patchBody.attributes = attrs

const result = await patchProduct(product.id, patchBody)
if (result.status >= 300) {
  console.error(`\nPlytix error (${result.status}):`, JSON.stringify(result.body))
  process.exit(1)
}

console.log(`\nDone. ${sku} updated in Plytix.`)

if (process.argv.includes('--sync')) {
  console.log('\nTriggering Plytix → Neon sync...')
  const syncRes = await fetch(`${BASE_URL}/api/cron/plytix-sync`, { headers: agentHeaders() })
  const syncJson = await syncRes.json().catch(() => ({}))
  if (!syncRes.ok) {
    console.error('Sync trigger failed:', JSON.stringify(syncJson))
  } else {
    console.log('Sync triggered. Changes will reflect on site within ~5 min.')
  }
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ id: product.id, sku, updated: patchBody }))
}
