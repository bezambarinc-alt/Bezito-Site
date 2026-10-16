import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

/** GET /api/admin/newsletter/topics — fetch topic list from Zoho Campaigns */
export async function GET(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getZohoToken()

  let data: { status?: string; message?: string; code?: number | string; list_of_details?: unknown[] }
  try {
    const res = await fetch('https://campaigns.zoho.com/api/v1.1/topics?resfmt=json&from_index=1&range=50', {
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    data = await res.json()
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timed out' : 'unreachable'
    return NextResponse.json({ error: `Zoho Campaigns ${reason}` }, { status: 502 })
  }

  const code = Number(data.code)
  if (code === 401) {
    invalidateZohoToken()
    return NextResponse.json({ error: 'Auth expired — retry' }, { status: 502 })
  }
  if (data.status === 'error') {
    return NextResponse.json({ error: data.message ?? `Zoho error ${data.code}` }, { status: 502 })
  }

  return NextResponse.json({ topics: data.list_of_details ?? [] })
}
