// LIVE WRITE (approved): apply category to the 23 gap products.
//  - 17 ERP-fillable (ERP cat -> Title Case of the 6 options)
//  - 6 human-provided (Kevin's specs)
// FILL-ONLY: only products currently WITHOUT a category are touched.
// C0845 Cadence held out (suspect earring@55ct) unless Kevin confirmed — Kevin
// said "use the categories i provided" -> the 6 humans + the 17 ERP list as shown.
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
const sleep = ms => new Promise(r => setTimeout(r, ms))

// Map to the 6 valid dropdown options (Title Case). ERP 'band' -> 'Bands' etc.
const norm = c => ({
  ring: 'Rings', rings: 'Rings',
  band: 'Bands', bands: 'Bands', 'wedding band': 'Bands', 'wedding bands': 'Bands',
  bracelet: 'Bracelets', bracelets: 'Bracelets',
  necklace: 'Necklaces', necklaces: 'Necklaces',
  earring: 'Earrings', earrings: 'Earrings',
  pendant: 'Pendants', pendants: 'Pendants',
}[String(c).toLowerCase().trim()] || null)

// Final approved category per SKU (17 ERP + 6 human). VEGA already patched but re-set is idempotent.
const PLAN = {
  // ERP-fillable 17
  C0711: 'Necklaces', C0844: 'Necklaces', C0493: 'Bracelets', C0863: 'Earrings',
  B5671: 'Bracelets', C0799: 'Pendants', C0895: 'Rings', B9925: 'Necklaces',
  C0786: 'Bands', C0779: 'Bracelets', C0785: 'Pendants', '4HSR21': 'Pendants',
  '1C3S': 'Rings', C0845: 'Earrings', C0765: 'Rings', C0346: 'Pendants', B5062: 'Pendants',
  // human-provided 6
  VEGA: 'Rings', R09014: 'Rings', C0869: 'Bracelets', R09142: 'Bands',
  C0878: 'Rings', 'CEYLON-SAPPHIRE-1130': 'Rings',
}

// resolve each SKU -> product id (search eq)
async function findId(sku) {
  const r = await fetch('https://pim.plytix.com/api/v1/products/search', {
    method: 'POST', headers: H,
    body: JSON.stringify({ filters: [[{ field: 'sku', operator: 'eq', value: sku }]], attributes: ['sku'], pagination: { page:1, page_size:1 } }),
  })
  return (await r.json()).data?.[0]?.id
}

let ok = 0; const fails = []
for (const [sku, cat] of Object.entries(PLAN)) {
  const c = norm(cat)
  if (!c) { fails.push(`${sku}: invalid cat ${cat}`); continue }
  const id = await findId(sku)
  if (!id) { fails.push(`${sku}: no id`); continue }
  const res = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
    method: 'PATCH', headers: H, body: JSON.stringify({ attributes: { category: c } }),
  })
  if (res.status === 200) { console.log(`OK  ${sku} -> ${c}`); ok++ }
  else { const j = await res.json().catch(()=>({})); fails.push(`${sku}: ${res.status} ${JSON.stringify(j).slice(0,120)}`) }
  await sleep(250)
}
console.log(`\napplied ${ok}/${Object.keys(PLAN).length}`)
if (fails.length) { console.log('FAILS:'); fails.forEach(f => console.log('  ', f)) }
