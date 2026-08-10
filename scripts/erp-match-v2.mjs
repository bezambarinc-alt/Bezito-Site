// DRY RUN v2 — match 66 Plytix products to ERP master with Kevin's SKU decoding:
//  - R-numbers = repairs, NOT reliable ERP refs (skip R-match).
//  - Parametric SKUs (5FLX40, 2ELS-70) = base style + size spec. Match BASE style
//    (5FLX, 2ELS); the trailing number decodes stone mm/TCW (minus a decimal).
//  - 1C36 = unknown origin -> flag, don't guess.
// NO writes.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const erp = JSON.parse(readFileSync('../../data/bez-ambar-sku-master.json', 'utf8'))

const bySerial = new Map(), byStyle = new Map()
for (const r of erp) {
  if (r.serialNo) bySerial.set(String(r.serialNo).toUpperCase().trim(), r)
  if (r.styleNo) byStyle.set(String(r.styleNo).toUpperCase().trim(), r)
}
// base-style index: strip trailing size digits from styleNo (5FLX40 -> 5FLX, 2ELS-70 -> 2ELS)
const byBaseStyle = new Map()
for (const r of erp) {
  if (!r.styleNo) continue
  const base = String(r.styleNo).toUpperCase().trim().replace(/[-_]?\d+[A-Z]*$/,'')
  if (base && base.length >= 3 && !byBaseStyle.has(base)) byBaseStyle.set(base, r)
}

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

// decode parametric size: 5FLX40 -> 4.0 ; 2ELS-70 -> 7.0
function decodeSize(sku) {
  const m = String(sku).toUpperCase().match(/(?:5FLX|2ELS)[-_]?(\d{2})/)
  if (!m) return null
  return (parseInt(m[1], 10) / 10).toFixed(1) // 40 -> 4.0, 25 -> 2.5
}

function matchErp(sku) {
  const S = String(sku).toUpperCase().trim()
  // R-numbers are repairs — do not treat as product ref
  const isRepair = /^R\d/.test(S)
  if (bySerial.has(S)) return { rec: bySerial.get(S), how: 'serial-exact' }
  if (byStyle.has(S)) return { rec: byStyle.get(S), how: 'style-exact' }
  // parametric: 5FLX / 2ELS base style
  const baseParam = S.match(/^(5FLX|2ELS)/)
  if (baseParam) {
    const base = baseParam[1]
    if (byBaseStyle.has(base)) return { rec: byBaseStyle.get(base), how: `base-style(${base})`, sizeDecode: decodeSize(S) }
  }
  // compound parts (but skip pure R-number parts)
  for (const part of S.split(/[-_]/)) {
    if (part.length < 3 || /^R\d/.test(part)) continue
    if (byStyle.has(part)) return { rec: byStyle.get(part), how: `style-part(${part})` }
    if (bySerial.has(part)) return { rec: bySerial.get(part), how: `serial-part(${part})` }
    const bp = part.match(/^(5FLX|2ELS)/)
    if (bp && byBaseStyle.has(bp[1])) return { rec: byBaseStyle.get(bp[1]), how: `base-style-part(${bp[1]})`, sizeDecode: decodeSize(part) }
  }
  return isRepair ? { repair: true } : null
}

let matched = 0
const rows = [], unmatched = [], repairs = [], flags = []
for (const p of plytix) {
  if (p.sku.toUpperCase() === '1C36') { flags.push('1C36 (unknown origin — review)'); }
  const m = matchErp(p.sku)
  if (m?.rec) {
    matched++
    rows.push(`${p.sku} | ${p.label} | ${m.how}${m.sizeDecode?` | size~${m.sizeDecode}`:''} | cat:${m.rec.cat} | tcw:${m.rec.totalCarat} | ${m.rec.metal}`)
  } else if (m?.repair) {
    repairs.push(p.sku)
  } else {
    unmatched.push(p.sku)
  }
}

console.log(`=== MATCHED: ${matched}/${plytix.length} ===`)
rows.forEach(r => console.log(r))
console.log(`\n=== R-NUMBER (repairs — no product ref, ${repairs.length}) ===\n`, repairs.join(', '))
console.log(`\n=== STILL UNMATCHED (${unmatched.length}) ===\n`, unmatched.join(', '))
console.log(`\n=== FLAGS ===\n`, flags.join('; '))
