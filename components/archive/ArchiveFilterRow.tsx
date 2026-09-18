'use client'

import {
  CATEGORY_FILTERS,
  SHAPE_FILTERS,
  COLOR_FILTERS,
  type FilterOption,
} from '@/lib/data/archive-constants'
import styles from './ArchiveFilterRow.module.css'

interface Props {
  cat:            string
  shape:          string
  color:          string
  onFilterChange: (cat: string, shape: string, color: string) => void
  dark?:          boolean
}

export default function ArchiveFilterRow({ cat, shape, color, onFilterChange, dark }: Props) {
  const setCat   = (v: string) => onFilterChange(v, shape, color)
  const setShape = (v: string) => onFilterChange(cat, v, color)
  const setColor = (v: string) => onFilterChange(cat, shape, v)

  return (
    <div className={`${styles.filters} ${dark ? styles.filtersDark : ''}`}>
      <FilterGroup
        label="Category" options={CATEGORY_FILTERS}
        active={cat} onSelect={setCat} dark={dark}
      />
      <FilterGroup
        label="Shape" options={SHAPE_FILTERS}
        active={shape} onSelect={setShape} dark={dark}
      />
      <FilterGroup
        label="Stone" options={COLOR_FILTERS}
        active={color} onSelect={setColor} dark={dark}
      />
    </div>
  )
}

function FilterGroup({
  label, options, active, onSelect, dark,
}: {
  label:    string
  options:  FilterOption[]
  active:   string
  onSelect: (v: string) => void
  dark?:    boolean
}) {
  return (
    <nav
      className={`${styles.row} ${dark ? styles.rowDark : ''}`}
      aria-label={`Filter by ${label.toLowerCase()}`}
    >
      <span className={styles.groupLabel} aria-hidden="true">{label}</span>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`${styles.tab} ${active === opt.value ? styles.tabActive : ''}`}
          onClick={() => onSelect(opt.value)}
          aria-pressed={active === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </nav>
  )
}
