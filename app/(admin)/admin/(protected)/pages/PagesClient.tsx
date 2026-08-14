'use client'

import { useState, useMemo } from 'react'
import styles from './pages.module.css'

interface ClientPage {
  slug: string
  title: string
  doc_type: 'showcase' | 'proposal'
  status: string
  client_id: number | null
  client_name: string | null
  client_slug: string | null
  customer_pin: string | null
  pin_expires_at: string | null
  updated_at: string
}

interface Client {
  id: number
  slug: string
  name: string
}

interface Props {
  pages: ClientPage[]
  clients: Client[]
}

export default function PagesClient({ pages: initial, clients }: Props) {
  const [pages, setPages]     = useState(initial)
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState<'all' | 'showcase' | 'proposal'>('all')
  const [clientFilter, setClient] = useState<string>('all')
  const [saving, setSaving]   = useState<Record<string, boolean>>({})
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  const clientOptions = useMemo(() => [
    { id: 0, slug: 'all', name: 'All clients' },
    { id: -1, slug: 'unassigned', name: 'Unassigned' },
    ...clients,
  ], [clients])

  const filtered = useMemo(() => pages.filter(p => {
    if (deleted.has(p.slug)) return false
    if (typeFilter !== 'all' && p.doc_type !== typeFilter) return false
    if (clientFilter === 'unassigned' && p.client_id !== null) return false
    if (clientFilter !== 'all' && clientFilter !== 'unassigned' && p.client_slug !== clientFilter) return false
    const q = search.toLowerCase()
    if (q && !p.title.toLowerCase().includes(q) && !p.slug.includes(q)) return false
    return true
  }), [pages, search, typeFilter, clientFilter, deleted])

  async function patch(slug: string, body: Record<string, unknown>) {
    setSaving(s => ({ ...s, [slug]: true }))
    try {
      await fetch(`/api/admin/pages/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setPages(ps => ps.map(p => p.slug === slug ? { ...p, ...body } : p))
    } finally {
      setSaving(s => ({ ...s, [slug]: false }))
    }
  }

  async function deletePage(slug: string) {
    if (!confirm(`Archive "${slug}"? It won't be deleted permanently.`)) return
    setSaving(s => ({ ...s, [slug]: true }))
    await fetch(`/api/admin/pages/${slug}`, { method: 'DELETE' })
    setDeleted(d => new Set([...d, slug]))
    setSaving(s => ({ ...s, [slug]: false }))
  }

  async function assignClient(slug: string, clientSlug: string) {
    if (clientSlug === 'unassigned') {
      await patch(slug, { client_id: null })
      setPages(ps => ps.map(p => p.slug === slug ? { ...p, client_id: null, client_name: null, client_slug: null } : p))
    } else {
      const client = clients.find(c => c.slug === clientSlug)
      if (!client) return
      await patch(slug, { client_id: client.id })
      setPages(ps => ps.map(p => p.slug === slug ? { ...p, client_id: client.id, client_name: client.name, client_slug: client.slug } : p))
    }
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <h1 className="admin-toolbar-heading">Client Pages</h1>
        <input
          className="admin-search"
          type="search"
          placeholder="Search title or slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-select" value={typeFilter} onChange={e => setType(e.target.value as typeof typeFilter)}>
          <option value="all">All types</option>
          <option value="showcase">Showcase</option>
          <option value="proposal">Proposal</option>
        </select>
        <select className="admin-select" value={clientFilter} onChange={e => setClient(e.target.value)}>
          {clientOptions.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <span className="admin-count">{filtered.length} pages</span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th className="admin-th">Title / Slug</th>
            <th className="admin-th">Type</th>
            <th className="admin-th">Status</th>
            <th className="admin-th">Assigned to</th>
            <th className="admin-th">PIN</th>
            <th className="admin-th">Updated</th>
            <th className="admin-th" />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="admin-empty">No pages match your filters.</td>
            </tr>
          )}
          {filtered.map(p => {
            const busy = saving[p.slug]
            const pinActive = p.customer_pin && p.pin_expires_at && new Date(p.pin_expires_at) > new Date()

            return (
              <tr key={p.slug} className="admin-row">

                {/* Title + slug */}
                <td className="admin-td">
                  <div className={styles.title}>{p.title}</div>
                  <code className={styles.slug}>{p.slug}</code>
                </td>

                {/* Doc type toggle */}
                <td className="admin-td">
                  <select
                    className={styles.typeSelect}
                    value={p.doc_type}
                    disabled={busy}
                    onChange={e => patch(p.slug, { doc_type: e.target.value })}
                  >
                    <option value="showcase">Showcase</option>
                    <option value="proposal">Proposal</option>
                  </select>
                </td>

                {/* Status */}
                <td className="admin-td">
                  <span className={`admin-badge ${
                    p.status === 'live'     ? styles.badgeLive :
                    p.status === 'archived' ? styles.badgeArchived :
                    styles.badgeDraft
                  }`}>{p.status}</span>
                </td>

                {/* Client assignment */}
                <td className="admin-td">
                  <select
                    className={styles.clientSelect}
                    value={p.client_slug ?? 'unassigned'}
                    disabled={busy}
                    onChange={e => assignClient(p.slug, e.target.value)}
                  >
                    <option value="unassigned">— Unassigned —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </td>

                {/* PIN status */}
                <td className="admin-td">
                  {pinActive
                    ? <span className={styles.pinOn}>{p.customer_pin}</span>
                    : <span className={styles.pinOff}>—</span>
                  }
                </td>

                {/* Updated */}
                <td className="admin-td">
                  <span className={styles.date}>{fmtDate(p.updated_at)}</span>
                </td>

                {/* Actions */}
                <td className="admin-td">
                  <div className={styles.actions}>
                    <a
                      href={`/preview/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-link"
                    >View ↗</a>
                    <button
                      className="admin-danger-btn"
                      onClick={() => deletePage(p.slug)}
                      disabled={busy}
                    >Archive</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
