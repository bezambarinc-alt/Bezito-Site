import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Admin analytics aggregations — one call returns everything the dashboard needs.
 * Human traffic only (is_bot = false). Session-gated.
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [
    kpis, timeseries, sources, geo, devices, topPages, funnel, realtime,
  ] = await Promise.all([
    // KPIs
    sql<{ total: string; unique: string; today: string; leads_week: string }>(
      `SELECT
        (SELECT COUNT(*)                 FROM page_views WHERE is_bot = false)                                        AS total,
        (SELECT COUNT(DISTINCT ip_hash)  FROM page_views WHERE is_bot = false)                                        AS unique,
        (SELECT COUNT(*)                 FROM page_views WHERE is_bot = false AND viewed_at::date = now()::date)       AS today,
        (SELECT COUNT(*)                 FROM leads WHERE created_at > now() - interval '7 days')                      AS leads_week`,
    ),
    // 30-day time-series
    sql<{ day: string; views: string; unique_visitors: string }>(
      `SELECT viewed_at::date::text AS day, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS unique_visitors
       FROM page_views
       WHERE is_bot = false AND viewed_at > now() - interval '30 days'
       GROUP BY viewed_at::date ORDER BY day ASC`,
    ),
    // Traffic sources
    sql<{ source: string; count: string }>(
      `SELECT COALESCE(source,'Direct') AS source, COUNT(*) AS count
       FROM page_views WHERE is_bot = false GROUP BY source ORDER BY count DESC`,
    ),
    // Geo
    sql<{ country: string; views: string }>(
      `SELECT country, COUNT(*) AS views FROM page_views
       WHERE is_bot = false AND country IS NOT NULL AND country != ''
       GROUP BY country ORDER BY views DESC LIMIT 15`,
    ),
    // Devices
    sql<{ device: string; views: string }>(
      `SELECT device, COUNT(*) AS views FROM page_views
       WHERE is_bot = false AND device IS NOT NULL GROUP BY device ORDER BY views DESC`,
    ),
    // Top pages
    sql<{ path: string; page_type: string; views: string; unique_visitors: string }>(
      `SELECT path, page_type, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS unique_visitors
       FROM page_views WHERE is_bot = false
       GROUP BY path, page_type ORDER BY views DESC LIMIT 15`,
    ),
    // Conversion funnel — product views vs leads
    sql<{ product_views: string; total_leads: string; synced: string }>(
      `SELECT
        (SELECT COUNT(*) FROM page_views WHERE is_bot = false AND page_type = 'product') AS product_views,
        (SELECT COUNT(*) FROM leads)                                                     AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE crm_status = 'synced')                         AS synced`,
    ),
    // Real-time (last 5 min)
    sql<{ count: string }>(
      `SELECT COUNT(DISTINCT ip_hash) AS count FROM page_views
       WHERE is_bot = false AND viewed_at > now() - interval '5 minutes'`,
    ),
  ])

  const n = (v: string | undefined) => parseInt(v || '0', 10)
  const k = kpis[0] || {} as Record<string, string>
  const f = funnel[0] || {} as Record<string, string>

  return NextResponse.json({
    kpis: {
      total:      n(k.total),
      unique:     n(k.unique),
      today:      n(k.today),
      leadsWeek:  n(k.leads_week),
      realtime:   n(realtime[0]?.count),
    },
    timeseries: timeseries.map(r => ({ day: r.day, views: n(r.views), unique: n(r.unique_visitors) })),
    sources:    Object.fromEntries(sources.map(r => [r.source, n(r.count)])),
    geo:        geo.map(r => ({ country: r.country, views: n(r.views) })),
    devices:    devices.map(r => ({ device: r.device, views: n(r.views) })),
    topPages:   topPages.map(r => ({ path: r.path, type: r.page_type, views: n(r.views), unique: n(r.unique_visitors) })),
    funnel: {
      productViews: n(f.product_views),
      totalLeads:   n(f.total_leads),
      synced:       n(f.synced),
    },
  })
}
