// Full attribute keys from GET /products/{id} across a few products.
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

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku'], pagination: { page: 1, page_size: 6 } }),
})
const ids = (await search.json()).data.map(p => p.id)

for (const id of ids) {
  const d = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const p = (await d.json()).data?.[0]
  console.log('\n=== ' + p.sku + ' | ' + (p.label || '') + ' ===')
  console.log('attribute keys:', Object.keys(p.attributes || {}).join(', '))
  console.log('assets:', (p.assets || []).length)
  if (p.attributes) {
    for (const [k, v] of Object.entries(p.attributes)) {
      const val = typeof v === 'string' ? v.slice(0, 70) : JSON.stringify(v).slice(0, 70)
      console.log('   ', k, '=', val)
    }
  }
}
