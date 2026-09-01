// TEMPORARY debug endpoint — remove after Desk token issue is resolved
import { NextResponse } from 'next/server'
import { getZohoToken } from '@/lib/zoho-auth'

export async function GET() {
  try {
    const token = await getZohoToken()

    const orgResp = await fetch('https://desk.zoho.com/api/v1/organizations', {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    const orgBody = await orgResp.text()
    let orgJson: unknown
    try { orgJson = JSON.parse(orgBody) } catch { orgJson = orgBody }

    return NextResponse.json({ orgStatus: orgResp.status, orgBody: orgJson })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
