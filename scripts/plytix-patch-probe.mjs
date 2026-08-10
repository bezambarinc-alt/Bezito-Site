// Discover PATCH mechanics on ONE product (VEGA -> category Rings). Then read it
// back to confirm. This IS a live write, but only 1 product, easily corrected.
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

// find VEGA's id
const s = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [[{ field: 'sku', operator: 'eq', value: 'VEGA' }]], attributes: ['sku','label'], pagination: { page:1, page_size:1 } }),
})
const sj = await s.json()
const id = sj.data?.[0]?.id
console.log('VEGA id:', id, '| search status', s.status)
if (!id) { console.log('no id — search body:', JSON.stringify(sj).slice(0,300)); process.exit(0) }

// PATCH attributes — Plytix uses PATCH /products/{id} with { attributes: {...} }
const patch = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
  method: 'PATCH', headers: H,
  body: JSON.stringify({ attributes: { category: 'Rings' } }),
})
console.log('PATCH status:', patch.status)
console.log('PATCH body:', JSON.stringify(await patch.json().catch(e=>({err:String(e)}))).slice(0,400))

// read back
const d = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, { headers: H })
const p = (await d.json()).data?.[0]
console.log('\nread-back category:', p?.attributes?.category)
