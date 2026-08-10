// SAFE PROBE before bulk write: (1) list existing product attributes to see if
// `category` / `center_stone_weight` exist, (2) discover the PATCH endpoint shape
// by reading ONE product. NO writes in this script.
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

// 1) list product attributes via search (POST /attributes/product/search)
const attrRes = await fetch('https://pim.plytix.com/api/v1/attributes/product/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['name', 'label', 'type'], pagination: { page: 1, page_size: 100 } }),
})
console.log('attributes/product/search status:', attrRes.status)
const aj = await attrRes.json().catch(e => ({ err: String(e) }))
const attrs = (aj.data || [])
console.log('existing attributes (' + attrs.length + '):')
attrs.forEach(a => console.log('   ', a.label || a.name, '| type:', a.type, '| id:', a.id))
console.log('\nhas category attr:', attrs.some(a => /category/i.test(a.label||a.name)))
console.log('has center_stone_weight attr:', attrs.some(a => /center.?stone/i.test(a.label||a.name)))
