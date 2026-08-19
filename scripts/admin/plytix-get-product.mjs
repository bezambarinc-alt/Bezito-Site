// plytix-get-product.mjs — read-only product lookup by SKU
// Usage: node scripts/admin/plytix-get-product.mjs <sku> [--json]
//
// Exits 0 and prints product summary if found.
// Exits 1 with "Product not found" message if not found.
// Never mutates Plytix data.

import { plytixToken } from './_env.mjs'

const sku = process.argv[2]
if (!sku) {
  console.error('Usage: plytix-get-product.mjs <sku> [--json]')
  process.exit(1)
}

const token = await plytixToken()
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function findProduct(sku) {
  for (let a = 0; a < 3; a++) {
    const res = await fetch('https://pim.plytix.com/api/v1/products/search', {
      method: 'POST', headers: H,
      body: JSON.stringify({
        filters: [[{ field: 'sku', operator: 'eq', value: sku }]],
        attributes: ['sku', 'label', 'status', 'category'],
        pagination: { page: 1, page_size: 1 },
      }),
    })
    if (res.status === 429) { await sleep(1500 * (a + 1)); continue }
    const json = await res.json().catch(() => ({}))
    return json.data?.[0] ?? null
  }
  return null
}

const product = await findProduct(sku)
if (!product) {
  console.error(`Product not found in Plytix: "${sku}"`)
  process.exit(1)
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ id: product.id, sku: product.sku, label: product.label, status: product.status }))
} else {
  console.log(`Found: ${product.label ?? '(no label)'} | sku: ${product.sku} | status: ${product.status ?? 'unknown'} | id: ${product.id}`)
}
