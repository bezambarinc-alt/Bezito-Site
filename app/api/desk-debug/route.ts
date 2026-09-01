// TEMPORARY debug endpoint — remove after Desk ticket creation is confirmed working
import { NextResponse } from 'next/server'
import { getZohoToken } from '@/lib/zoho-auth'

const DEPT_ID = '1432890000000006907'

export async function GET() {
  try {
    const token = await getZohoToken()

    // Step 1: resolve org ID
    const orgResp = await fetch('https://desk.zoho.com/api/v1/organizations', {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    const orgBody = await orgResp.json() as { data?: Array<{ id: number | string }> }
    const orgId = String(orgBody.data?.[0]?.id ?? '')

    if (!orgId) {
      return NextResponse.json({ error: 'No orgId', orgStatus: orgResp.status, orgBody })
    }

    // Step 2: test ticket POST
    const ticketResp = await fetch('https://desk.zoho.com/api/v1/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
        orgId,
      },
      body: JSON.stringify({
        subject: 'DEBUG TEST — Ring Resizing — Bez Ambar Test',
        departmentId: DEPT_ID,
        email: 'test-debug@bezambar-test.com',
        description: 'Automated debug test — safe to delete',
      }),
    })
    const ticketBody = await ticketResp.text()
    let ticketJson: unknown
    try { ticketJson = JSON.parse(ticketBody) } catch { ticketJson = ticketBody }

    return NextResponse.json({
      orgId,
      ticketStatus: ticketResp.status,
      ticketBody: ticketJson,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
