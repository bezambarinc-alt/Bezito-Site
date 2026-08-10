// Probe the correct Plytix products endpoint. Plytix uses POST /products/search
// with a body (filters + attributes), not GET /products.
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
console.log('token ok:', !!token)

// Try POST /products/search (the documented listing endpoint)
const search = await fetch('https://pim.plytix.com/api/v1/products/search', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: [],
    attributes: ['sku', 'label', 'assets'],
    pagination: { page: 1, page_size: 5 },
  }),
})
console.log('POST /products/search status:', search.status)
const sj = await search.json().catch(e => ({ err: String(e) }))
console.log('body:', JSON.stringify(sj).slice(0, 900))
