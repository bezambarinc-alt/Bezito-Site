// zoho-update-product.mjs — update fields on an existing Zoho CRM product (Kevin CLI tool)
// Usage: node scripts/admin/zoho-update-product.mjs <sku> --attrs '{"Hero_Visual":"https://..."}' [--sync]
//        node scripts/admin/zoho-update-product.mjs <sku> --label "New Name" [--sync]
//
// ⚠️  Requires Self Client OAuth creds in .env.local (ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN).
//     The Server-based client has products.READ only — writes require Self Client.
//     Bezito's skill commands use MCP directly instead of this script.
//
// --sync: trigger Zoho CRM → Neon sync after updating

import { zohoToken, zohoHeaders, ZOHO_CRM, agentHeaders, BASE_URL } from './_env.mjs'

const sku = process.argv[2]
if (!sku) {
  console.error('Usage: zoho-update-product.mjs <sku> --attrs \'{...}\' [--label "Name"] [--sync]')
  process.exit(1)
}

const attrsIdx = process.argv.indexOf('--attrs')
const labelIdx = process.argv.indexOf('--label')
const doSync   = process.argv.includes('--sync')

if (attrsIdx === -1 && labelIdx === -1) {
  console.error('Provide --attrs and/or --label')
  process.exit(1)
}

let updates = {}
if (attrsIdx !== -1 && process.argv[attrsIdx + 1]) {
  try { updates = { ...updates, ...JSON.parse(process.argv[attrsIdx + 1]) } }
  catch { console.error('Invalid JSON for --attrs'); process.exit(1) }
}
if (labelIdx !== -1 && process.argv[labelIdx + 1]) {
  updates.Product_Name = process.argv[labelIdx + 1]
}

const token = await zohoToken()
const H = zohoHeaders(token)

// Resolve SKU → Zoho record ID
const searchRes = await fetch(
  `${ZOHO_CRM}/Products/search?criteria=(Product_Code:equals:${encodeURIComponent(sku)})&fields=id,Product_Code,Product_Name`,
  { headers: H },
)
if (!searchRes.ok || searchRes.status === 204) {
  console.error(`Product not found: ${sku}`)
  process.exit(1)
}
const product = (await searchRes.json()).data?.[0]
if (!product) { console.error(`Product not found: ${sku}`); process.exit(1) }

console.log(`Updating ${product.Product_Code} — ${product.Product_Name} (${product.id})`)
console.log('Changes:', JSON.stringify(updates, null, 2))

const res = await fetch(`${ZOHO_CRM}/Products`, {
  method: 'PUT',
  headers: H,
  body: JSON.stringify({ data: [{ id: product.id, ...updates }] }),
})

const json = await res.json()
const result = json.data?.[0]

if (!res.ok || result?.code !== 'SUCCESS') {
  console.error('❌ Update failed:', JSON.stringify(result ?? json, null, 2))
  process.exit(1)
}

console.log(`✅ Updated: ${sku}`)

if (doSync) {
  console.log('Triggering Zoho → Neon sync...')
  const syncRes = await fetch(`${BASE_URL}/api/cron/pim-sync`, { headers: agentHeaders() })
  const syncJson = await syncRes.json()
  console.log('Sync result:', JSON.stringify(syncJson))
}
