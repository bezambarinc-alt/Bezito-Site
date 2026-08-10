// Thorough check: does Plytix have a category attribute OR category taxonomy?
// 1) full attribute list on a product (detail)  2) product categories endpoint
// 3) the account's product category tree
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const auth = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: env.PLYTIX_API_KEY, api_password: env.PLYTIX_API_PASSWORD }),
})
const token = (await auth.json())?.data?.[0]?.access_token
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

// grab a few product ids
const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 8 } }),
})
const prods = (await search.json()).data

for (const item of prods.slice(0, 4)) {
  const d = await fetch(`https://pim.plytix.com/api/v1/products/${item.id}`, { headers: H })
  const p = (await d.json()).data?.[0]
  console.log(`\n=== ${p.sku} | ${p.label} ===`)
  console.log('ALL attribute keys:', Object.keys(p.attributes || {}).join(', '))
  console.log('top-level categories field:', JSON.stringify(p.categories || []))
  // dedicated categories endpoint
  const cat = await fetch(`https://pim.plytix.com/api/v1/products/${item.id}/categories`, { headers: H })
  const cj = await cat.json().catch(e => ({ err: String(e) }))
  console.log('GET /categories status', cat.status, ':', JSON.stringify(cj).slice(0, 300))
}

// account-level product category tree
console.log('\n\n=== ACCOUNT PRODUCT CATEGORY TREE ===')
const tree = await fetch('https://pim.plytix.com/api/v1/categories/product/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['name', 'path'], pagination: { page: 1, page_size: 100 } }),
})
console.log('status', tree.status)
const tj = await tree.json().catch(e => ({ err: String(e) }))
console.log(JSON.stringify(tj).slice(0, 800))
