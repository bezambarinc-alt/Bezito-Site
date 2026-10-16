import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

// Sending is the destructive/costly action — intentionally session-only
// (human in the loop). Agent/Bezito can create campaigns but not fire them.
const BodySchema = z.object({
  // Zoho campaign keys are long alphanumeric identifiers — reject anything else.
  campaignKey: z.string().trim().min(1).max(128).regex(/^[a-zA-Z0-9]+$/, 'invalid campaignKey'),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'campaignKey required' }, { status: 400 })
  const { campaignKey } = parsed.data

  const token = await getZohoToken()

  const params = new URLSearchParams({
    campaignKey,
    resfmt: 'json',
    schedule_type: 'immediate',
  })

  let data: { code?: number; message?: string; status?: string }
  try {
    const res = await fetch('https://campaigns.zoho.com/api/v1.1/sendcampaign', {
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
    return NextResponse.json({ error: `Zoho Campaigns ${reason} — please retry` }, { status: 502 })
  }

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
