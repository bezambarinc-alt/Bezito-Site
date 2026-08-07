'use client'

/**
 * ArchiveFilterPill — floating filter control for the archive page.
 *
 * Behaviour (matches Astro archiveFilterPill):
 *  1. A "Filter" pill is rendered inline (in-flow) above the grid.
 *  2. An IntersectionObserver watches that inline pill. Once it scrolls
 *     out of view the same pill re-appears as a FIXED overlay at the bottom
 *     of the screen so the user can always reach the filter.
 *  3. Clicking either pill opens a slide-up panel overlay with filter groups.
 *  4. Filter state lives in the URL (history.replaceState — no server round trip).
 *
 * Filter groups:
 *  - Category  (htmlCategory): rings | bands | bracelets | necklaces | earrings | mens
 *  - Stone Shape (parsed tags): round | oval | pear | framed | princess | …
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORY_FILTERS, SHAPE_FILTERS } from '@/lib/data/archive-constants'
import styles from './ArchiveFilterPill.module.css'

interface Props {
  cat:           string
  shape:         string
  filteredCount: number
  totalCount:    number
  onFilterChange: (cat: string, shape: string) => void
}

export default function ArchiveFilterPill({
  cat,
  shape,
  filteredCount,
  totalCount,
  onFilterChange,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [floating,  setFloating]  = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

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

  // Close panel on ESC
  useEffect(() => {
    if (!panelOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelOpen])

  const activeCount = (cat !== 'all' ? 1 : 0) + (shape !== 'all' ? 1 : 0)

  const setCat   = useCallback((v: string) => onFilterChange(v, shape), [shape, onFilterChange])
  const setShape = useCallback((v: string) => onFilterChange(cat, v),   [cat,   onFilterChange])
  const reset    = useCallback(() => onFilterChange('all', 'all'),       [onFilterChange])

  return (
    <>
      {/* ── Inline anchor pill (becomes fixed when scrolled out of view) ── */}
      <button
        ref={anchorRef}
        className={styles.pill}
        onClick={() => setPanelOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Filter pieces${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
      >
        <FilterIcon />
        <span>Filter</span>
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {/* ── Floating pill (fixed, appears when anchor scrolls out of view) ── */}
      {floating && (
        <button
          className={`${styles.pill} ${styles.pillFixed}`}
          onClick={() => setPanelOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Filter pieces${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
        >
          <FilterIcon />
          <span>Filter</span>
          {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </button>
      )}

      {/* ── Backdrop ── */}
      {panelOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setPanelOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Slide-up filter panel ── */}
      <div
        className={`${styles.panel} ${panelOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter the archive"
        aria-hidden={!panelOpen}
      >
        {/* Panel header */}
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Filter Pieces</span>
          <button
            className={styles.panelClose}
            onClick={() => setPanelOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        {/* Filter groups */}
        <div className={styles.groups}>

          {/* Category */}
          <FilterGroup
            title="Category"
            options={CATEGORY_FILTERS}
            active={cat}
            onSelect={setCat}
          />

          {/* Stone Shape */}
          <FilterGroup
            title="Stone Shape"
            options={SHAPE_FILTERS}
            active={shape}
            onSelect={setShape}
          />

        </div>

        {/* Panel footer — result count + clear + apply */}
        <div className={styles.panelFoot}>
          <span className={styles.count}>
            {filteredCount === totalCount
              ? `${totalCount} pieces`
              : `${filteredCount} of ${totalCount} pieces`}
          </span>
          <div className={styles.footActions}>
            {activeCount > 0 && (
              <button className={styles.resetBtn} onClick={reset}>
                Clear all
              </button>
            )}
            <button
              className={styles.applyBtn}
              onClick={() => setPanelOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-component: one labelled group of option pills ────────────────────────

function FilterGroup({
  title,
  options,
  active,
  onSelect,
}: {
  title: string
  options: { value: string; label: string }[]
  active: string
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

// ── Icon ─────────────────────────────────────────────────────────────────────

function FilterIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <path d="M1 2h12M3 6h8M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
