import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { parseUA, classifySource, classifyPath, hashIp } from '@/lib/track'

// Node runtime — needs pg (Edge can't use it). proxy.ts fires this fire-and-forget.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Internal page-view logger. Called only by proxy.ts with an internal secret
 * header — never meant to be hit directly by the public.
 */
export async function POST(req: NextRequest) {
  // Only proxy.ts (same deployment) may call this
  if (req.headers.get('x-track-secret') !== process.env.TRACK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let body: {
    path?: string; referer?: string; ua?: string; ip?: string
    city?: string; region?: string; country?: string
    utm_source?: string; utm_medium?: string; utm_campaign?: string
    session_id?: string
  }
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const path = (body.path || '/').split('?')[0]
  const { device, browser, os, isBot } = parseUA(body.ua || '')
  const { pageType, sku } = classifyPath(path)
  const source = classifySource(body.referer || '', body.utm_source, body.utm_medium)
  const ipHash = await hashIp(body.ip || 'unknown', process.env.TRACK_SECRET || 'salt')

  try {
    await sql(
      `INSERT INTO page_views
        (path, page_type, sku, referer, source, utm_source, utm_medium, utm_campaign,
         device, browser, os, city, region, country, ip_hash, session_id, is_bot)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        path, pageType, sku, body.referer || null, source,
        body.utm_source || null, body.utm_medium || null, body.utm_campaign || null,
        device, browser, os, body.city || null, body.region || null, body.country || null,
        ipHash, body.session_id || null, isBot,
      ],
    )
  } catch {
    // Analytics must never break the site — swallow errors
    return NextResponse.json({ ok: false })
  }
  return NextResponse.json({ ok: true })
}
