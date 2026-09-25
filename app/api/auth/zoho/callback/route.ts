import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * Zoho OAuth callback — exchanges the authorization code for a refresh token
 * and persists it in Neon so zoho-auth.ts picks it up automatically.
 *
 * Flow:
 *  1. Run the OAuth authorization URL (see lib/zoho-auth.ts header for scope list)
 *  2. Zoho redirects here with ?code=...
 *  3. This route exchanges the code server-side — no 60-second relay needed
 *  4. New refresh token is stored in the zoho_tokens table
 *  5. All subsequent getZohoToken() calls use the new token automatically
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl

  const error = searchParams.get('error')
  if (error) {
    return NextResponse.json({ error, description: searchParams.get('error_description') }, { status: 400 })
  }

  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 })
  }

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    return NextResponse.json({ error: 'zoho_env_not_configured' }, { status: 500 })
  }

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? 'https://accounts.zoho.com'
  // Mirror the redirect_uri to whichever domain received this callback — must
  // match exactly what was used in the authorization URL.
  const redirectUri = `${origin}/api/auth/zoho/callback`

  const tokenRes = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    }),
  })

  const data = await tokenRes.json() as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    error?: string
  }

  if (!tokenRes.ok || data.error || !data.refresh_token) {
    return NextResponse.json(
      { error: data.error ?? 'exchange_failed', detail: data },
      { status: 400 },
    )
  }

  await sql(
    `INSERT INTO zoho_tokens (id, refresh_token, updated_at)
     VALUES ('bezambar_site', $1, now())
     ON CONFLICT (id) DO UPDATE SET refresh_token = EXCLUDED.refresh_token, updated_at = now()`,
    [data.refresh_token],
  )

  return NextResponse.json({ ok: true, message: 'Zoho refresh token updated. All subsequent API calls will use the new token.' })
}
