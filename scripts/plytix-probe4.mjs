// What data actually EXISTS on Plytix products? Full dump of all products +
// try fetching one product's full detail (attributes + assets) by id.
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

// all products, sku + label
const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 100 } }),
})
const sj = await search.json()
console.log('TOTAL products:', sj.data?.length, '| pagination:', JSON.stringify(sj.pagination || {}))
console.log('SKU | LABEL')
;(sj.data || []).forEach(p => console.log(' ', p.sku, '|', p.label))

// full detail of first product by id (attributes + assets endpoints)
const id = sj.data?.[0]?.id
if (id) {
  const detail = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('\nGET /products/{id} status:', detail.status)
  console.log('detail:', JSON.stringify(await detail.json().catch(e => ({ err: String(e) }))).slice(0, 1000))

  const assets = await fetch(`https://pim.plytix.com/api/v1/products/${id}/assets`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('\nGET /products/{id}/assets status:', assets.status)
  console.log('assets:', JSON.stringify(await assets.json().catch(e => ({ err: String(e) }))).slice(0, 600))
}
