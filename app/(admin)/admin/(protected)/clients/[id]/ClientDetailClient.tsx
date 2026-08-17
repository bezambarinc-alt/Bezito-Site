'use client'

import { useState } from 'react'
import adminStyles from '../../admin.module.css'
import styles from './client.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Client {
  id: number; slug: string; name: string; contact_email: string;
  active: boolean; created_at: string;
}
interface Proposal {
  slug: string; title: string; status: string; shared: boolean;
  template_id: string | null; updated_at: string;
}
interface ShowcasePage {
  slug: string; title: string; status: string;
  customer_pin: string | null; updated_at: string;
}
interface PageRequest {
  id: number; product_sku: string | null; message: string;
  status: string; created_at: string;
}
interface Props {
  client: Client
  proposals: Proposal[]
  pages: ShowcasePage[]
  requests: PageRequest[]
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ClientDetailClient({ client: initial, proposals, pages, requests }: Props) {
  const [client, setClient] = useState(initial)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm]         = useState({ name: initial.name, contact_email: initial.contact_email, password: '', active: initial.active })
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null)

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
  }

  function openEdit() {
    setForm({ name: client.name, contact_email: client.contact_email, password: '', active: client.active })
    setMsg(null)
    setEditMode(true)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        contact_email: form.contact_email,
        active: form.active,
      }
      // Only send password if the user actually typed one
      if (form.password.trim()) body.password = form.password.trim()

      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setClient(c => ({ ...c, name: form.name, contact_email: form.contact_email, active: form.active }))
        setMsg({ text: 'Saved ✓', ok: true })
        setEditMode(false)
      } else {
        const d = await res.json().catch(() => ({}))
        setMsg({ text: d.error ?? 'Failed to save', ok: false })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* ── Client header ── */}
      <div className={adminStyles.pageHeader}>
        <div style={{ flex: 1 }}>
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
          {!editMode && (
            <button className={styles.editBtn} onClick={openEdit}>Edit</button>
          )}
        </div>
      </div>

      {/* ── Inline edit form ── */}
      {editMode && (
        <form className={styles.editForm} onSubmit={saveEdit}>
          {msg && (
            <p className={msg.ok ? styles.msgOk : styles.msgErr}>{msg.text}</p>
          )}
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Name</label>
              <input
                className={styles.editInput}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                minLength={1}
                maxLength={100}
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Email</label>
              <input
                className={styles.editInput}
                type="email"
                value={form.contact_email}
                onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                required
                maxLength={254}
              />
            </div>
          </div>
          <div className={styles.editRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>New password <span className={styles.editOptional}>(leave blank to keep current)</span></label>
              <input
                className={styles.editInput}
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8}
                maxLength={128}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Status</label>
              <label className={styles.editToggle}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                />
                <span>{form.active ? 'Active' : 'Inactive'}</span>
              </label>
            </div>
          </div>
          <div className={styles.editActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => { setEditMode(false); setMsg(null) }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Proposals ── */}
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

      {/* ── Showcase pages ── */}
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

      {/* ── Requests ── */}
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
