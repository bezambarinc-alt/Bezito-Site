import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import styles from './leads.module.css'
import adminStyles from '../admin.module.css'

export const dynamic = 'force-dynamic'

interface LeadRow {
  id: number
  name: string | null
  email: string
  sku: string | null
  intent: string | null
  message: string | null
  crm_status: 'pending' | 'failed'
  created_at: string
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function LeadsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const rows = await sql<LeadRow>(
    `SELECT id, name, email, sku, intent, message, crm_status, created_at
     FROM leads
     WHERE crm_status IN ('failed', 'pending')
     ORDER BY created_at DESC
     LIMIT 200`,
  )

  const pending = rows.filter(r => r.crm_status === 'pending').length
  const failed  = rows.filter(r => r.crm_status === 'failed').length

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Leads</h1>
        <span className={adminStyles.syncLink}>failed + pending only — successful leads in Freshsales</span>
      </div>

      <div className={adminStyles.kpiGrid} style={{ marginBottom: '2rem' }}>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue} style={failed > 0 ? { color: 'var(--danger)' } : {}}>
            {failed}
          </div>
          <div className={adminStyles.kpiLabel}>Failed</div>
          <div className={adminStyles.kpiSub}>didn't reach Freshsales</div>
        </div>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>{pending}</div>
          <div className={adminStyles.kpiLabel}>Pending</div>
          <div className={adminStyles.kpiSub}>CRM push in queue</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={styles.allGood}>
          <p className={styles.allGoodText}>✓ All leads reached Freshsales</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Name</th>
                <th>Email</th>
                <th>SKU / Source</th>
                <th>Intent</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className={styles.dim}>{fmtDate(r.created_at)}</td>
                  <td>{r.name ?? <span className={styles.dim}>—</span>}</td>
                  <td className={styles.email}>{r.email}</td>
                  <td className={styles.dim}>{r.sku ?? '—'}</td>
                  <td className={styles.dim}>{r.intent ?? '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${r.crm_status === 'failed' ? styles.badgeFailed : styles.badgePending}`}>
                      {r.crm_status}
                    </span>
                  </td>
                  <td className={styles.message} title={r.message ?? ''}>
                    {r.message ? r.message.slice(0, 80) + (r.message.length > 80 ? '…' : '') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
