'use client'

import { useState, useMemo } from 'react'
import type { AdminProduct } from './page'
import styles from './ProductsGrid.module.css'

function cloudinaryThumb(url: string | null): string | null {
  if (!url) return null
  if (url.includes('/video/upload/')) {
    return url
      .replace('/video/upload/', '/video/upload/so_1.0,f_jpg,c_fill,w_120,h_120,q_auto/')
      .replace(/\.(mp4|webm|mov)(\?.*)?$/i, '.jpg')
  }
  if (url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/c_fill,w_120,h_120,f_auto,q_auto/')
  }
  return url
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d > 30) return `${Math.floor(d / 30)}mo ago`
  if (d > 0)  return `${d}d ago`
  const h = Math.floor(diff / 3600000)
  if (h > 0)  return `${h}h ago`
  return 'Just now'
}

interface RowState {
  active: boolean
  featured: boolean
  view_1_url: string | null
  view_2_url: string | null
  view_3_url: string | null
}

export default function ProductsGrid({ products }: { products: AdminProduct[] }) {
  const [rows, setRows]           = useState<Record<string, RowState>>(() =>
    Object.fromEntries(products.map((p) => [p.slug, {
      active:    p.active,
      featured:  p.featured,
      view_1_url: p.view_1_url,
      view_2_url: p.view_2_url,
      view_3_url: p.view_3_url,
    }]))
  )
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [editViews, setEditViews] = useState<Record<string, { v1: string; v2: string; v3: string }>>({})
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [pageSize,  setPageSize]  = useState<number | 'all'>(25)
  const [page,      setPage]      = useState(1)
  const [density,   setDensity]   = useState<'compact' | 'comfortable'>('comfortable')

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category ?? 'uncategorized'))
    return ['all', ...Array.from(s).sort()]
  }, [products])

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const cat = catFilter === 'all' || (p.category ?? 'uncategorized') === catFilter
      const q = search.toLowerCase()
      const match = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      return cat && match
    })
    return result
  }, [products, catFilter, search])

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filtered.length / pageSize)
  const paged = pageSize === 'all' ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)

  // reset to page 1 when filter/pageSize changes
  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleCat   = (v: string) => { setCatFilter(v); setPage(1) }
  const handleSize  = (v: string) => { setPageSize(v === 'all' ? 'all' : Number(v)); setPage(1) }

  async function patch(slug: string, body: Partial<RowState>) {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) alert('Update failed')
  }

  function toggle(slug: string, field: 'active' | 'featured') {
    const next = !rows[slug][field]
    setRows((r) => ({ ...r, [slug]: { ...r[slug], [field]: next } }))
    patch(slug, { [field]: next })
  }

  function saveViews(slug: string) {
    const ev = editViews[slug] ?? {}
    const update = {
      view_1_url: ev.v1 || null,
      view_2_url: ev.v2 || null,
      view_3_url: ev.v3 || null,
    }
    setRows((r) => ({ ...r, [slug]: { ...r[slug], ...update } }))
    patch(slug, update)
    setExpanded(null)
  }

  return (
    <div>
      <div className="admin-toolbar">
        <select
          className="admin-select"
          value={catFilter}
          onChange={(e) => handleCat(e.target.value)}
        >
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <input
          className="admin-search"
          placeholder="Search name or SKU…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <span className="admin-count">{filtered.length} products</span>

        {/* Per-page selector */}
        <select
          className="admin-select"
          value={String(pageSize)}
          onChange={(e) => handleSize(e.target.value)}
          aria-label="Rows per page"
        >
          <option value="10">10 / page</option>
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="all">All</option>
        </select>

        {/* Density toggle */}
        <button
          className={`${styles.densityBtn} ${density === 'comfortable' ? styles.densityActive : ''}`}
          onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
          title={density === 'compact' ? 'Switch to comfortable rows' : 'Switch to compact rows'}
        >
          {density === 'compact' ? '⊟' : '⊞'}
        </button>
      </div>

      <table className={`admin-table ${density === 'compact' ? styles.compact : ''}`}>
        <thead>
          <tr>
            <th className="admin-th" style={{ width: 72 }} />
            <th className="admin-th">Name / SKU</th>
            <th className="admin-th">Category</th>
            <th className="admin-th">Metal</th>
            <th className="admin-th">Active</th>
            <th className="admin-th">Featured</th>
            <th className="admin-th">Views</th>
            <th className="admin-th">Synced</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((p) => {
            const row  = rows[p.slug] ?? {}
            const thumb = cloudinaryThumb(p.hero_visual)
            const viewCount = [row.view_1_url, row.view_2_url, row.view_3_url].filter(Boolean).length
            const ev = editViews[p.slug] ?? {
              v1: row.view_1_url ?? '',
              v2: row.view_2_url ?? '',
              v3: row.view_3_url ?? '',
            }
            const isExpanded = expanded === p.slug

            return (
              <>
                <tr key={p.slug} className="admin-row">
                  {/* Thumbnail */}
                  <td className="admin-td">
                    <a href={`/jewelry/${p.category ?? 'jewelry'}/${p.slug}`} target="_blank" rel="noreferrer">
                      {thumb
                        ? <img src={thumb} alt="" className={styles.thumb} />
                        : <div className={styles.thumbFallback} />}
                    </a>
                  </td>

                  {/* Name + SKU */}
                  <td className="admin-td">
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.sku}>{p.sku}</div>
                  </td>

                  {/* Category */}
                  <td className="admin-td">
                    {p.category && <span className={styles.badge}>{p.category}</span>}
                  </td>

                  {/* Metal */}
                  <td className="admin-td">
                    <span className={styles.metal}>{p.metal ?? '—'}</span>
                  </td>

                  {/* Active toggle */}
                  <td className="admin-td">
                    <button
                      className={`admin-toggle ${row.active ? 'admin-toggle-on' : ''}`}
                      onClick={() => toggle(p.slug, 'active')}
                      aria-label={row.active ? 'Deactivate' : 'Activate'}
                    >
                      <span className="admin-toggle-thumb" />
                    </button>
                  </td>

                  {/* Featured toggle */}
                  <td className="admin-td">
                    <button
                      className={`${styles.star} ${row.featured ? styles.starOn : ''}`}
                      onClick={() => toggle(p.slug, 'featured')}
                      aria-label={row.featured ? 'Unfeature' : 'Feature'}
                    >
                      ★
                    </button>
                  </td>

                  {/* Views */}
                  <td className="admin-td">
                    <button
                      className={`${styles.viewsBadge} ${viewCount === 3 ? styles.viewsFull : ''}`}
                      onClick={() => {
                        setExpanded(isExpanded ? null : p.slug)
                        if (!editViews[p.slug]) {
                          setEditViews((ev2) => ({ ...ev2, [p.slug]: { v1: row.view_1_url ?? '', v2: row.view_2_url ?? '', v3: row.view_3_url ?? '' } }))
                        }
                      }}
                    >
                      {viewCount}/3
                    </button>
                  </td>

                  {/* Synced */}
                  <td className="admin-td">
                    <span className={styles.time}>{timeAgo(p.synced_at)}</span>
                  </td>
                </tr>

                {/* Inline view edit */}
                {isExpanded && (
                  <tr key={`${p.slug}-views`} className={styles.editRow}>
                    <td colSpan={8} className={styles.editCell}>
                      <div className={styles.editInner}>
                        {(['v1', 'v2', 'v3'] as const).map((k, i) => (
                          <div key={k} className={styles.editField}>
                            <label className={styles.editLabel}>View {i + 1}</label>
                            <input
                              className={styles.editInput}
                              value={ev[k]}
                              placeholder="https://res.cloudinary.com/…"
                              onChange={(e) => setEditViews((prev) => ({
                                ...prev,
                                [p.slug]: { ...ev, [k]: e.target.value },
                              }))}
                            />
                          </div>
                        ))}
                        <div className={styles.editActions}>
                          <button className={styles.saveBtn} onClick={() => saveViews(p.slug)}>Save Views</button>
                          <button className={styles.cancelBtn} onClick={() => setExpanded(null)}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(1)}
            disabled={page === 1}
          >«</button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >›</button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >»</button>
        </div>
      )}
    </div>
  )
}
