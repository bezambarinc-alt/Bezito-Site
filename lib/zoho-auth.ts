/**
 * Zoho OAuth token helper — Server-based Application (refresh_token grant).
 * Caches the access token using expires_in from the token response minus 5 min.
 *
 * All Zoho API callers import getZohoToken(). On a 401 from the Zoho API,
 * call invalidateZohoToken() before the next attempt so a fresh token is fetched.
 *
 * Refresh token source (priority order):
 *  1. zoho_tokens table in Neon — written by /api/auth/zoho/callback
 *  2. ZOHO_REFRESH_TOKEN env var — legacy fallback
 *
 * Env vars: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (fallback)
 * DC: accounts.zoho.com (US org confirmed). Override via ZOHO_ACCOUNTS_URL if org moves.
 */

import { sql } from '@/lib/db'

let cachedToken: string | null = null
let tokenExpiresAt = 0

/** Call on 401 from any Zoho API — forces a fresh token fetch next call. */
export function invalidateZohoToken(): void {
  cachedToken = null
  tokenExpiresAt = 0
}

async function getRefreshToken(): Promise<string> {
  try {
    const rows = await sql<{ refresh_token: string }>(
      `SELECT refresh_token FROM zoho_tokens WHERE id = 'bezambar_site' LIMIT 1`,
    )
    if (rows.length > 0) return rows[0].refresh_token
  } catch {
    // DB unavailable — fall through to env var
  }
  const envToken = process.env.ZOHO_REFRESH_TOKEN
  if (!envToken) throw new Error('Zoho OAuth env vars not configured (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)')
  return envToken
}

export async function getZohoToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    throw new Error('Zoho OAuth env vars not configured (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)')
  }

  const refreshToken = await getRefreshToken()

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? 'https://accounts.zoho.com'
  const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  })

  // Zoho returns 200 even on auth failure — always parse the body before trusting res.ok
  const data = await res.json() as { access_token?: string; expires_in?: number; error?: string }
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(`Zoho token refresh failed: ${res.status} ${data.error ?? ''}`.trim())
  }

  cachedToken = data.access_token
  // Use expires_in from response, subtract 5 min safety buffer (tokens expire in 3600s)
  tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 300) * 1000
  return cachedToken
}

/**
 * Parse a full name string into Zoho First_Name / Last_Name.
 * Zoho requires Last_Name. Falls back to email local-part if no name provided.
 */
export function parseZohoName(
  fullName: string | null | undefined,
  email: string,
): { First_Name?: string; Last_Name: string } {
  const name = fullName?.trim()
  if (!name) return { Last_Name: email.split('@')[0] }
  const spaceIdx = name.indexOf(' ')
  if (spaceIdx === -1) return { Last_Name: name }
  return { First_Name: name.slice(0, spaceIdx), Last_Name: name.slice(spaceIdx + 1) }
}
