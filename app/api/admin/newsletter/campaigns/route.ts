import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bezambar.com'
const DEFAULT_FROM_EMAIL = process.env.ZOHO_FROM_EMAIL ?? 'service@bezambar.com'
const DEFAULT_FROM_NAME = process.env.ZOHO_FROM_NAME ?? 'Bez Ambar'
// Zoho v2 requires topicId for accounts with topic management enabled.
// ID sourced from GET /api/admin/newsletter/topics — "Marketing" topic.
const TOPIC_ID = process.env.ZOHO_TOPIC_ID ?? '1694590000000049009'

/** Remove any HTML tags/angle brackets and collapse whitespace. These fields
 *  are plain-text campaign metadata, never markup — strip it so nothing is
 *  carried into Zoho or the email client. */
function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '') // drop tags
    .replace(/[<>]/g, '')     // drop stray angle brackets
    .replace(/\s+/g, ' ')     // collapse whitespace / newlines
    .trim()
}

const stripped = (max: number) =>
  z.string().transform(stripHtml).pipe(z.string().min(1).max(max))

const BodySchema = z.object({
  name: stripped(200),
  subject: stripped(500),
  // Zoho list keys are long alphanumeric identifiers — reject anything else.
  listKey: z.string().trim().min(1).max(128).regex(/^[a-zA-Z0-9]+$/, 'invalid listKey'),
  fromEmail: z.string().trim().email().max(200).optional(),
  fromName: z.string().transform(stripHtml).pipe(z.string().min(1).max(100)).optional(),
  // Used verbatim in content_url path — restrict to a safe slug (no traversal/scheme).
  templateSlug: z.string().trim().min(1).max(64).regex(/^[a-z0-9-]+$/, 'invalid templateSlug').default('newsletter-welcome'),
  replyTo: z.string().trim().email().max(200).optional(),
})

/**
 * POST /api/admin/newsletter/campaigns
 * Creates a Zoho Campaigns email campaign. Called conversationally by Bezito
 * (agent JWT) or from the admin dashboard (session cookie).
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const { name, subject, listKey, templateSlug, replyTo } = parsed.data
  const fromEmail = parsed.data.fromEmail ?? DEFAULT_FROM_EMAIL
  const fromName = parsed.data.fromName ?? DEFAULT_FROM_NAME
  const contentUrl = `${BASE_URL}/api/email-template/${templateSlug}`

  const token = await getZohoToken()

  // list_details: JSON-encoded object, listkey → empty array means all contacts
  const listDetails = JSON.stringify({ [listKey]: [] })

  const params = new URLSearchParams({
    resfmt: 'json',
    campaignname: name,
    subject,
    from_email: fromEmail,
    from_name: fromName,
    reply_to: replyTo ?? fromEmail,
    list_details: listDetails,
    content_url: contentUrl,
    topicId: TOPIC_ID,
  })

  let data: { status?: string; message?: string; campaign_key?: string; code?: number | string }
  try {
    // Zoho Campaigns POST expects params in the request body (application/x-www-form-urlencoded)
    const res = await fetch('https://campaigns.zoho.com/api/v1.1/createCampaign', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
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

  // Zoho Campaigns returns code as a string ("0") unlike CRM which uses numbers
  const code = Number(data.code)

  if (code === 401) {
    invalidateZohoToken()
    return NextResponse.json({ error: 'Auth expired — retry' }, { status: 502 })
  }

  if (data.status !== 'success' || !data.campaign_key) {
    return NextResponse.json(
      { error: data.message ?? `Zoho error ${data.code ?? 'unknown'}` },
      { status: 502 },
    )
  }

  const campaignKey = data.campaign_key
  const zohoUrl = `https://campaigns.zoho.com/home#campaigns-detail/${campaignKey}/overview`

  return NextResponse.json({
    campaignKey,
    name,
    subject,
    listKey,
    contentUrl,
    zohoUrl,
  })
}
