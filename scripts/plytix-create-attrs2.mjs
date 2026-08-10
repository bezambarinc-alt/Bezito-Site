// LIVE WRITE (approved): create category + center_stone_weight attributes.
// Correct field is `type_class` (PascalCase class), e.g. TextAttribute.
// Idempotent: skip if already present.
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

const ex = await (await fetch('https://pim.plytix.com/api/v1/attributes/product/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['name','label'], pagination: { page:1, page_size:100 } }),
})).json()
const have = new Set((ex.data||[]).map(a => (a.label||a.name||'').toLowerCase()))

async function create(body, tag) {
  const res = await fetch('https://pim.plytix.com/api/v1/attributes/product', {
    method: 'POST', headers: H, body: JSON.stringify(body),
  })
  const j = await res.json().catch(e => ({ err: String(e) }))
  console.log(`${tag}: ${res.status} ${JSON.stringify(j).slice(0,400)}`)
  return { status: res.status, body: j }
}

// center_stone_weight — number-ish class
if (!have.has('center_stone_weight')) {
  const tries = ['NumberAttribute','DecimalAttribute','FloatAttribute','TextAttribute']
  for (const tc of tries) {
    const r = await create({ label: 'center_stone_weight', name: 'center_stone_weight', type_class: tc }, `center_stone_weight[${tc}]`)
    if (r.status < 400) break
  }
} else console.log('center_stone_weight exists — skip')

// category — dropdown/select class with options
if (!have.has('category')) {
  const opts = ['Rings','Bands','Bracelets','Necklaces','Earrings','Pendants']
  const attempts = [
    { label:'category', name:'category', type_class:'DropdownAttribute', options: opts },
    { label:'category', name:'category', type_class:'SelectAttribute', options: opts },
    { label:'category', name:'category', type_class:'MultiSelectAttribute', options: opts },
    { label:'category', name:'category', type_class:'DropdownAttribute' }, // create then add options separately
    { label:'category', name:'category', type_class:'TextAttribute' }, // last resort
  ]
  for (const a of attempts) {
    const r = await create(a, `category[${a.type_class}${a.options?'+opts':''}]`)
    if (r.status < 400) break
  }
} else console.log('category exists — skip')
