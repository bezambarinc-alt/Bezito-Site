// DRY RUN: match the 66 Plytix products to the ERP SKU master, report what the
// ERP can enrich. NO writes. Match by exact serialNo, exact styleNo, or the
// leading part of a compound SKU (e.g. C0755-5FLX33ASC -> C0755 or 5FLX33ASC).
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const erp = JSON.parse(readFileSync('../../data/bez-ambar-sku-master.json', 'utf8'))
console.log('ERP records:', erp.length)

// index ERP by serialNo and styleNo (upper, trimmed)
const bySerial = new Map(), byStyle = new Map()
for (const r of erp) {
  if (r.serialNo) bySerial.set(String(r.serialNo).toUpperCase().trim(), r)
  if (r.styleNo) byStyle.set(String(r.styleNo).toUpperCase().trim(), r)
}

// pull the 66 Plytix SKUs
const auth = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: env.PLYTIX_API_KEY, api_password: env.PLYTIX_API_PASSWORD }),
})
const token = (await auth.json())?.data?.[0]?.access_token
const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 100 } }),
})
const plytix = (await search.json()).data

function matchErp(sku) {
  const S = String(sku).toUpperCase().trim()
  if (bySerial.has(S)) return { rec: bySerial.get(S), how: 'serial-exact' }
  if (byStyle.has(S)) return { rec: byStyle.get(S), how: 'style-exact' }
  // compound: split on - and _, try each part
  for (const part of S.split(/[-_]/)) {
    if (part.length < 3) continue
    if (byStyle.has(part)) return { rec: byStyle.get(part), how: `style-part(${part})` }
    if (bySerial.has(part)) return { rec: bySerial.get(part), how: `serial-part(${part})` }
  }
  return null
}

let matched = 0
const rows = [], unmatched = []
for (const p of plytix) {
  const m = matchErp(p.sku)
  if (m) {
    matched++
    rows.push({ sku: p.sku, label: p.label, how: m.how, cat: m.rec.cat, totalCarat: m.rec.totalCarat, metal: m.rec.metal, stones: (m.rec.stones||[]).length, desc: (m.rec.description||'').slice(0,40) })
  } else {
    unmatched.push(p.sku)
  }
}

console.log(`\n=== MATCH SUMMARY: ${matched}/${plytix.length} matched ===\n`)
console.log('SKU | label | via | ERP-cat | carat | metal | #stones')
rows.forEach(r => console.log(`${r.sku} | ${r.label} | ${r.how} | ${r.cat} | ${r.totalCarat} | ${r.metal} | ${r.stones}`))
console.log(`\n=== UNMATCHED (${unmatched.length}) ===`)
console.log(unmatched.join(', '))
