// zoho-create-product.mjs — create a new product in Zoho CRM Products (Kevin CLI tool)
// Usage: node scripts/admin/zoho-create-product.mjs --json '{...}'
//
// ⚠️  Requires Self Client OAuth creds in .env.local (ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN).
//     The Server-based client has products.READ only — writes require Self Client.
//     Bezito's skill commands use MCP `createProductsRecords` directly instead of this script.
//
// JSON fields (Product_Name and Product_Code required):
//   Product_Name, Product_Code, Product_Category, Product_Active,
//   Subtitle, Editorial, Metal,
//   Stone_Shape, Stone_Color, Stone_Clarity, Stone_Carats, Stone_Notes,
//   Total_Carat_Weight, Center_Stone_Weight, Collection,
//   Hero_Visual, Editorial_Visual, Visual_Top, Visual_Concept, Visual_Stone_Sketch

import { zohoToken, zohoHeaders, ZOHO_CRM } from './_env.mjs'

const jsonIdx = process.argv.indexOf('--json')
if (jsonIdx === -1 || !process.argv[jsonIdx + 1]) {
  console.error('Usage: zoho-create-product.mjs --json \'{"Product_Name":"...","Product_Code":"..."}\'')
  process.exit(1)
}

let data
try {
  data = JSON.parse(process.argv[jsonIdx + 1])
} catch {
  console.error('Invalid JSON')
  process.exit(1)
}

if (!data.Product_Name || !data.Product_Code) {
  console.error('Product_Name and Product_Code are required')
  process.exit(1)
}

// Default to inactive — caller must explicitly set Product_Active: true to publish
if (data.Product_Active === undefined) data.Product_Active = false

const token = await zohoToken()
const H = zohoHeaders(token)

// Check for existing product first — prevent accidental duplicates
const checkRes = await fetch(
  `${ZOHO_CRM}/Products/search?criteria=(Product_Code:equals:${encodeURIComponent(data.Product_Code)})&fields=Product_Code,Product_Name`,
  { headers: H },
)
if (checkRes.ok && checkRes.status !== 204) {
  const existing = (await checkRes.json()).data?.[0]
  if (existing) {
    console.error(`❌ Product already exists: ${existing.Product_Code} — ${existing.Product_Name}`)
    console.error('   Use zoho-update-product.mjs to edit it.')
    process.exit(1)
  }
}

const res = await fetch(`${ZOHO_CRM}/Products`, {
  method: 'POST',
  headers: H,
  body: JSON.stringify({ data: [data] }),
})

const json = await res.json()
const result = json.data?.[0]

if (!res.ok || result?.code !== 'SUCCESS') {
  console.error('❌ Create failed:', JSON.stringify(result ?? json, null, 2))
  process.exit(1)
}

console.log(`✅ Created: ${data.Product_Code} — ${data.Product_Name}`)
console.log(`   Zoho ID: ${result.details?.id}`)
