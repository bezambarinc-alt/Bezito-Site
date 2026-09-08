import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { campaignKey?: string }
  const { campaignKey } = body
  if (!campaignKey) return NextResponse.json({ error: 'campaignKey required' }, { status: 400 })

  const token = await getZohoToken()

  const params = new URLSearchParams({
    campaignKey,
    resfmt: 'JSON',
    schedule_type: 'immediate',
  })

  const res = await fetch(`https://campaigns.zoho.com/api/v1.1/sendcampaign?${params}`, {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  })

  const data = await res.json() as { code?: number; message?: string; status?: string }

  if (data.code === 401) {
    invalidateZohoToken()
    return NextResponse.json({ error: 'Auth expired — retry' }, { status: 502 })
  }

  if (data.code === 6611) {
    return NextResponse.json(
      { error: 'Content not reviewed. Open Zoho Campaigns → Review Content → then retry.' },
      { status: 422 },
    )
  }

  if (data.code !== 0 && data.status !== 'success') {
    return NextResponse.json(
      { error: data.message ?? `Zoho error ${data.code}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
