// Full audit of the Plytix PIM: attribute completeness per product, category
// coverage, and which fields are missing. Grounds the cleanup recommendation.
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
async function getR(url) { for (let a=0;a<6;a++){const r=await fetch(url,{headers:H});if(r.status===429){await sleep(1500*(a+1));continue}return r}return null }

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 100 } }),
})
const prods = (await search.json()).data
console.log('TOTAL PRODUCTS:', prods.length, '\n')

// track attribute presence across all products
const attrCount = {}
const noCat = [], noHero = [], noDesc = [], noSubtitle = [], noStone = []
const catCount = {}

for (const item of prods) {
  const d = await getR(`https://pim.plytix.com/api/v1/products/${item.id}`)
  const p = (await d.json()).data?.[0]
  const a = p.attributes || {}
  for (const k of Object.keys(a)) attrCount[k] = (attrCount[k]||0)+1
  await sleep(120)
  const c = await getR(`https://pim.plytix.com/api/v1/products/${item.id}/categories`)
  const cats = (await c.json()).data || []
  if (cats.length) { const n=cats[0].name; catCount[n]=(catCount[n]||0)+1 } else noCat.push(item.sku)
  if (!a.hero_visual) noHero.push(item.sku)
  if (!a.description && !a.editorial) noDesc.push(item.sku)
  if (!a.subtitle) noSubtitle.push(item.sku)
  if (!a.stone_shape) noStone.push(item.sku)
  await sleep(120)
}

console.log('=== ATTRIBUTE COVERAGE (present on N of ' + prods.length + ') ===')
Object.entries(attrCount).sort((a,b)=>b[1]-a[1]).forEach(([k,n])=>console.log(`  ${k}: ${n}`))
console.log('\n=== CATEGORY COVERAGE ===')
Object.entries(catCount).forEach(([k,n])=>console.log(`  ${k}: ${n}`))
console.log('  UNCATEGORIZED:', noCat.length, '->', noCat.join(', '))
console.log('\n=== GAPS ===')
console.log('no hero_visual:', noHero.length, noHero.length?('-> '+noHero.join(', ')):'')
console.log('no description/editorial:', noDesc.length, noDesc.length?('-> '+noDesc.join(', ')):'')
console.log('no subtitle:', noSubtitle.length)
console.log('no stone_shape:', noStone.length)
