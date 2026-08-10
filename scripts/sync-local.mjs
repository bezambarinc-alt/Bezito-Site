// Run the sync loop LOCALLY with per-product logging to see exactly where 47 drop.
import { readFileSync } from 'node:fs'
import pg from 'pg'
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

const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: [], attributes: ['sku', 'label'], pagination: { page: 1, page_size: 100 } }),
})
const list = (await search.json()).data
console.log('listed:', list.length)

const str = v => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const detectType = url => /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image'

const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 4, ssl: { rejectUnauthorized: false } })
const sleep = ms => new Promise(r => setTimeout(r, ms))
// Fetch detail with retry/backoff on 429 (Plytix rate-limits rapid detail calls).
async function getDetail(id) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const d = await fetch(`https://pim.plytix.com/api/v1/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (d.status === 429) { await sleep(1500 * (attempt + 1)); continue }
    return d
  }
  return null
}
let ok = 0, skip = 0, err = 0
for (const item of list) {
  try {
    const d = await getDetail(item.id)
    if (!d) { skip++; console.log('SKIP (429 exhausted):', item.sku); continue }
    const p = (await d.json()).data?.[0]
    if (!p?.sku) { skip++; console.log('SKIP (no sku):', item.sku, 'detail-status', d.status); continue }
    await sleep(250) // gentle pacing between products
    const a = p.attributes ?? {}
    const heroVisual = str(a.hero_visual), editorialVisual = str(a.editorial_visual)
    const specs = { subtitle: str(a.subtitle), lede: str(a.description) ?? str(a.editorial), codeName: str(p.label), metal: str(a.metal), gemStone: str(a.stone_shape), caratWeight: str(a.stone_carats) ?? str(a.total_carat_weight), color: str(a.stone_color), clarity: str(a.stone_clarity), madeIn: 'Los Angeles', category: str(a.category) ?? 'jewelry', heroVideoUrl: heroVisual && detectType(heroVisual) === 'video' ? heroVisual : undefined, heroPosterUrl: editorialVisual && detectType(editorialVisual) === 'image' ? editorialVisual : undefined }
    Object.keys(specs).forEach(k => specs[k] === undefined && delete specs[k])
    const media = []
    if (heroVisual) media.push({ url: heroVisual, type: detectType(heroVisual), label: 'Hero' })
    if (editorialVisual && editorialVisual !== heroVisual) media.push({ url: editorialVisual, type: detectType(editorialVisual), label: 'Editorial' })
    await pool.query(
      `INSERT INTO products(sku, plytix_id, name, specs, media, synced_at) VALUES ($1,$2,$3,$4,$5,now()) ON CONFLICT (sku) DO UPDATE SET plytix_id=$2, name=$3, specs=$4, media=$5, synced_at=now()`,
      [p.sku, p.id, str(p.label) ?? p.sku, JSON.stringify(specs), JSON.stringify(media)],
    )
    ok++
  } catch (e) {
    err++; console.log('ERR:', item.sku, '->', String(e.message).slice(0, 120))
  }
}
console.log(`\nok=${ok} skip=${skip} err=${err}`)
const c = await pool.query('SELECT count(*)::int n FROM products')
console.log('DB count now:', c.rows[0].n)
await pool.end()
