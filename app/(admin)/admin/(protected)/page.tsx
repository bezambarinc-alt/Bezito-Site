import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import styles from './admin.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [{ active_products, total_products }] = await sql<{ active_products: string; total_products: string }>(
    `SELECT COUNT(*) FILTER (WHERE active = true) AS active_products,
            COUNT(*) AS total_products
     FROM products`,
  )

  const [{ total_leads, leads_this_week }] = await sql<{ total_leads: string; leads_this_week: string }>(
    `SELECT COUNT(*) AS total_leads,
            COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') AS leads_this_week
     FROM leads`,
  )

  const [{ last_sync }] = await sql<{ last_sync: string | null }>(
    `SELECT MAX(synced_at)::text AS last_sync FROM products`,
  )

  const kpis = [
    { label: 'Active Products', value: active_products, sub: `of ${total_products} total` },
    { label: 'Total Leads',     value: total_leads,     sub: '' },
    { label: 'Leads This Week', value: leads_this_week, sub: '' },
    { label: 'Last Sync',       value: last_sync ? new Date(last_sync).toLocaleDateString() : '—', sub: last_sync ? new Date(last_sync).toLocaleTimeString() : '' },
  ]

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Overview</h1>
        <form action={async () => {
          'use server'
          const s = await getSession()
          if (!s) return
          const base = process.env.APP_URL ?? 'http://localhost:3000'
          await fetch(`${base}/api/cron/plytix-sync`, {
            headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
          })
        }} style={{ margin: 0 }}>
          <button type="submit" className={styles.syncLink}>Trigger Sync →</button>
        </form>
      </div>

      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiValue}>{k.value}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
            {k.sub && <div className={styles.kpiSub}>{k.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
