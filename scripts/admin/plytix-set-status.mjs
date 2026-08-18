// plytix-set-status.mjs — set a Plytix product status to Draft or Completed
// Usage: node scripts/admin/plytix-set-status.mjs <sku> <draft|completed>
//
// Exits 0 on success, 1 on error.
// Use --json flag to get machine-readable output: { id, sku, status }

import { plytixToken, PLYTIX_API_KEY } from './_env.mjs'

const sku = process.argv[2]
const rawStatus = process.argv[3]?.toLowerCase()

if (!sku || !rawStatus) {
  console.error('Usage: plytix-set-status.mjs <sku> <draft|completed>')
  process.exit(1)
}
if (!['draft', 'completed'].includes(rawStatus)) {
  console.error('Status must be "draft" or "completed"')
  process.exit(1)
}

const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) // Draft | Completed

const token = await plytixToken()
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Resolve SKU → product ID
async function findProduct(sku) {
  const res = await fetch('https://pim.plytix.com/api/v1/products/search', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      filters: [[{ field: 'sku', operator: 'eq', value: sku }]],
      attributes: ['sku', 'status'],
      pagination: { page: 1, page_size: 1 },
    }),
  })
  const json = await res.json().catch(() => ({}))
  return json.data?.[0] ?? null
}

async function setStatus(id, status) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ status }),
    })
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue }
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }
  return { status: 429, body: { msg: 'Rate limited after retries' } }
}

const product = await findProduct(sku)
if (!product) {
  console.error(`Product not found in Plytix: "${sku}"`)
  process.exit(1)
}

const currentStatus = product.status ?? '(unknown)'
if (currentStatus === status) {
  console.log(`${sku} is already ${status} — no change needed.`)
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify({ id: product.id, sku, status }))
  process.exit(0)
}

console.log(`Setting ${sku} (id: ${product.id}): ${currentStatus} → ${status}`)
const result = await setStatus(product.id, status)

if (result.status >= 300) {
  console.error(`Plytix error (${result.status}):`, JSON.stringify(result.body))
  process.exit(1)
}

console.log(`Done. ${sku} is now ${status} in Plytix.`)
if (status === 'Completed') {
  console.log('Run trigger-sync.mjs --wait to push to Neon now, or wait for the 4h cron.')
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ id: product.id, sku, status }))
}
