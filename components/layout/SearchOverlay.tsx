'use client'

import { useEffect, useRef, useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './SearchOverlay.module.css'

/**
 * Centered search dialog. Results are a placeholder for now — wire to Pagefind
 * or a DB full-text search endpoint later.
 */
export default function SearchOverlay() {
  const { active, close } = useDrawers()
  const open = active === 'search'
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
    setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <div
      className={`${styles.overlay} ${open ? styles.open : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
      onClick={close}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={close} aria-label="Close search">✕</button>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search jewelry, collections, journal…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.results}>
          {query.trim() ? (
            <p className={styles.hint}>Search is being wired to the catalog. Try the menu to browse collections.</p>
          ) : (
            <ul className={styles.suggest}>
              <li>Rings</li>
              <li>The Elysian Cut</li>
              <li>Bridal</li>
              <li>The Archive</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
