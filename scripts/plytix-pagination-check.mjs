// Verify pagination behavior + whether we'd truncate past 100 products.
// Docs: search returns first page by default; must loop pages for >page_size.
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

// page 1
const p1 = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku'], pagination: { page: 1, page_size: 50 } }),
})
const j1 = await p1.json()
console.log('page 1 (size 50): returned', j1.data?.length, '| pagination:', JSON.stringify(j1.pagination))

// page 2 — confirm it returns the remaining products (proves we need to loop)
const p2 = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku'], pagination: { page: 2, page_size: 50 } }),
})
const j2 = await p2.json()
console.log('page 2 (size 50): returned', j2.data?.length, '| pagination:', JSON.stringify(j2.pagination))
console.log('\ntotal_count reported:', j1.pagination?.total_count)
console.log('=> if total_count > page_size, MUST loop pages. Current catalog:', j1.pagination?.total_count, 'products')
