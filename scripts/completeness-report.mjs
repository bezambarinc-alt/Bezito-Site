// COMPLETENESS REPORT — for each of the 66 Plytix products, check the locked
// completeness gate + weights, flag gaps, and note whether the ERP master can
// fill each gap. NO writes. Focus: how many are missing IMPORTANT data.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const erp = JSON.parse(readFileSync('../../data/bez-ambar-sku-master.json', 'utf8'))
const bySerial = new Map(), byStyle = new Map(), byBaseStyle = new Map()
for (const r of erp) {
  if (r.serialNo) bySerial.set(String(r.serialNo).toUpperCase().trim(), r)
  if (r.styleNo) byStyle.set(String(r.styleNo).toUpperCase().trim(), r)
  if (r.styleNo) { const b = String(r.styleNo).toUpperCase().replace(/[-_]?\d+[A-Z]*$/,''); if (b.length>=3 && !byBaseStyle.has(b)) byBaseStyle.set(b,r) }
}
function matchErp(sku) {
  let S = String(sku).toUpperCase().trim()
  // BA-HR-001 is technically 4HSR* per Kevin
  if (S.startsWith('BA-HR')) S = '4HSR21'
  if (bySerial.has(S)) return bySerial.get(S)
  if (byStyle.has(S)) return byStyle.get(S)
  const bp = S.match(/^(5FLX|2ELS)/); if (bp && byBaseStyle.has(bp[1])) return byBaseStyle.get(bp[1])
  for (const part of S.split(/[-_]/)) { if (part.length<3||/^R\d/.test(part)) continue; if (byStyle.has(part)) return byStyle.get(part); if (bySerial.has(part)) return bySerial.get(part) }
  return null
}

const auth = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: env.PLYTIX_API_KEY, api_password: env.PLYTIX_API_PASSWORD }),
})
const token = (await auth.json())?.data?.[0]?.access_token
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function getR(url){for(let a=0;a<6;a++){const r=await fetch(url,{headers:H});if(r.status===429){await sleep(1500*(a+1));continue}return r}return null}

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku','label'], pagination: { page: 1, page_size: 100 } }),
})
const plytix = (await search.json()).data

// gate fields (required) + weights (recommended-when-applicable)
const GATE = ['label','category','subtitle','editorial','hero_visual','metal','stone_shape']
const tally = { complete: 0, gaps: 0 }
const fillableByErp = { category: 0, total_carat_weight: 0 }
const gapRows = []

for (const item of plytix) {
  const d = await getR(`https://pim.plytix.com/api/v1/products/${item.id}`); const p=(await d.json()).data?.[0]; const a=p.attributes||{}
  await sleep(120)
  const c = await getR(`https://pim.plytix.com/api/v1/products/${item.id}/categories`); const cats=(await c.json()).data||[]; await sleep(120)
  const has = { label: !!(p.label), category: cats.length>0, subtitle: !!a.subtitle, editorial: !!a.editorial, hero_visual: !!a.hero_visual, metal: !!a.metal, stone_shape: !!a.stone_shape }
  const missing = GATE.filter(f => !has[f])
  const missTcw = !a.total_carat_weight
  const erp = matchErp(item.sku)
  if (missing.length || missTcw) {
    tally.gaps++
    const canFill = []
    if (missing.includes('category') && erp?.cat) { canFill.push('category<-ERP'); fillableByErp.category++ }
    if (missTcw && erp?.totalCarat != null) { canFill.push('tcw<-ERP'); fillableByErp.total_carat_weight++ }
    gapRows.push(`${item.sku} | ${item.label} | missing: ${[...missing, missTcw?'total_carat_weight':''].filter(Boolean).join(',')} | ERP: ${erp?'yes':'NO'} | canFill: ${canFill.join(',')||'—'}`)
  } else tally.complete++
}

console.log(`=== COMPLETENESS (gate + tcw) across ${plytix.length} products ===`)
console.log(`FULLY COMPLETE: ${tally.complete}`)
console.log(`HAS GAPS: ${tally.gaps}`)
console.log(`\nERP can fill: category on ${fillableByErp.category}, total_carat_weight on ${fillableByErp.total_carat_weight}`)
console.log(`\n=== PRODUCTS WITH GAPS ===`)
gapRows.forEach(r => console.log(r))
