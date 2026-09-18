'use client'

import { useEffect, useRef, useState } from 'react'
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

/**
 * Editorial filter bar — restraint over exposure.
 *
 * At rest it reads as one quiet centred line: three labelled selectors
 * (Category · Shape · Stone). Nothing is spelled out until asked for. Clicking
 * a selector opens a single refined panel of options; picking one closes it and
 * shows the choice inline. A hairline "Reset" appears only once something is
 * narrowed. Same three triggers in the light (desktop) and dark (mobile) mounts.
 */
export default function ArchiveFilterRow({ cat, shape, color, onFilterChange, dark }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close the open panel on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const anyActive = cat !== 'all' || shape !== 'all' || color !== 'all'

  const pick = (key: 'cat' | 'shape' | 'color', v: string) => {
    if (key === 'cat')   onFilterChange(v, shape, color)
    if (key === 'shape') onFilterChange(cat, v, color)
    if (key === 'color') onFilterChange(cat, shape, v)
    setOpen(null)
  }

  const reset = () => { onFilterChange('all', 'all', 'all'); setOpen(null) }

  return (
    <div
      ref={rootRef}
      className={`${styles.bar} ${dark ? styles.barDark : ''}`}
      role="group"
      aria-label="Filter the archive"
    >
      <Selector
        id="cat"   label="Category" options={CATEGORY_FILTERS} value={cat}
        open={open === 'cat'}   onToggle={() => setOpen(open === 'cat' ? null : 'cat')}
        onPick={v => pick('cat', v)}   dark={dark}
      />
      <span className={styles.sep} aria-hidden="true" />
      <Selector
        id="shape" label="Shape" options={SHAPE_FILTERS} value={shape}
        open={open === 'shape'} onToggle={() => setOpen(open === 'shape' ? null : 'shape')}
        onPick={v => pick('shape', v)} dark={dark}
      />
      <span className={styles.sep} aria-hidden="true" />
      <Selector
        id="color" label="Stone" options={COLOR_FILTERS} value={color}
        open={open === 'color'} onToggle={() => setOpen(open === 'color' ? null : 'color')}
        onPick={v => pick('color', v)} dark={dark}
      />

      {anyActive && (
        <button type="button" className={styles.reset} onClick={reset}>
          Reset
        </button>
      )}
    </div>
  )
}

function Selector({
  id, label, options, value, open, onToggle, onPick, dark,
}: {
  id:       string
  label:    string
  options:  FilterOption[]
  value:    string
  open:     boolean
  onToggle: () => void
  onPick:   (v: string) => void
  dark?:    boolean
}) {
  const active   = value !== 'all'
  const selected = options.find(o => o.value === value)
  // At rest show the label; once narrowed show the chosen option in its place.
  const display  = active && selected ? selected.label : label

  return (
    <div className={styles.selector}>
      <button
        type="button"
        className={`${styles.trigger} ${active ? styles.triggerActive : ''} ${open ? styles.triggerOpen : ''}`}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerLabel}>{display}</span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {open && (
        <ul className={`${styles.panel} ${dark ? styles.panelDark : ''}`} role="listbox" aria-label={label}>
          {options.map(opt => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                type="button"
                className={`${styles.option} ${opt.value === value ? styles.optionActive : ''}`}
                onClick={() => onPick(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
