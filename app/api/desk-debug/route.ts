// TEMPORARY debug endpoint — remove after Desk ticket creation is confirmed working
import { NextResponse } from 'next/server'
import { getZohoToken } from '@/lib/zoho-auth'
import { sql } from '@/lib/db'

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
    const searchText = await searchResp.text()
    let searchBody: { data?: Array<{ id: string }> } = {}
    try { searchBody = JSON.parse(searchText) } catch { /* empty = no results */ }
    let contactId = searchBody.data?.[0]?.id ?? null

    // Step 3: create contact if not found
    let contactCreated = false
    if (!contactId) {
      const createResp = await fetch('https://desk.zoho.com/api/v1/contacts', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ email: TEST_EMAIL, lastName: 'Debug-Test' }),
      })
      const createText = await createResp.text()
      let createBody: { id?: string } = {}
      try { createBody = JSON.parse(createText) } catch { /* ignore */ }
      contactId = createBody.id ?? null
      contactCreated = true
      if (!contactId) return NextResponse.json({ error: 'Contact create failed', createStatus: createResp.status, createText })
    }

    // Step 4: create ticket
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
    const ticketText = await ticketResp.text()
    let ticketJson: unknown
    try { ticketJson = JSON.parse(ticketText) } catch { ticketJson = ticketText }

    // Also pull recent service intent leads from Neon
    const recentLeads = await sql<{ id: number; email: string; intent: string; crm_status: string; crm_id: string | null }>(
      `SELECT id, email, intent, crm_status, crm_id FROM leads WHERE intent IN ('Ring Resizing','Repair & Cleaning','Ring Sizing Appointment') ORDER BY id DESC LIMIT 10`
    )

    return NextResponse.json({ orgId, contactId, contactCreated, ticketStatus: ticketResp.status, ticketBody: ticketJson, recentLeads })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
