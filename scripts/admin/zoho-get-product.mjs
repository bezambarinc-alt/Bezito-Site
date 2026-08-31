// zoho-get-product.mjs — read-only product lookup by SKU (Product_Code)
// Usage: node scripts/admin/zoho-get-product.mjs <sku> [--json]
//
// Exits 0 and prints product summary if found.
// Exits 1 with "Product not found" message if not found.

import { zohoToken, zohoHeaders, ZOHO_CRM } from './_env.mjs'

const sku = process.argv[2]
const jsonMode = process.argv.includes('--json')
if (!sku) {
  console.error('Usage: zoho-get-product.mjs <sku> [--json]')
  process.exit(1)
}

const token = await zohoToken()
const H = zohoHeaders(token)

const FIELDS = [
  'Product_Name', 'Product_Code', 'Product_Category', 'Product_Active',
  'Subtitle', 'Editorial', 'Metal',
  'Stone_Shape', 'Stone_Color', 'Stone_Clarity', 'Stone_Carats', 'Stone_Notes',
  'Total_Carat_Weight', 'Center_Stone_Weight', 'Collection',
  'Hero_Visual', 'Editorial_Visual', 'Visual_Top', 'Visual_Concept', 'Visual_Stone_Sketch',
].join(',')

const res = await fetch(
  `${ZOHO_CRM}/Products/search?criteria=(Product_Code:equals:${encodeURIComponent(sku)})&fields=${FIELDS}`,
  { headers: H },
)

if (res.status === 204 || res.status === 404) {
  console.error(`Product not found: ${sku}`)
  process.exit(1)
}

if (!res.ok) {
  console.error(`Zoho API error: ${res.status}`)
  process.exit(1)
}

const json = await res.json()
const product = json.data?.[0]

if (!product) {
  console.error(`Product not found: ${sku}`)
  process.exit(1)
}

if (jsonMode) {
  console.log(JSON.stringify(product, null, 2))
} else {
  console.log(`✅ Found: ${product.Product_Code} — ${product.Product_Name}`)
  console.log(`   Category: ${product.Product_Category ?? '—'} | Active: ${product.Product_Active}`)
  console.log(`   Zoho ID:  ${product.id}`)
  console.log(`   Hero:     ${product.Hero_Visual ?? '—'}`)
  console.log(`   Editorial:${product.Editorial_Visual ?? '—'}`)
  console.log(`   Visual Top:     ${product.Visual_Top ?? '—'}`)
  console.log(`   Visual Concept: ${product.Visual_Concept ?? '—'}`)
  console.log(`   Stone Sketch:   ${product.Visual_Stone_Sketch ?? '—'}`)
}
