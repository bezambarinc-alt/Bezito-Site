'use client'

/**
 * ArchiveFilterRow — editorial typographic category filter for the archive carousel header.
 * No pill, no drawer, no floating — just spaced-caps text tabs with a gold active state.
 * Designed to sit inside the dark carousel section as its masthead.
 */

import { CATEGORY_FILTERS } from '@/lib/data/archive-constants'
import styles from './ArchiveFilterRow.module.css'

interface Props {
  cat:            string
  shape:          string
  color:          string
  filteredCount:  number
  totalCount:     number
  onFilterChange: (cat: string, shape: string, color: string) => void
}

export default function ArchiveFilterRow({
  cat, shape, color,
  filteredCount, totalCount,
  onFilterChange,
}: Props) {
  const setCat = (v: string) => onFilterChange(v, shape, color)

  return (
    <div className={styles.row}>
      <span className={styles.label}>The Archive</span>

      <nav className={styles.tabs} aria-label="Filter by collection">
        {CATEGORY_FILTERS.map(opt => (
          <button
            key={opt.value}
            className={`${styles.tab} ${cat === opt.value ? styles.tabActive : ''}`}
            onClick={() => setCat(opt.value)}
            aria-pressed={cat === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      {filteredCount !== totalCount && (
        <span className={styles.count}>{filteredCount} pieces</span>
      )}
    </div>
  )
}
