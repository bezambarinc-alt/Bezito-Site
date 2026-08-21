'use client'

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
  onFilterChange,
}: Props) {
  const setCat = (v: string) => onFilterChange(v, shape, color)

  return (
    <nav className={styles.row} aria-label="Filter by collection">
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
  )
}
