import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import adminStyles from '../../admin.module.css'
import styles from './client.module.css'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Ctx) {
  const { id } = await params
  const [client] = await sql<{ name: string }>(
    `SELECT name FROM clients WHERE id = $1`, [parseInt(id, 10)],
  )
  return { title: client ? `${client.name} — Admin` : 'Client — Admin' }
}

export default async function ClientDetailPage({ params }: Ctx) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const clientId = parseInt(id, 10)
  if (isNaN(clientId)) notFound()

  const [[client], proposals, pages, requests] = await Promise.all([
    sql<{
      id: number; slug: string; name: string; contact_email: string;
      active: boolean; created_at: string;
    }>(
      `SELECT id, slug, name, contact_email, active, created_at
       FROM clients WHERE id = $1 LIMIT 1`,
      [clientId],
    ),
    sql<{
      slug: string; title: string; status: string; shared: boolean;
      template_id: string | null; updated_at: string;
    }>(
      `SELECT slug, title, status, shared, template_id, updated_at
       FROM pages WHERE client_id = $1 AND doc_type = 'proposal'
       ORDER BY updated_at DESC`,
      [clientId],
    ),
    sql<{
      slug: string; title: string; status: string;
      customer_pin: string | null; updated_at: string;
    }>(
      `SELECT slug, title, status, customer_pin, updated_at
       FROM pages WHERE client_id = $1 AND doc_type = 'showcase'
       ORDER BY updated_at DESC`,
      [clientId],
    ),
    sql<{
      id: number; product_sku: string | null; message: string;
      status: string; created_at: string;
    }>(
      `SELECT id, product_sku, message, status, created_at
       FROM page_requests WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId],
    ),
  ])

  if (!client) notFound()

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
  }

  return (
    <div>
      {/* Client header */}
      <div className={adminStyles.pageHeader}>
        <div>
          <h1 className={adminStyles.pageTitle}>{client.name}</h1>
          <p className={styles.meta}>
            <span className={styles.email}>{client.contact_email}</span>
            <span className={`admin-badge ${client.active ? styles.badgeActive : styles.badgeInactive}`}>
              {client.active ? 'Active' : 'Inactive'}
            </span>
            <span className={styles.since}>Since {fmtDate(client.created_at)}</span>
          </p>
        </div>
        <div className={styles.actions}>
          <a href="/admin/clients" className="admin-link">← All Clients</a>
        </div>
      </div>

      {/* Proposals */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Proposals <span className={styles.count}>{proposals.length}</span>
        </h2>
        {proposals.length === 0 ? (
          <p className="admin-empty">No proposals yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Title</th>
                <th className="admin-th">Template</th>
                <th className="admin-th">Access</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Updated</th>
                <th className="admin-th" />
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.slug} className="admin-row">
                  <td className="admin-td">
                    <div className={styles.itemTitle}>{p.title}</div>
                    <code className={styles.slug}>{p.slug}</code>
                  </td>
                  <td className="admin-td">{p.template_id ?? '—'}</td>
                  <td className="admin-td">{p.shared ? '🌐 Shared' : '🔒 Private'}</td>
                  <td className="admin-td">
                    <span className={`admin-badge ${p.status === 'live' ? styles.badgeLive : styles.badgeDraft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="admin-td">{fmtDate(p.updated_at)}</td>
                  <td className="admin-td">
                    <a href={`/preview/${p.slug}`} className="admin-link" target="_blank" rel="noreferrer">
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Showcase pages */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pages <span className={styles.count}>{pages.length}</span>
        </h2>
        {pages.length === 0 ? (
          <p className="admin-empty">No showcase pages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Title</th>
                <th className="admin-th">PIN</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Updated</th>
                <th className="admin-th" />
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.slug} className="admin-row">
                  <td className="admin-td">
                    <div className={styles.itemTitle}>{p.title}</div>
                    <code className={styles.slug}>{p.slug}</code>
                  </td>
                  <td className="admin-td">
                    {p.customer_pin
                      ? <span style={{ color: 'var(--accent)' }}>{p.customer_pin}</span>
                      : <span style={{ color: 'var(--ink-faint)' }}>—</span>
                    }
                  </td>
                  <td className="admin-td">
                    <span className={`admin-badge ${p.status === 'live' ? styles.badgeLive : styles.badgeDraft}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="admin-td">{fmtDate(p.updated_at)}</td>
                  <td className="admin-td">
                    <a href={`/preview/${p.slug}`} className="admin-link" target="_blank" rel="noreferrer">
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Requests */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Requests <span className={styles.count}>{requests.length}</span>
        </h2>
        {requests.length === 0 ? (
          <p className="admin-empty">No page requests.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Product SKU</th>
                <th className="admin-th">Message</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="admin-row">
                  <td className="admin-td"><code className={styles.slug}>{r.product_sku ?? '—'}</code></td>
                  <td className="admin-td" style={{ maxWidth: 320 }}>{r.message}</td>
                  <td className="admin-td">
                    <span className={`admin-badge ${r.status === 'done' ? styles.badgeLive : styles.badgeDraft}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="admin-td">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
