// Zoho OAuth callback — exchanges auth code for refresh token.
// Visit this URL after completing Zoho authorization to get your refresh token.
// Update ZOHO_REFRESH_TOKEN in Vercel env vars, then delete this file.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error) {
    return new NextResponse(`Zoho auth error: ${error}`, { status: 400 })
  }
  if (!code) {
    return new NextResponse('Missing code parameter', { status: 400 })
  }

  const clientId = process.env.ZOHO_CLIENT_ID!
  const clientSecret = process.env.ZOHO_CLIENT_SECRET!
  const redirectUri = `${process.env.APP_URL ?? 'https://bezambar-web2026.vercel.app'}/api/auth/zoho/callback`

  const resp = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  const json = await resp.json() as {
    refresh_token?: string
    access_token?: string
    scope?: string
    error?: string
  }

  if (json.error || !json.refresh_token) {
    return NextResponse.json({ error: json.error, detail: json }, { status: 400 })
  }

  return new NextResponse(`
<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;max-width:800px">
<h2>✅ Zoho OAuth Complete</h2>
<p><strong>Scopes granted:</strong> ${json.scope}</p>
<p><strong>Copy this refresh token and update <code>ZOHO_REFRESH_TOKEN</code> in Vercel:</strong></p>
<textarea style="width:100%;height:120px;font-size:12px">${json.refresh_token}</textarea>
<p style="color:#888;font-size:13px">After updating Vercel: delete <code>app/api/auth/zoho/callback/route.ts</code> and this endpoint.</p>
</body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
