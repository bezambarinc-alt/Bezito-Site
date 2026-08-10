// Verify against docs: can POST /products/search return our ~11 attributes
// directly (docs say up to 20 allowed), avoiding the N+1 detail fetches?
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

const wanted = [
  'sku', 'label', 'description', 'editorial', 'editorial_visual', 'hero_visual',
  'metal', 'stone_shape', 'stone_carats', 'stone_color', 'stone_clarity',
  'stone_notes', 'subtitle', 'total_carat_weight',
]
console.log('requesting', wanted.length, 'attributes (docs limit = 20)')

const res = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: [],
    attributes: wanted,
    pagination: { page: 1, page_size: 100 },
  }),
})
console.log('status:', res.status)
const j = await res.json()
console.log('returned:', j.data?.length, '| pagination:', JSON.stringify(j.pagination || {}))
// Does the FIRST product now carry real attribute values via search?
const p = j.data?.[0]
console.log('\nfirst product:', p?.sku, '|', p?.label)
console.log('attribute keys present:', Object.keys(p?.attributes || {}).join(', ') || '(none)')
console.log('sample metal:', p?.attributes?.metal, '| hero_visual present:', !!p?.attributes?.hero_visual)
