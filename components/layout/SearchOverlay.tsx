'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './SearchOverlay.module.css'

/**
 * Centered search dialog. Queries /api/search (Neon ILIKE across products +
 * archive) debounced as the user types, and renders live results. Replaces the
 * old placeholder — the Next-idiomatic equivalent of Astro's Pagefind search.
 */

interface SearchResult {
  type: 'product' | 'archive'
  title: string
  sku: string | null
  category: string | null
  href: string
  thumb: string | null
}

const SUGGESTIONS = ['Rings', 'The Elysian Cut', 'Bridal', 'The Archive']

export default function SearchOverlay() {
  const { active, close } = useDrawers()
  const open = active === 'search'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on open; reset everything on close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
    setQuery('')
    setResults([])
    setSearched(false)
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Debounced search against /api/search
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        const data = (await res.json()) as { results?: SearchResult[] }
        setResults(data.results ?? [])
        setSearched(true)
      } catch {
        if (!ctrl.signal.aborted) { setResults([]); setSearched(true) }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 220)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

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
            placeholder="Search jewelry, collections, archive…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
          />
        </div>

        <div className={styles.results} aria-live="polite">
          {query.trim().length < 2 ? (
            <ul className={styles.suggest}>
              {SUGGESTIONS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : loading ? (
            <p className={styles.hint}>Searching…</p>
          ) : results.length > 0 ? (
            <ul className={styles.resultList}>
              {results.map((r, i) => (
                <li key={`${r.type}-${r.sku ?? r.href}-${i}`}>
                  <Link href={r.href} className={styles.resultRow} onClick={close}>
                    {r.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.resultThumb} src={r.thumb} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.resultThumbFallback} aria-hidden />
                    )}
                    <span className={styles.resultText}>
                      <span className={styles.resultTitle}>{r.title}</span>
                      <span className={styles.resultMeta}>
                        {r.type === 'archive' ? 'Archive' : 'Collection'}
                        {r.sku ? ` · ${r.sku}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <p className={styles.hint}>No results for “{query.trim()}”. Try the menu to browse collections.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
