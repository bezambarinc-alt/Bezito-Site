// Discover the real Plytix attribute schema + assets so the sync maps correctly.
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

// 1) List all product attributes defined in this PIM
const attrRes = await fetch('https://pim.plytix.com/api/v1/attributes/product?page_size=200', {
  headers: { Authorization: `Bearer ${token}` },
})
console.log('attributes list status:', attrRes.status)
const attrJson = await attrRes.json().catch(e => ({ err: String(e) }))
const attrs = (attrJson.data || []).map(a => a.label || a.name || a.id)
console.log('ATTRIBUTE NAMES (' + attrs.length + '):')
console.log(attrs.join(', '))

// 2) Full detail of one product incl. all attributes + assets
const one = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: [],
    attributes: ['*'],
    pagination: { page: 1, page_size: 1 },
  }),
})
console.log('\nsingle-product (attributes:[*]) status:', one.status)
const oj = await one.json().catch(e => ({ err: String(e) }))
console.log('sample product:', JSON.stringify(oj.data?.[0] || oj).slice(0, 1200))
