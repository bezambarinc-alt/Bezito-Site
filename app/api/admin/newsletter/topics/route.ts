import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

/** GET /api/admin/newsletter/topics — fetch topics from Zoho Campaigns */
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
  if (code === 401) { invalidateZohoToken(); return NextResponse.json({ error: 'Auth expired' }, { status: 502 }) }
  if (data.status === 'error') return NextResponse.json({ error: data.message ?? `Zoho error ${data.code}` }, { status: 502 })

  return NextResponse.json({ topics: data.list_of_details ?? [] })
}

/** POST /api/admin/newsletter/topics — create a new topic in Zoho Campaigns */
export async function POST(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as { topic_name?: string; topic_desc?: string } | null
  if (!body?.topic_name?.trim() || !body?.topic_desc?.trim()) {
    return NextResponse.json({ error: 'topic_name and topic_desc required' }, { status: 400 })
  }

  const token = await getZohoToken()

  // Zoho expects details as a pseudo-JSON object with unquoted keys in the POST body
  const details = `{topic_name:${encodeURIComponent(body.topic_name.trim())},topic_desc:${encodeURIComponent(body.topic_desc.trim())}}`
  const params = new URLSearchParams({ resfmt: 'json', details })

  let data: { status?: string; message?: string; code?: number | string; topic_id?: string }
  try {
    const res = await fetch('https://campaigns.zoho.com/api/v1.1/topics', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    data = await res.json()
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timed out' : 'unreachable'
    return NextResponse.json({ error: `Zoho Campaigns ${reason}` }, { status: 502 })
  }

  const code = Number(data.code)
  if (code === 401) { invalidateZohoToken(); return NextResponse.json({ error: 'Auth expired' }, { status: 502 }) }
  if (data.status !== 'success') {
    return NextResponse.json({ error: data.message ?? `Zoho error ${data.code}`, _zoho: data }, { status: 502 })
  }

  return NextResponse.json({ topicId: data.topic_id, name: body.topic_name.trim() })
}
