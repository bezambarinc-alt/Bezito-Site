import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Admin analytics aggregations — date-bounded, human traffic only.
 * ?days=7|30|90  (default 30). All aggregations respect the window so queries
 * stay fast as page_views grows (no all-time table scans).
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const daysParam = parseInt(req.nextUrl.searchParams.get('days') || '30', 10)
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30
  const since = `${days} days`

  const [
    kpis, timeseries, sources, geo, devices, topPages, funnel, realtime,
  ] = await Promise.all([
    // KPIs — bounded to window
    sql<{ total: string; unique: string; today: string; leads_week: string }>(
      `SELECT
        (SELECT COUNT(*)                FROM page_views WHERE is_bot=false AND viewed_at > now() - $1::interval)                          AS total,
        (SELECT COUNT(DISTINCT ip_hash) FROM page_views WHERE is_bot=false AND viewed_at > now() - $1::interval)                          AS unique,
        (SELECT COUNT(*)                FROM page_views WHERE is_bot=false AND viewed_at::date = now()::date)                              AS today,
        (SELECT COUNT(*)                FROM leads WHERE created_at > now() - interval '7 days')                                           AS leads_week`,
      [since],
    ),
    // Time-series (bounded)
    sql<{ day: string; views: string; unique_visitors: string }>(
      `SELECT viewed_at::date::text AS day, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS unique_visitors
       FROM page_views
       WHERE is_bot=false AND viewed_at > now() - $1::interval
       GROUP BY viewed_at::date ORDER BY day ASC`,
      [since],
    ),
    // Sources (bounded)
    sql<{ source: string; count: string }>(
      `SELECT COALESCE(source,'Direct') AS source, COUNT(*) AS count
       FROM page_views WHERE is_bot=false AND viewed_at > now() - $1::interval
       GROUP BY source ORDER BY count DESC`,
      [since],
    ),
    // Geo (bounded)
    sql<{ country: string; views: string }>(
      `SELECT country, COUNT(*) AS views FROM page_views
       WHERE is_bot=false AND viewed_at > now() - $1::interval AND country IS NOT NULL AND country != ''
       GROUP BY country ORDER BY views DESC LIMIT 15`,
      [since],
    ),
    // Devices (bounded)
    sql<{ device: string; views: string }>(
      `SELECT device, COUNT(*) AS views FROM page_views
       WHERE is_bot=false AND viewed_at > now() - $1::interval AND device IS NOT NULL
       GROUP BY device ORDER BY views DESC`,
      [since],
    ),
    // Top pages (bounded)
    sql<{ path: string; page_type: string; views: string; unique_visitors: string }>(
      `SELECT path, page_type, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS unique_visitors
       FROM page_views WHERE is_bot=false AND viewed_at > now() - $1::interval
       GROUP BY path, page_type ORDER BY views DESC LIMIT 20`,
      [since],
    ),
    // Conversion funnel (bounded product views; leads all-time for context)
    sql<{ product_views: string; total_leads: string; synced: string }>(
      `SELECT
        (SELECT COUNT(*) FROM page_views WHERE is_bot=false AND page_type='product' AND viewed_at > now() - $1::interval) AS product_views,
        (SELECT COUNT(*) FROM leads WHERE created_at > now() - $1::interval)                                              AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE crm_status='synced' AND created_at > now() - $1::interval)                      AS synced`,
      [since],
    ),
    // Real-time (last 5 min)
    sql<{ count: string }>(
      `SELECT COUNT(DISTINCT ip_hash) AS count FROM page_views
       WHERE is_bot=false AND viewed_at > now() - interval '5 minutes'`,
    ),
  ])

  const n = (v: string | undefined) => parseInt(v || '0', 10)
  const k = kpis[0] || {} as Record<string, string>
  const f = funnel[0] || {} as Record<string, string>

  return NextResponse.json({
    days,
    kpis: {
      total:     n(k.total),
      unique:    n(k.unique),
      today:     n(k.today),
      leadsWeek: n(k.leads_week),
      realtime:  n(realtime[0]?.count),
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
