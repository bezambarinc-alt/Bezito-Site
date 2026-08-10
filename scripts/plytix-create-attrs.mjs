// LIVE WRITE (approved by Kevin): create the two missing attributes.
//  - center_stone_weight : number (text ok if number unsupported)
//  - category            : single-select dropdown, 6 options
// Idempotent: checks existing first, only creates what's missing.
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

// existing attrs
const ex = await (await fetch('https://pim.plytix.com/api/v1/attributes/product/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['name','label'], pagination: { page:1, page_size:100 } }),
})).json()
const have = new Set((ex.data||[]).map(a => (a.label||a.name||'').toLowerCase()))
console.log('existing attr labels:', [...have].join(', '))

async function createAttr(body, tag) {
  console.log(`\n--- creating ${tag} ---`)
  const res = await fetch('https://pim.plytix.com/api/v1/attributes/product', {
    method: 'POST', headers: H, body: JSON.stringify(body),
  })
  const j = await res.json().catch(e => ({ err: String(e) }))
  console.log(tag, 'status:', res.status)
  console.log(JSON.stringify(j).slice(0, 500))
  return { status: res.status, body: j }
}

// center_stone_weight — number
if (!have.has('center_stone_weight')) {
  // try number type; fall back to decimal/text on 422
  let r = await createAttr({ name: 'center_stone_weight', label: 'center_stone_weight', type: 'number' }, 'center_stone_weight(number)')
  if (r.status >= 400) r = await createAttr({ name: 'center_stone_weight', label: 'center_stone_weight', type: 'decimal' }, 'center_stone_weight(decimal)')
  if (r.status >= 400) await createAttr({ name: 'center_stone_weight', label: 'center_stone_weight', type: 'text' }, 'center_stone_weight(text)')
} else console.log('center_stone_weight already exists — skip')

// category — single-select dropdown (6 options)
if (!have.has('category')) {
  const opts = ['Rings','Bands','Bracelets','Necklaces','Earrings','Pendants']
  // try common dropdown shapes
  let r = await createAttr({ name: 'category', label: 'category', type: 'dropdown', options: opts }, 'category(dropdown/options)')
  if (r.status >= 400) r = await createAttr({ name: 'category', label: 'category', type: 'single_select', options: opts }, 'category(single_select)')
  if (r.status >= 400) r = await createAttr({ name: 'category', label: 'category', type: 'select', attribute_options: opts }, 'category(select/attribute_options)')
  if (r.status >= 400) await createAttr({ name: 'category', label: 'category', type: 'text' }, 'category(text-fallback)')
} else console.log('category already exists — skip')
