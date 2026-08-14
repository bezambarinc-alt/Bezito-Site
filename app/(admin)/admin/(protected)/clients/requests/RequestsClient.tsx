'use client'

import { useState } from 'react'
import styles from './requests.module.css'

interface PageRequest {
  id: number
  client_id: number
  client_name: string | null
  client_slug: string | null
  product_sku: string | null
  message: string
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  done:        'Done',
}

export default function RequestsClient({ requests: initial }: { requests: PageRequest[] }) {
  const [requests, setRequests] = useState(initial)
  const [updating, setUpdating] = useState<Record<number, boolean>>({})

  async function setStatus(id: number, status: string) {
    setUpdating(u => ({ ...u, [id]: true }))
    try {
      await fetch(`/api/admin/clients/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r))
    } finally {
      setUpdating(u => ({ ...u, [id]: false }))
    }
  }

  if (requests.length === 0) {
    return <p className="admin-empty" style={{ padding: '2rem 0' }}>No requests yet.</p>
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th className="admin-th">Client</th>
          <th className="admin-th">SKU / Product</th>
          <th className="admin-th">Message</th>
          <th className="admin-th">Requested</th>
          <th className="admin-th">Status</th>
          <th className="admin-th" />
        </tr>
      </thead>
      <tbody>
        {requests.map(r => {
          const busy = updating[r.id]
          return (
            <tr key={r.id} className={`admin-row ${r.status === 'done' ? styles.done : ''}`}>

              {/* Client */}
              <td className="admin-td">
                {r.client_name ? (
                  <a href={`/admin/clients/${r.client_id}`} className="admin-link">
                    {r.client_name}
                  </a>
                ) : (
                  <span className={styles.unknown}>Unknown client</span>
                )}
              </td>

              {/* SKU */}
              <td className="admin-td">
                <code className={styles.sku}>{r.product_sku ?? '—'}</code>
              </td>

              {/* Message */}
              <td className="admin-td">
                <span className={styles.message}>{r.message}</span>
              </td>

              {/* Date */}
              <td className="admin-td">
                <span className={styles.date}>
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: '2-digit',
                  })}
                </span>
              </td>

              {/* Status badge */}
              <td className="admin-td">
                <span className={`admin-badge ${styles[`badge_${r.status.replace('-', '_')}`]}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </td>

              {/* Actions */}
              <td className="admin-td">
                <div className={styles.actions}>
                  {r.status === 'pending' && (
                    <button
                      className={styles.progressBtn}
                      onClick={() => setStatus(r.id, 'in_progress')}
                      disabled={busy}
                    >Start</button>
                  )}
                  {r.status !== 'done' && (
                    <button
                      className={styles.doneBtn}
                      onClick={() => setStatus(r.id, 'done')}
                      disabled={busy}
                    >Done</button>
                  )}
                  {r.status === 'done' && (
                    <button
                      className={styles.reopenBtn}
                      onClick={() => setStatus(r.id, 'pending')}
                      disabled={busy}
                    >Reopen</button>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
