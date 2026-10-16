import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * GET /api/auth/zoho/start — initiates Zoho OAuth re-authorization.
 *
 * Opens the Zoho consent page with CRM + Campaigns scopes. After Bez approves,
 * Zoho redirects to /api/auth/zoho/callback which saves the new refresh token.
 *
 * Pre-requisite (one-time in Zoho API Console):
 *  1. Open the OAuth app (1000.34ZEIWQ...)
 *  2. Under "Services", add Zoho Campaigns
 *  3. Add scopes: ZohoCampaigns.campaign.ALL + ZohoCampaigns.contact.ALL
 *  Then visit /api/auth/zoho/start from the admin.
 */
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ZOHO_CLIENT_ID } = process.env
  if (!ZOHO_CLIENT_ID) {
    return NextResponse.json({ error: 'ZOHO_CLIENT_ID env var not set' }, { status: 500 })
  }

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? 'https://accounts.zoho.com'
  const redirectUri = `${request.nextUrl.origin}/api/auth/zoho/callback`

  const scopes = [
    'ZohoCRM.modules.ALL',
    'ZohoCRM.settings.ALL',
    'ZohoCRM.send_mail.leads.CREATE',
    'ZohoCampaigns.campaign.ALL',
    'ZohoCampaigns.contact.ALL',
  ].join(',')

  const authUrl = new URL(`${accountsUrl}/oauth/v2/auth`)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('client_id', ZOHO_CLIENT_ID)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  return NextResponse.redirect(authUrl.toString())
}
