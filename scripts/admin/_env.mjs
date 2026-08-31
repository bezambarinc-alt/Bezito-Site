// Shared env loader for all admin scripts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { SignJWT } from 'jose'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../../.env.local')

export const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

export const BEZITO_SECRET = env.BEZITO_SECRET
export const ZOHO_CLIENT_ID = env.ZOHO_CLIENT_ID
export const ZOHO_CLIENT_SECRET = env.ZOHO_CLIENT_SECRET
export const ZOHO_REFRESH_TOKEN = env.ZOHO_REFRESH_TOKEN
export const BASE_URL = 'https://bezambar-nextjs.vercel.app'

// BEZITO_NEON_READONLY_URL — optional direct Neon access for read-only queries.
// Set this in .env.local after running db/migrations/013_bezito_readonly.sql.
// When set, scripts can query Neon directly instead of going through the HTTP API.
export const BEZITO_NEON_READONLY_URL = env.BEZITO_NEON_READONLY_URL || null

if (!BEZITO_SECRET) { console.error('BEZITO_SECRET not set in .env.local'); process.exit(1) }

// Mint a short-lived JWT signed with BEZITO_SECRET.
// Scripts are short-lived processes (seconds), so minting once at load is safe.
const _jwtSecret = new TextEncoder().encode(BEZITO_SECRET)
export const AGENT_TOKEN = await new SignJWT({ sub: 'bezito-agent', actor: 'bezito' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('15m')
  .sign(_jwtSecret)

export function agentHeaders(extra = {}) {
  return { 'Authorization': `Bearer ${AGENT_TOKEN}`, 'Content-Type': 'application/json', ...extra }
}

// Zoho CRM auth — cached per process (access tokens last 1h)
let _zohoToken = null
export async function zohoToken() {
  if (_zohoToken) return _zohoToken
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    console.error('Zoho env vars not set in .env.local (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)')
    process.exit(1)
  }
  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN,
    }),
  })
  const json = await res.json()
  if (!json.access_token) { console.error('Zoho auth failed:', JSON.stringify(json)); process.exit(1) }
  _zohoToken = json.access_token
  return _zohoToken
}

export function zohoHeaders(token) {
  return { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' }
}

export const ZOHO_CRM = 'https://www.zohoapis.com/crm/v3'
