// Why did 6 SKUs fail to resolve an id? Try alternate lookups for each.
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

// pull ALL products, build sku->id map (the reliable way)
const all = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku','label'], pagination: { page:1, page_size:100 } }),
})
const map = new Map((await all.json()).data.map(p => [p.sku, p.id]))

const fails = ['C0785','4HSR21','1C3S','C0845','C0765','C0346']
for (const sku of fails) {
  console.log(sku, '-> id in full list:', map.get(sku) || 'NOT FOUND')
}
// also test the eq-filter that failed
console.log('\n--- test eq filter for C0785 ---')
const r = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [[{ field:'sku', operator:'eq', value:'C0785' }]], attributes:['sku'], pagination:{page:1,page_size:1} }),
})
console.log('eq-filter status', r.status, JSON.stringify(await r.json()).slice(0,200))
