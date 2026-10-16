import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

/** GET /api/admin/newsletter/lists — fetch mailing lists from Zoho Campaigns */
export async function GET(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getZohoToken()

  const params = new URLSearchParams({ resfmt: 'JSON', fromindex: '1', range: '50' })
  let data: { list_of_details?: unknown[]; code?: number; message?: string; status?: string }
  try {
    const res = await fetch(`https://campaigns.zoho.com/api/v1.1/getmailinglists?${params}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    data = await res.json()
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timed out' : 'unreachable'
    return NextResponse.json({ error: `Zoho Campaigns ${reason} — please retry` }, { status: 502 })
  }

  // Zoho Campaigns returns code as a string ("0") unlike CRM which uses numbers
  const code = Number(data.code)

  if (code === 401) {
    invalidateZohoToken()
    return NextResponse.json({ error: 'Auth expired — retry' }, { status: 502 })
  }

  if (data.status === 'error' || (code !== 0 && data.code !== undefined)) {
    return NextResponse.json({ error: data.message ?? `Zoho error ${data.code}` }, { status: 502 })
  }

  return NextResponse.json({ lists: data.list_of_details ?? [] })
}
