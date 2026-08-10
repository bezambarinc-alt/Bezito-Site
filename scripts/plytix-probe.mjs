// Probe Plytix directly (local, using pulled env) to see the REAL error/shape.
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const KEY = env.PLYTIX_API_KEY, PW = env.PLYTIX_API_PASSWORD
console.log('key present:', !!KEY, '| pw present:', !!PW)

const authRes = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: KEY, api_password: PW }),
})
console.log('auth status:', authRes.status)
const authJson = await authRes.json().catch(e => ({ parseErr: String(e) }))
console.log('auth body keys:', JSON.stringify(authJson).slice(0, 400))

const token = authJson?.data?.[0]?.token
if (!token) { console.log('NO TOKEN — auth failed'); process.exit(0) }

const prodRes = await fetch('https://pim.plytix.com/api/v1/products?page_size=5', {
  headers: { Authorization: `Bearer ${token}` },
})
console.log('products status:', prodRes.status)
const prodJson = await prodRes.json().catch(e => ({ parseErr: String(e) }))
console.log('products body:', JSON.stringify(prodJson).slice(0, 800))
