// Apply the 6 that failed (429 mid-run). Use full-list sku->id map (1 search),
// then PATCH each with retry/backoff. Idempotent.
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

// one search -> full id map
const all = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku'], pagination: { page:1, page_size:100 } }),
})
const map = new Map((await all.json()).data.map(p => [p.sku, p.id]))

const REMAIN = { C0785: 'Pendants', '4HSR21': 'Pendants', '1C3S': 'Rings', C0845: 'Earrings', C0765: 'Rings', C0346: 'Pendants' }

async function patch(id, cat) {
  for (let a = 0; a < 6; a++) {
    const r = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, {
      method: 'PATCH', headers: H, body: JSON.stringify({ attributes: { category: cat } }),
    })
    if (r.status === 429) { await sleep(1500 * (a + 1)); continue }
    return r.status
  }
  return 429
}

let ok = 0; const fails = []
for (const [sku, cat] of Object.entries(REMAIN)) {
  const id = map.get(sku)
  if (!id) { fails.push(`${sku}: no id in full map`); continue }
  const st = await patch(id, cat)
  if (st === 200) { console.log(`OK  ${sku} -> ${cat}`); ok++ } else fails.push(`${sku}: ${st}`)
  await sleep(600)
}
console.log(`\napplied ${ok}/${Object.keys(REMAIN).length}`)
if (fails.length) fails.forEach(f => console.log('FAIL', f))
