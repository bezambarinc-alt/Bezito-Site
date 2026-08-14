'use client'

import { useState } from 'react'
import styles from './clients.module.css'

interface Client {
  id: number
  slug: string
  name: string
  contact_email: string
  active: boolean
  page_count: number
  created_at: string
}

export default function ClientsClient({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', contact_email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  async function createClient(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        // Refresh list
        const fresh = await fetch('/api/admin/clients').then(r => r.json())
        setClients(fresh.clients ?? [])
        setShowForm(false)
        setForm({ name: '', slug: '', contact_email: '', password: '' })
      } else {
        const d = await res.json().catch(() => ({}))
        setFormError(d.error ?? 'Failed to create client')
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`/api/admin/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setClients(cs => cs.map(c => c.id === id ? { ...c, active: !active } : c))
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-toolbar-heading">Clients</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Client'}
        </button>
      </div>

      {showForm && (
        <form className={styles.createForm} onSubmit={createClient}>
          {formError && <p className={styles.formError}>{formError}</p>}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                placeholder="Polacheck's" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input className={styles.input} value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="polacheckss" pattern="[a-z0-9-]+" required />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={form.contact_email}
                onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="contact@retailer.com" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Temporary password</label>
              <input className={styles.input} type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={8} required />
            </div>
          </div>
          <button className={styles.saveBtn} type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create Client'}
          </button>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th className="admin-th">Name</th>
            <th className="admin-th">Slug</th>
            <th className="admin-th">Email</th>
            <th className="admin-th">Pages</th>
            <th className="admin-th">Status</th>
            <th className="admin-th">Created</th>
            <th className="admin-th" />
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan={7} className="admin-empty">No clients yet — add one above.</td>
            </tr>
          )}
          {clients.map(c => (
            <tr key={c.id} className="admin-row">
              <td className="admin-td"><span className={styles.name}>{c.name}</span></td>
              <td className="admin-td"><code className={styles.slug}>{c.slug}</code></td>
              <td className="admin-td">{c.contact_email}</td>
              <td className="admin-td">{c.page_count}</td>
              <td className="admin-td">
                <button
                  className={`admin-toggle ${c.active ? 'admin-toggle-on' : ''}`}
                  onClick={() => toggleActive(c.id, c.active)}
                  aria-label={c.active ? 'Deactivate' : 'Activate'}
                >
                  <span className="admin-toggle-thumb" />
                </button>
              </td>
              <td className="admin-td">
                <span className={styles.date}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </td>
              <td className="admin-td">
                <a
                  href={`/admin/clients/${c.id}/pages`}
                  className={styles.viewLink}
                >Pages →</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
