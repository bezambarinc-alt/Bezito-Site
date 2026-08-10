// How many of the 66 products are actually LINKED to a category?
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
const sleep = ms => new Promise(r => setTimeout(r, ms))

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 100 } }),
})
const prods = (await search.json()).data
console.log('checking category links for', prods.length, 'products...\n')

let withCat = 0
const results = []
for (const item of prods) {
  let res
  for (let a = 0; a < 5; a++) {
    res = await fetch(`https://pim.plytix.com/api/v1/products/${item.id}/categories`, { headers: H })
    if (res.status === 429) { await sleep(1500 * (a + 1)); continue }
    break
  }
  const cats = (await res.json().catch(() => ({ data: [] }))).data || []
  if (cats.length) { withCat++; results.push(`${item.sku}: ${cats.map(c => c.name || (c.path || []).join('/')).join(', ')}`) }
  await sleep(200)
}
console.log('products WITH a category link:', withCat, '/', prods.length)
results.forEach(r => console.log('  ', r))
