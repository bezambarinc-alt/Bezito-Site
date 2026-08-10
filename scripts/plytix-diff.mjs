// Which Plytix products did NOT land in the DB, and why? Compare search list vs
// DB, then GET detail on 3 missing ones to see their shape.
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
const listSkus = new Set(list.map(p => p.sku))

const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 2, ssl: { rejectUnauthorized: false } })
const db = await pool.query('SELECT sku FROM products')
const dbSkus = new Set(db.rows.map(r => r.sku))
await pool.end()

const missing = list.filter(p => !dbSkus.has(p.sku))
console.log('search list:', list.length, '| in DB:', dbSkus.size, '| missing:', missing.length)
console.log('MISSING skus:', missing.map(p => p.sku).join(', '))

// inspect detail shape of 3 missing
for (const m of missing.slice(0, 3)) {
  const d = await fetch(`https://pim.plytix.com/api/v1/products/${m.id}`, { headers: { Authorization: `Bearer ${token}` } })
  const p = (await d.json()).data?.[0]
  console.log(`\n--- ${m.sku} (id ${m.id}) detail status ${d.status} ---`)
  console.log('sku in detail:', p?.sku, '| attr keys:', Object.keys(p?.attributes || {}).length, '| num_variations:', p?.num_variations)
}
