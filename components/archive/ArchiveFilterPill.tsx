'use client'

/**
 * ArchiveFilterPill — floating filter control for the archive page.
 *
 * Three filter dimensions driven by data stored in Neon text[] columns:
 *   Category  — rings | bands | bracelets | necklaces | earrings | mens
 *   Stone Shape — round | radiant | framed | oval | pear | cushion | princess | …
 *   Stone Color — emerald | sapphire | fancy-yellow | ruby | fancy-pink | tourmaline
 *
 * Behaviour (matches Astro archiveFilterPill):
 *  1. Inline "Filter" pill anchored in the page.
 *  2. Goes fixed (bottom-center) when anchor scrolls out of view.
 *  3. Clicking opens a slide-up panel overlay with all filter groups.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORY_FILTERS, SHAPE_FILTERS, COLOR_FILTERS } from '@/lib/data/archive-constants'
import styles from './ArchiveFilterPill.module.css'

interface Props {
  cat:            string
  shape:          string
  color:          string
  filteredCount:  number
  totalCount:     number
  onFilterChange: (cat: string, shape: string, color: string) => void
}

export default function ArchiveFilterPill({
  cat, shape, color,
  filteredCount, totalCount,
  onFilterChange,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [floating,  setFloating]  = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  // Floating behaviour — mirrors Astro IntersectionObserver on archivePillAnchor
  useEffect(() => {
    const el = anchorRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setFloating(!e.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Close on ESC + move focus into the panel when it opens (a11y)
  useEffect(() => {
    if (!panelOpen) return
    panelRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelOpen])

  const activeCount =
    (cat   !== 'all' ? 1 : 0) +
    (shape !== 'all' ? 1 : 0) +
    (color !== 'all' ? 1 : 0)

  // Per-dimension setters preserve the other two dimensions
  const setCat   = useCallback((v: string) => onFilterChange(v, shape, color), [shape, color, onFilterChange])
  const setShape = useCallback((v: string) => onFilterChange(cat, v, color),   [cat, color, onFilterChange])
  const setColor = useCallback((v: string) => onFilterChange(cat, shape, v),   [cat, shape, onFilterChange])
  const reset    = useCallback(() => onFilterChange('all', 'all', 'all'),       [onFilterChange])

  const pillContent = (
    <>
      <FilterIcon />
      <span>Filter</span>
      {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
    </>
  )

  return (
    <>
      {/* ── Inline anchor pill ── */}
      <button
        ref={anchorRef}
        className={styles.pill}
        onClick={() => setPanelOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Filter pieces${activeCount > 0 ? ` — ${activeCount} active` : ''}`}
      >
        {pillContent}
      </button>

      {/* ── Fixed floating pill (appears when anchor scrolls out of view) ── */}
      {floating && (
        <button
          className={`${styles.pill} ${styles.pillFixed}`}
          onClick={() => setPanelOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Filter pieces${activeCount > 0 ? ` — ${activeCount} active` : ''}`}
        >
          {pillContent}
        </button>
      )}

      {/* ── Backdrop ── */}
      {panelOpen && (
        <div className={styles.backdrop} onClick={() => setPanelOpen(false)} aria-hidden />
      )}

      {/* ── Slide-up panel ── */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`${styles.panel} ${panelOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter the archive"
        aria-hidden={!panelOpen}
      >
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Filter Pieces</span>
          <button className={styles.panelClose} onClick={() => setPanelOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className={styles.groups}>
          <FilterGroup title="Category"    options={CATEGORY_FILTERS} active={cat}   onSelect={setCat} />
          <FilterGroup title="Stone Shape" options={SHAPE_FILTERS}    active={shape} onSelect={setShape} />
          <FilterGroup title="Stone Color" options={COLOR_FILTERS}    active={color} onSelect={setColor} />
        </div>

        <div className={styles.panelFoot}>
          <span className={styles.count}>
            {filteredCount === totalCount
              ? `${totalCount} pieces`
              : `${filteredCount} of ${totalCount} pieces`}
          </span>
          <div className={styles.footActions}>
            {activeCount > 0 && (
              <button className={styles.resetBtn} onClick={reset}>Clear all</button>
            )}
            <button className={styles.applyBtn} onClick={() => setPanelOpen(false)}>Apply</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function FilterGroup({
  title, options, active, onSelect,
}: {
  title:    string
  options:  { value: string; label: string }[]
  active:   string
  onSelect: (v: string) => void
}) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.options}>
        {options.map(opt => (
          <button
            key={opt.value}
            className={`${styles.opt} ${active === opt.value ? styles.optActive : ''}`}
            aria-pressed={active === opt.value}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Icon ──────────────────────────────────────────────────────────────────────

function FilterIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <path d="M1 2h12M3 6h8M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
