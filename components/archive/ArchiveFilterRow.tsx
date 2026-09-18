'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import {
  CATEGORY_FILTERS,
  SHAPE_FILTERS,
  COLOR_FILTERS,
  type FilterOption,
} from '@/lib/data/archive-constants'
import styles from './ArchiveFilterRow.module.css'

interface Props {
  cat:             string
  shape:           string
  color:           string
  onFilterChange:  (cat: string, shape: string, color: string) => void
  availableCats:   Set<string>
  availableShapes: Set<string>
  availableColors: Set<string>
  dark?:           boolean
}

/**
 * Trim a filter list to only the values that currently have pieces behind them.
 * "all" always survives; the active value survives even if it momentarily has
 * no siblings, so the trigger can still show what's selected. Everything else
 * is dropped when its set doesn't contain it — no dead options, no empty
 * carousels.
 */
function availableOptions(
  options: FilterOption[], have: Set<string>, active: string,
): FilterOption[] {
  return options.filter(o => o.value === 'all' || o.value === active || have.has(o.value))
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
export default function ArchiveFilterRow({
  cat, shape, color, onFilterChange,
  availableCats, availableShapes, availableColors, dark,
}: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const catOptions   = availableOptions(CATEGORY_FILTERS, availableCats,   cat)
  const shapeOptions = availableOptions(SHAPE_FILTERS,    availableShapes, shape)
  const colorOptions = availableOptions(COLOR_FILTERS,    availableColors, color)

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

  // A facet is worth showing only if it offers a real choice (more than just
  // "All"). A lone "All" with nothing behind it is dead chrome — drop it.
  const selectors = [
    { id: 'cat',   key: 'cat'   as const, label: 'Category', options: catOptions,   value: cat },
    { id: 'shape', key: 'shape' as const, label: 'Shape',    options: shapeOptions, value: shape },
    { id: 'color', key: 'color' as const, label: 'Stone',    options: colorOptions, value: color },
  ].filter(s => s.options.length > 1)

  return (
    <div
      ref={rootRef}
      className={`${styles.bar} ${dark ? styles.barDark : ''}`}
      role="group"
      aria-label="Filter the archive"
    >
      {selectors.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && <span className={styles.sep} aria-hidden="true" />}
          <Selector
            id={s.id} label={s.label} options={s.options} value={s.value}
            open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)}
            onPick={v => pick(s.key, v)} dark={dark}
          />
        </Fragment>
      ))}

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
