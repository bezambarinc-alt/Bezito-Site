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

    // Step 2: search for existing contact by email
    const searchResp = await fetch(
      `https://desk.zoho.com/api/v1/contacts/search?email=${encodeURIComponent(TEST_EMAIL)}`,
      { headers: h },
    )
    const searchBody = await searchResp.json() as { data?: Array<{ id: string }> }
    let contactId = searchBody.data?.[0]?.id ?? null

    // Step 3: create contact if not found
    let contactCreated = false
    if (!contactId) {
      const createResp = await fetch('https://desk.zoho.com/api/v1/contacts', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ email: TEST_EMAIL, lastName: 'Debug-Test' }),
      })
      const createBody = await createResp.json() as { id?: string }
      contactId = createBody.id ?? null
      contactCreated = true
    }

    if (!contactId) {
      return NextResponse.json({ error: 'Could not find or create contact', searchBody })
    }

    // Step 4: create ticket with contactId
    const ticketResp = await fetch('https://desk.zoho.com/api/v1/tickets', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        subject: 'DEBUG TEST — Ring Resizing — safe to delete',
        departmentId: DEPT_ID,
        contactId,
        description: 'Automated debug test',
      }),
    })
    const ticketBody = await ticketResp.text()
    let ticketJson: unknown
    try { ticketJson = JSON.parse(ticketBody) } catch { ticketJson = ticketBody }

    return NextResponse.json({ orgId, contactId, contactCreated, ticketStatus: ticketResp.status, ticketBody: ticketJson })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
