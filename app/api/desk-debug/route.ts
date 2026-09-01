// TEMPORARY debug endpoint — remove after Desk ticket creation is confirmed working
import { NextResponse } from 'next/server'
import { getZohoToken } from '@/lib/zoho-auth'

const DEPT_ID = '1432890000000006907'
const TEST_EMAIL = 'test-debug@bezambar-test.com'

async function deskHeaders(token: string, orgId: string) {
  return {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
    orgId,
  }
}

export async function GET() {
  try {
    const token = await getZohoToken()

    // Step 1: resolve org ID
    const orgResp = await fetch('https://desk.zoho.com/api/v1/organizations', {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    const orgBody = await orgResp.json() as { data?: Array<{ id: number | string }> }
    const orgId = String(orgBody.data?.[0]?.id ?? '')
    if (!orgId) return NextResponse.json({ error: 'No orgId', orgBody })

    const h = await deskHeaders(token, orgId)

    // Try creating ticket using contactEmail (Zoho auto-looks up or creates contact)
    const ticketResp = await fetch('https://desk.zoho.com/api/v1/tickets', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        subject: 'DEBUG TEST — Ring Resizing — safe to delete',
        departmentId: DEPT_ID,
        contactEmail: TEST_EMAIL,
        description: 'Automated debug test',
      }),
    })
    const ticketBody = await ticketResp.text()
    let ticketJson: unknown
    try { ticketJson = JSON.parse(ticketBody) } catch { ticketJson = ticketBody }

    return NextResponse.json({ orgId, approach: 'contactEmail', ticketStatus: ticketResp.status, ticketBody: ticketJson })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
