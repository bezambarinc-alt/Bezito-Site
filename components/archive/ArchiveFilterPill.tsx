'use client'

/**
 * ArchiveFilterPill — floating filter control for the archive page.
 *
 * LOOK & FEEL replicates the live Astro `archiveFilterPill` / `archiveFilterPanel`
 * exactly (src/pages/archive.astro on main):
 *
 *  1. Inline gold pill anchored below the hero (`.ba-filter-pill-anchor`).
 *  2. Pill goes fixed bottom-center when the anchor scrolls out of view
 *     (IntersectionObserver → `is-floating`).
 *  3. Clicking opens a LEFT-SIDE slide-in drawer (`.ba-filter-panel`, mirrors the
 *     nav menu drawer) with a single "Collection" list of category options.
 *  4. Active option shows a gold `·` dot; footer CTA is "Show Pieces".
 *
 * Underneath, the URL stays the single source of truth (cat/shape/color) — but the
 * visible drawer only exposes the Category dimension, exactly like Astro. Shape/color
 * are preserved in the URL but not surfaced in the UI (Astro has no such controls).
 */

import { useEffect, useRef, useState } from 'react'
import { CATEGORY_FILTERS } from '@/lib/data/archive-constants'
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
  const [open,     setOpen]     = useState(false)
  const [floating, setFloating] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

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

  // Close on ESC + lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = prev
    }
  }, [open])

  // Category change preserves the other two URL dimensions
  const setCat = (v: string) => { onFilterChange(v, shape, color); setOpen(false) }

  const pillLabel = cat === 'all'
    ? 'Filter'
    : (CATEGORY_FILTERS.find(o => o.value === cat)?.label ?? 'Filter')

  const Pill = ({ fixed }: { fixed?: boolean }) => (
    <button
      className={`${styles.pill} ${fixed ? styles.pillFloating : ''}`}
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-label="Filter pieces"
    >
      <FilterIcon />
      <span>{pillLabel}</span>
    </button>
  )

  return (
    <>
      {/* ── Inline anchor — pill starts here, floats to bottom on scroll ── */}
      <div ref={anchorRef} className={styles.anchor}>
        {!floating && <Pill />}
      </div>

      {/* ── Fixed floating pill (appears when anchor scrolls out of view) ── */}
      {floating && <Pill fixed />}

      {/* ── Overlay ── */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayActive : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* ── Left-side filter drawer ── */}
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label="Filter archive"
        aria-hidden={!open}
      >
        <button className={styles.panelClose} onClick={() => setOpen(false)} aria-label="Close filters">✕</button>
        <span className={styles.panelTitle}>Filter</span>

        <nav className={styles.panelBody}>
          <span className={styles.sectionLabel}>Collection</span>
          {CATEGORY_FILTERS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.opt} ${cat === opt.value ? styles.optActive : ''}`}
              data-filter={opt.value}
              aria-pressed={cat === opt.value}
              onClick={() => setCat(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </nav>

        <div className={styles.panelFooter}>
          <button className={styles.results} onClick={() => setOpen(false)}>
            {filteredCount === totalCount
              ? `Show ${totalCount} Pieces`
              : `Show ${filteredCount} Pieces`}
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Icon (matches Astro's 3-line filter glyph) ────────────────────────────────

function FilterIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
      <path d="M1 1.5h12M3 5h8M5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
