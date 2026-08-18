// Shared env loader for all admin scripts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../../.env.local')

export const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

export const BEZITO_SECRET = env.BEZITO_SECRET
export const PLYTIX_API_KEY = env.PLYTIX_API_KEY
export const PLYTIX_API_PASSWORD = env.PLYTIX_API_PASSWORD
export const BASE_URL = 'https://bezambar-nextjs.vercel.app'

if (!BEZITO_SECRET) { console.error('BEZITO_SECRET not set in .env.local'); process.exit(1) }

// Plytix auth — cached per process
let _plytixToken = null
export async function plytixToken() {
  if (_plytixToken) return _plytixToken
  const res = await fetch('https://auth.plytix.com/auth/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: PLYTIX_API_KEY, api_password: PLYTIX_API_PASSWORD }),
  })
  const json = await res.json()
  _plytixToken = json?.data?.[0]?.token
  if (!_plytixToken) { console.error('Plytix auth failed:', JSON.stringify(json)); process.exit(1) }
  return _plytixToken
}

export function agentHeaders() {
  return { 'Authorization': `Bearer ${BEZITO_SECRET}`, 'Content-Type': 'application/json' }
}
