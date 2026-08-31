// zoho-set-status.mjs — toggle Product_Active on a Zoho CRM product (Kevin CLI tool)
// Usage: node scripts/admin/zoho-set-status.mjs <sku> <active|inactive>
//
// ⚠️  Requires Self Client OAuth creds in .env.local (ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN).
//     The Server-based client has products.READ only — writes require Self Client.
//     Bezito's skill commands use MCP `updateProductsRecords` directly instead of this script.
//
// active   → Product_Active: true
// inactive → Product_Active: false

import { zohoToken, zohoHeaders, ZOHO_CRM } from './_env.mjs'

const sku    = process.argv[2]
const status = process.argv[3]

if (!sku || !['active', 'inactive'].includes(status)) {
  console.error('Usage: zoho-set-status.mjs <sku> <active|inactive>')
  process.exit(1)
}

const token = await zohoToken()
const H = zohoHeaders(token)

// Resolve SKU → Zoho record ID
const searchRes = await fetch(
  `${ZOHO_CRM}/Products/search?criteria=(Product_Code:equals:${encodeURIComponent(sku)})&fields=id,Product_Code,Product_Name,Product_Active`,
  { headers: H },
)
if (!searchRes.ok || searchRes.status === 204) {
  console.error(`Product not found: ${sku}`)
  process.exit(1)
}
const product = (await searchRes.json()).data?.[0]
if (!product) { console.error(`Product not found: ${sku}`); process.exit(1) }

const newActive = status === 'active'
if (product.Product_Active === newActive) {
  console.log(`Already ${status}: ${product.Product_Code} — ${product.Product_Name}`)
  process.exit(0)
}

const res = await fetch(`${ZOHO_CRM}/Products`, {
  method: 'PUT',
  headers: H,
  body: JSON.stringify({ data: [{ id: product.id, Product_Active: newActive }] }),
})

const json = await res.json()
const result = json.data?.[0]

if (!res.ok || result?.code !== 'SUCCESS') {
  console.error('❌ Status update failed:', JSON.stringify(result ?? json, null, 2))
  process.exit(1)
}

console.log(`✅ ${sku} — ${product.Product_Name} → ${status}`)
