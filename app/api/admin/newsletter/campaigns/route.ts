import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bezambar.com'
const DEFAULT_FROM = process.env.ZOHO_FROM_EMAIL ?? 'Bez Ambar <bez@bezambar.com>'

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
  // "Name <email>" display form; strip markup, bound length, require an address.
  fromEmail: z.string().transform(stripHtml).pipe(z.string().min(3).max(200)).optional(),
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
  const fromEmail = parsed.data.fromEmail ?? DEFAULT_FROM
  const contentUrl = `${BASE_URL}/api/email-template/${templateSlug}`

  const token = await getZohoToken()

  const params = new URLSearchParams({
    resfmt: 'JSON',
    campaignName: name,
    campaignSubject: subject,
    from_email: fromEmail,
    reply_to: replyTo ?? fromEmail,
    listkey: listKey,
    content_url: contentUrl,
    campaign_type: 'Regular',
  })

  let data: { status?: string; message?: string; campaign_key?: string; code?: number | string }
  try {
    const res = await fetch(`https://campaigns.zoho.com/api/v1.1/createcampaign?${params}`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    data = await res.json()
  } catch (err) {
    // Network failure / timeout / non-JSON body — never surfaces the token.
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

  return NextResponse.json({
    campaignKey: data.campaign_key,
    name,
    subject,
    listKey,
    contentUrl,
  })
}
