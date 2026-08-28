/**
 * Zoho OAuth token helper — Server-based Application (refresh_token grant).
 * Caches the access token using expires_in from the token response minus 5 min.
 *
 * All Zoho API callers import getZohoToken(). On a 401 from the Zoho API,
 * call invalidateZohoToken() before the next attempt so a fresh token is fetched.
 *
 * Env vars: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 * DC: accounts.zoho.com (US org confirmed). Override via ZOHO_ACCOUNTS_URL if org moves.
 */

let cachedToken: string | null = null
let tokenExpiresAt = 0

/** Call on 401 from any Zoho API — forces a fresh token fetch next call. */
export function invalidateZohoToken(): void {
  cachedToken = null
  tokenExpiresAt = 0
}

export async function getZohoToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    throw new Error('Zoho OAuth env vars not configured (ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN)')
  }

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? 'https://accounts.zoho.com'
  const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN,
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
