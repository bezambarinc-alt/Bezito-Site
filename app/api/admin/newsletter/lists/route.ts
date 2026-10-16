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
  const res = await fetch(`https://campaigns.zoho.com/api/v1.1/getmailinglists?${params}`, {
    signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  })

  const data = await res.json() as { list_of_details?: unknown[]; code?: number; message?: string; status?: string }

  if (data.code === 401) {
    invalidateZohoToken()
    return NextResponse.json({ error: 'Auth expired — retry' }, { status: 502 })
  }

  if (data.code && data.code !== 0) {
    return NextResponse.json({ error: data.message ?? `Zoho error ${data.code}` }, { status: 502 })
  }

  return NextResponse.json({ lists: data.list_of_details ?? [] })
}
