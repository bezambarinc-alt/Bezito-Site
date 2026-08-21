'use client'

import { useState, useMemo, useCallback } from 'react'
import type { AdminProduct } from './page'
import styles from './ProductsGrid.module.css'

type SortCol = 'name' | 'category' | 'metal' | 'active' | 'featured' | 'synced_at' | 'sort_order'
type SortDir = 'asc' | 'desc'

function sortRows(arr: AdminProduct[], col: SortCol, dir: SortDir): AdminProduct[] {
  return [...arr].sort((a, b) => {
    const av = a[col]
    const bv = b[col]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'boolean') {
      return dir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av
    }
    const sa = String(av).toLowerCase()
    const sb = String(bv).toLowerCase()
    return dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
  })
}

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

function SortHeader({
  col, label, sort, onSort,
}: {
  col: SortCol
  label: string
  sort: { col: SortCol; dir: SortDir }
  onSort: (col: SortCol) => void
}) {
  const active = sort.col === col
  const indicator = active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''
  return (
    <th
      className={`admin-th ${styles.sortable} ${active ? styles.sortActive : ''}`}
      onClick={() => onSort(col)}
      role="columnheader"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}{indicator}
    </th>
  )
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
  const [search,       setSearch]       = useState('')
  const [catFilter,    setCatFilter]    = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sort,         setSort]         = useState<{ col: SortCol; dir: SortDir }>({ col: 'name', dir: 'asc' })
  const [pageSize,     setPageSize]     = useState<number | 'all'>(25)
  const [page,         setPage]         = useState(1)
  const [density,      setDensity]      = useState<'compact' | 'comfortable'>('comfortable')

  const categories = useMemo(() => {
    const s = new Set(products.map((p) => p.category ?? 'uncategorized'))
    return ['all', ...Array.from(s).sort()]
  }, [products])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sortRows(
      products.filter((p) => {
        if (catFilter !== 'all' && (p.category ?? 'uncategorized') !== catFilter) return false
        if (statusFilter === 'active'   && !p.active) return false
        if (statusFilter === 'inactive' &&  p.active) return false
        if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
        return true
      }),
      sort.col,
      sort.dir,
    )
  }, [products, catFilter, statusFilter, search, sort])

  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filtered.length / pageSize)
  const paged = pageSize === 'all' ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (v: string)  => { setSearch(v);       setPage(1) }
  const handleCat    = (v: string)  => { setCatFilter(v);    setPage(1) }
  const handleStatus = (v: string)  => { setStatusFilter(v as 'all' | 'active' | 'inactive'); setPage(1) }
  const handleSize   = (v: string)  => { setPageSize(v === 'all' ? 'all' : Number(v)); setPage(1) }
  const handleSort   = useCallback((col: SortCol) => {
    setSort((s) => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
    setPage(1)
  }, [])

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
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => handleStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All status</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
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
            <SortHeader col="name"       label="Name / SKU" sort={sort} onSort={handleSort} />
            <SortHeader col="category"   label="Category"   sort={sort} onSort={handleSort} />
            <SortHeader col="metal"      label="Metal"      sort={sort} onSort={handleSort} />
            <SortHeader col="active"     label="Active"     sort={sort} onSort={handleSort} />
            <SortHeader col="featured"   label="Featured"   sort={sort} onSort={handleSort} />
            <th className="admin-th">Views</th>
            <SortHeader col="synced_at"  label="Synced"     sort={sort} onSort={handleSort} />
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
                  {/* Thumbnail — active → public page; inactive → draft preview */}
                  <td className="admin-td">
                    <a
                      href={row.active
                        ? `/jewelry/${p.category ?? 'jewelry'}/${p.slug}`
                        : `/api/draft?template=default&slug=/jewelry/${p.category ?? 'jewelry'}/${p.slug}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      title={row.active ? undefined : 'Draft preview (inactive product)'}
                    >
                      {thumb
                        ? <img src={thumb} alt="" className={styles.thumb} style={row.active ? undefined : { opacity: 0.5 }} />
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
