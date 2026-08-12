import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import styles from './generations.module.css'
import adminStyles from '../admin.module.css'

export const dynamic = 'force-dynamic'

interface GenerationRow {
  id: number
  route: string
  model: string
  tokens_in: number | null
  tokens_out: number | null
  error: string | null
  created_at: string
}

function estimateCost(model: string, tokensIn: number, tokensOut: number): string {
  const isOpus = model.includes('opus')
  const inRate  = isOpus ? 15    : 3     // $ per MTok
  const cacheRate = isOpus ? 1.5 : 0.30
  const outRate = isOpus ? 75   : 15
  // No cache info here — treat all input as uncached (conservative)
  const cost = (tokensIn / 1_000_000) * inRate + (tokensOut / 1_000_000) * outRate
  return cost < 0.001 ? '<$0.001' : `$${cost.toFixed(4)}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function GenerationsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const rows = await sql<GenerationRow>(
    `SELECT id, route, model, tokens_in, tokens_out, error, created_at
     FROM generations
     ORDER BY created_at DESC
     LIMIT 200`,
  )

  const totalCost = rows.reduce((sum, r) => {
    if (!r.tokens_in && !r.tokens_out) return sum
    const isOpus = r.model.includes('opus')
    return sum +
      ((r.tokens_in  ?? 0) / 1_000_000) * (isOpus ? 15 : 3) +
      ((r.tokens_out ?? 0) / 1_000_000) * (isOpus ? 75 : 15)
  }, 0)

  const errors = rows.filter(r => r.error).length

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Generation Log</h1>
        <span className={adminStyles.syncLink}>last 200 calls</span>
      </div>

      <div className={adminStyles.kpiGrid} style={{ marginBottom: '2rem' }}>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>{rows.length}</div>
          <div className={adminStyles.kpiLabel}>Total Calls</div>
        </div>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>${totalCost.toFixed(3)}</div>
          <div className={adminStyles.kpiLabel}>Est. Cost</div>
          <div className={adminStyles.kpiSub}>uncached input rates</div>
        </div>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue} style={errors > 0 ? { color: 'var(--danger)' } : {}}>
            {errors}
          </div>
          <div className={adminStyles.kpiLabel}>Errors</div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Route</th>
              <th>Model</th>
              <th className={styles.num}>In</th>
              <th className={styles.num}>Out</th>
              <th className={styles.num}>Est. Cost</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className={r.error ? styles.rowError : ''}>
                <td className={styles.dim}>{fmtDate(r.created_at)}</td>
                <td className={styles.route}>{r.route}</td>
                <td className={styles.dim}>{r.model.replace('anthropic/', '').replace('openai/', '')}</td>
                <td className={styles.num}>{r.tokens_in?.toLocaleString() ?? '—'}</td>
                <td className={styles.num}>{r.tokens_out?.toLocaleString() ?? '—'}</td>
                <td className={styles.num}>
                  {r.tokens_in != null && r.tokens_out != null
                    ? estimateCost(r.model, r.tokens_in, r.tokens_out)
                    : '—'}
                </td>
                <td className={styles.errorCell} title={r.error ?? ''}>
                  {r.error ? r.error.slice(0, 60) + (r.error.length > 60 ? '…' : '') : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className={styles.empty}>No generations logged yet.</p>
        )}
      </div>
    </div>
  )
}
