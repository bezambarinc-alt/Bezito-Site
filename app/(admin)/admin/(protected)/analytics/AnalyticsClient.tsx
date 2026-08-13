'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js'
import styles from './analytics.module.css'
import adminStyles from '../admin.module.css'

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, Filler, Tooltip, Legend,
)

interface AnalyticsData {
  days: number
  kpis: { total: number; unique: number; today: number; leadsWeek: number; realtime: number }
  timeseries: { day: string; views: number; unique: number }[]
  sources: Record<string, number>
  geo: { country: string; views: number }[]
  devices: { device: string; views: number }[]
  topPages: { path: string; type: string; views: number; unique: number }[]
  funnel: { productViews: number; totalLeads: number; synced: number }
}

const SRC_COLORS: Record<string, string> = {
  Direct: '#c9a96e', Organic: '#4ade80', Social: '#a78bfa', Referral: '#60a5fa', Email: '#f87171',
}
const DEV_COLORS: Record<string, string> = { desktop: '#4ade80', mobile: '#a78bfa', tablet: '#facc15', bot: '#3a3a48' }
const DEV_ICONS: Record<string, string> = { desktop: '🖥️', mobile: '📱', tablet: '⊞', bot: '🤖' }

function flag(code: string): string {
  if (!code || code.length !== 2) return '🌍'
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65))
}

type SortKey = 'views' | 'unique' | 'path'

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'views', dir: 'desc' })

  const tsRef = useRef<HTMLCanvasElement>(null)
  const srcRef = useRef<HTMLCanvasElement>(null)
  const devRef = useRef<HTMLCanvasElement>(null)
  // Persistent chart instances — created once, updated in place.
  const tsChart = useRef<Chart | null>(null)
  const srcChart = useRef<Chart | null>(null)
  const devChart = useRef<Chart | null>(null)

  async function load(d: number) {
    const res = await fetch(`/api/admin/analytics?days=${d}`).then(r => r.json()).catch(() => null)
    if (res && !res.error) setData(res)
    setLoading(false)
  }

  // Load on mount + when the range changes
  useEffect(() => { load(days) }, [days])

  // Poll every 30s for real-time KPIs (keeps current range)
  useEffect(() => {
    const t = setInterval(() => load(days), 30000)
    return () => clearInterval(t)
  }, [days])

  // Build the timeseries into a dense (zero-filled) array for the current range
  const filled = useMemo(() => {
    if (!data) return []
    const out: { day: string; views: number; unique: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i)
      const key = dt.toISOString().slice(0, 10)
      const row = data.timeseries.find(r => r.day === key)
      out.push({ day: key, views: row?.views ?? 0, unique: row?.unique ?? 0 })
    }
    return out
  }, [data, days])

  // ── Charts: create once, then mutate + update('none') on data change ────────
  useEffect(() => {
    if (!data) return

    // Time-series (line)
    if (tsRef.current) {
      const labels = filled.map(r => new Date(r.day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      const views = filled.map(r => r.views)
      const unique = filled.map(r => r.unique)
      if (!tsChart.current) {
        tsChart.current = new Chart(tsRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label: 'Views', data: views, borderColor: '#c9a96e', backgroundColor: 'rgba(201,169,110,0.07)', borderWidth: 2, pointRadius: days <= 14 ? 3 : 1, fill: true, tension: 0.35 },
              { label: 'Unique', data: unique, borderColor: '#60a5fa', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.35, borderDash: [4, 3] },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: { legend: { labels: { color: '#8a8a99', boxWidth: 10, padding: 14, font: { size: 10 } } } },
            scales: {
              x: { ticks: { color: '#6b6b80', font: { size: 9 }, maxTicksLimit: days <= 7 ? 7 : 10 }, grid: { color: '#1e1e28' } },
              y: { ticks: { color: '#6b6b80', font: { size: 9 } }, grid: { color: '#1e1e28' }, beginAtZero: true },
            },
          },
        })
      } else {
        const c = tsChart.current
        c.data.labels = labels
        c.data.datasets[0].data = views
        ;(c.data.datasets[0] as { pointRadius?: number }).pointRadius = days <= 14 ? 3 : 1
        c.data.datasets[1].data = unique
        if (c.options.scales?.x && 'ticks' in c.options.scales.x) {
          (c.options.scales.x as { ticks: { maxTicksLimit: number } }).ticks.maxTicksLimit = days <= 7 ? 7 : 10
        }
        c.update('none')
      }
    }

    // Sources donut
    if (srcRef.current) {
      const keys = Object.keys(data.sources).filter(k => data.sources[k] > 0)
      const vals = keys.map(k => data.sources[k])
      const colors = keys.map(k => SRC_COLORS[k] || '#3a3a48')
      if (!srcChart.current) {
        srcChart.current = new Chart(srcRef.current, {
          type: 'doughnut',
          data: { labels: keys, datasets: [{ data: vals, backgroundColor: colors, borderColor: '#0d0d11', borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { display: false } } },
        })
      } else {
        const c = srcChart.current
        c.data.labels = keys
        c.data.datasets[0].data = vals
        c.data.datasets[0].backgroundColor = colors
        c.update('none')
      }
    }

    // Devices donut
    if (devRef.current) {
      const labels = data.devices.map(d => d.device)
      const vals = data.devices.map(d => d.views)
      const colors = data.devices.map(d => DEV_COLORS[d.device] || '#3a3a48')
      if (!devChart.current) {
        devChart.current = new Chart(devRef.current, {
          type: 'doughnut',
          data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderColor: '#0d0d11', borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { display: false } } },
        })
      } else {
        const c = devChart.current
        c.data.labels = labels
        c.data.datasets[0].data = vals
        c.data.datasets[0].backgroundColor = colors
        c.update('none')
      }
    }
  }, [data, filled, days])

  // Destroy charts only on unmount
  useEffect(() => () => {
    tsChart.current?.destroy(); tsChart.current = null
    srcChart.current?.destroy(); srcChart.current = null
    devChart.current?.destroy(); devChart.current = null
  }, [])

  function toggleSort(key: SortKey) {
    setSort(s => s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' })
  }

  const sortedPages = useMemo(() => {
    if (!data) return []
    const rows = [...data.topPages]
    rows.sort((a, b) => {
      const dir = sort.dir === 'desc' ? -1 : 1
      if (sort.key === 'path') return a.path.localeCompare(b.path) * dir
      return (a[sort.key] - b[sort.key]) * dir
    })
    return rows
  }, [data, sort])

  if (loading) return <div className={styles.empty}>Loading analytics…</div>

  if (!data || data.kpis.total === 0) {
    return (
      <div>
        <div className={adminStyles.pageHeader}>
          <h1 className={adminStyles.pageTitle}>Analytics</h1>
          <RangeTabs days={days} setDays={setDays} />
        </div>
        <div className={styles.empty}>
          No page views recorded in this window. Traffic appears here once the site logs visits.
        </div>
      </div>
    )
  }

  const srcTotal = Object.values(data.sources).reduce((a, b) => a + b, 0)
  const devTotal = data.devices.reduce((s, d) => s + d.views, 0)
  const maxGeo = Math.max(...data.geo.map(g => g.views), 1)
  const maxPage = Math.max(...data.topPages.map(p => p.views), 1)
  const convRate = data.funnel.productViews > 0
    ? ((data.funnel.totalLeads / data.funnel.productViews) * 100).toFixed(1) : '0.0'

  const arrow = (key: SortKey) => sort.key === key ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Analytics</h1>
        {data.kpis.realtime > 0 && <span className={styles.live}>● {data.kpis.realtime} active now</span>}
        <RangeTabs days={days} setDays={setDays} />
      </div>

      {/* KPIs */}
      <div className={adminStyles.kpiGrid} style={{ marginBottom: '2rem' }}>
        <div className={adminStyles.kpiCard}><div className={adminStyles.kpiValue}>{data.kpis.total.toLocaleString()}</div><div className={adminStyles.kpiLabel}>Views ({days}d)</div></div>
        <div className={adminStyles.kpiCard}><div className={adminStyles.kpiValue}>{data.kpis.unique.toLocaleString()}</div><div className={adminStyles.kpiLabel}>Unique ({days}d)</div></div>
        <div className={adminStyles.kpiCard}><div className={adminStyles.kpiValue}>{data.kpis.today.toLocaleString()}</div><div className={adminStyles.kpiLabel}>Views Today</div></div>
        <div className={adminStyles.kpiCard}><div className={adminStyles.kpiValue}>{data.kpis.leadsWeek.toLocaleString()}</div><div className={adminStyles.kpiLabel}>Leads This Week</div></div>
      </div>

      {/* Traffic trend */}
      <div className={styles.card} style={{ marginBottom: '1.25rem' }}>
        <div className={styles.cardHead}><span className={styles.cardTitle}>Traffic Trend</span></div>
        <div style={{ height: 220 }}><canvas ref={tsRef} /></div>
      </div>

      {/* Sources + Geo + Devices */}
      <div className={styles.grid3}>
        <div className={styles.card}>
          <div className={styles.cardHead}><span className={styles.cardTitle}>Traffic Sources</span></div>
          <div style={{ height: 150, position: 'relative' }}><canvas ref={srcRef} /></div>
          <div className={styles.legend}>
            {Object.entries(data.sources).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} className={styles.legRow}>
                <span className={styles.legDot} style={{ background: SRC_COLORS[k] || '#3a3a48' }} />
                <span className={styles.legLabel}>{k}</span>
                <span className={styles.legVal}>{srcTotal ? Math.round((v / srcTotal) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}><span className={styles.cardTitle}>Top Countries</span></div>
          <div className={styles.geoList}>
            {data.geo.length === 0 ? <div className={styles.empty}>No geo data</div> : data.geo.slice(0, 10).map(g => (
              <div key={g.country} className={styles.geoRow}>
                <span className={styles.geoFlag}>{flag(g.country)}</span>
                <div className={styles.geoBarWrap}>
                  <span className={styles.geoName}>{g.country}</span>
                  <div className={styles.geoBar}><div className={styles.geoBarFill} style={{ width: `${(g.views / maxGeo) * 100}%` }} /></div>
                </div>
                <span className={styles.geoVal}>{g.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}><span className={styles.cardTitle}>Devices</span></div>
          <div style={{ height: 150, position: 'relative' }}><canvas ref={devRef} /></div>
          <div className={styles.legend}>
            {data.devices.map(d => (
              <div key={d.device} className={styles.legRow}>
                <span className={styles.legDot} style={{ background: DEV_COLORS[d.device] || '#3a3a48' }} />
                <span className={styles.legLabel}>{DEV_ICONS[d.device] || ''} {d.device}</span>
                <span className={styles.legVal}>{devTotal ? Math.round((d.views / devTotal) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion funnel */}
      <div className={styles.card} style={{ marginTop: '1.25rem' }}>
        <div className={styles.cardHead}><span className={styles.cardTitle}>Conversion — Product Views → Leads ({days}d)</span></div>
        <div className={styles.funnel}>
          <div className={styles.funnelStep}><div className={styles.funnelNum}>{data.funnel.productViews.toLocaleString()}</div><div className={styles.funnelLbl}>Product Views</div></div>
          <div className={styles.funnelArrow}>→</div>
          <div className={styles.funnelStep}><div className={styles.funnelNum}>{data.funnel.totalLeads.toLocaleString()}</div><div className={styles.funnelLbl}>Leads</div></div>
          <div className={styles.funnelArrow}>→</div>
          <div className={styles.funnelStep}><div className={styles.funnelNum}>{data.funnel.synced.toLocaleString()}</div><div className={styles.funnelLbl}>Synced to CRM</div></div>
          <div className={styles.funnelRate}>{convRate}%<span>view → lead</span></div>
        </div>
      </div>

      {/* Top pages — sortable */}
      <div className={styles.card} style={{ marginTop: '1.25rem' }}>
        <div className={styles.cardHead}><span className={styles.cardTitle}>Top Pages ({days}d)</span></div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('path')}>Path{arrow('path')}</th>
              <th>Type</th>
              <th className={styles.num} style={{ cursor: 'pointer' }} onClick={() => toggleSort('views')}>Views{arrow('views')}</th>
              <th className={styles.num} style={{ cursor: 'pointer' }} onClick={() => toggleSort('unique')}>Unique{arrow('unique')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map(p => (
              <tr key={p.path}>
                <td className={styles.pathCell}>
                  {p.path}
                  <div className={styles.pageBar}><div className={styles.pageBarFill} style={{ width: `${(p.views / maxPage) * 100}%` }} /></div>
                </td>
                <td className={styles.dim}>{p.type}</td>
                <td className={styles.num}>{p.views.toLocaleString()}</td>
                <td className={styles.num}>{p.unique.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RangeTabs({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  return (
    <div className={styles.dayTabs} style={{ marginLeft: 'auto' }}>
      {[7, 30, 90].map(d => (
        <button key={d} className={`${styles.dayTab} ${days === d ? styles.dayTabActive : ''}`} onClick={() => setDays(d)}>{d}D</button>
      ))}
    </div>
  )
}
