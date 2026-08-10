// List the products missing a category, split: ERP can fill vs needs human.
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
  if (r.styleNo) { const b=String(r.styleNo).toUpperCase().replace(/[-_]?\d+[A-Z]*$/,''); if(b.length>=3&&!byBaseStyle.has(b))byBaseStyle.set(b,r) }
}
function matchErp(sku){let S=String(sku).toUpperCase().trim();if(S.startsWith('BA-HR'))S='4HSR21';if(bySerial.has(S))return bySerial.get(S);if(byStyle.has(S))return byStyle.get(S);const bp=S.match(/^(5FLX|2ELS)/);if(bp&&byBaseStyle.has(bp[1]))return byBaseStyle.get(bp[1]);for(const part of S.split(/[-_]/)){if(part.length<3||/^R\d/.test(part))continue;if(byStyle.has(part))return byStyle.get(part);if(bySerial.has(part))return bySerial.get(part)}return null}

const auth = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: env.PLYTIX_API_KEY, api_password: env.PLYTIX_API_PASSWORD }),
})
const token = (await auth.json())?.data?.[0]?.access_token
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function getR(u){for(let a=0;a<6;a++){const r=await fetch(u,{headers:H});if(r.status===429){await sleep(1500*(a+1));continue}return r}return null}

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku','label'], pagination: { page: 1, page_size: 100 } }),
})
const plytix = (await search.json()).data

const canFill = [], needHuman = []
for (const item of plytix) {
  const c = await getR(`https://pim.plytix.com/api/v1/products/${item.id}/categories`)
  const cats = (await c.json()).data || []
  await sleep(150)
  if (cats.length) continue // has a category, skip
  const erp = matchErp(item.sku)
  const erpCat = erp?.cat
  if (erpCat) canFill.push(`${item.sku} | ${item.label} | ERP cat: ${erpCat}`)
  else needHuman.push(`${item.sku} | ${item.label} | ERP: ${erp?'yes (no cat)':'no record'}`)
}
console.log(`=== CATEGORY GAPS: ${canFill.length + needHuman.length} total ===`)
console.log(`\n--- ERP CAN FILL (${canFill.length}) ---`)
canFill.forEach(r => console.log(r))
console.log(`\n--- NEEDS HUMAN (${needHuman.length}) ---`)
needHuman.forEach(r => console.log(r))
