'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDrawers } from './DrawerContext'
import styles from './SearchOverlay.module.css'

interface SearchResult {
  type: 'product' | 'archive'
  title: string
  sku: string | null
  category: string | null
  href: string
  thumb: string | null
}

const SUGGESTIONS = ['Rings', 'The Elysian Cut', 'Bridal', 'The Archive', 'Bracelets', 'Earrings']

/** Wrap the matched substring in <mark> */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function SkeletonRows() {
  return (
    <ul className={styles.resultList} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 60}ms` }}>
          <span className={styles.skeletonThumb} />
          <span className={styles.skeletonText}>
            <span className={styles.skeletonLine} />
            <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function SearchOverlay() {
  const { active, close } = useDrawers()
  const open = active === 'search'
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Focus on open; reset on close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
    setQuery('')
    setResults([])
    setSearched(false)
    setActiveIndex(-1)
  }, [open])

  // Reset active index whenever query or results change
  useEffect(() => { setActiveIndex(-1) }, [query, results.length])

  // Debounced fetch — 180ms
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
    }, 180)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  // Keyboard: ESC close, arrows navigate, Enter go
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') { close(); return }
    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => {
        if (i <= 0) { inputRef.current?.focus(); return -1 }
        return i - 1
      })
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      close()
      router.push(results[activeIndex].href)
    }
  }, [open, close, results, activeIndex, router])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const runSuggestion = (s: string) => {
    setQuery(s)
    inputRef.current?.focus()
  }

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
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={activeIndex >= 0 ? `sr-${activeIndex}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              className={styles.clear}
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.results} aria-live="polite" id="search-results">
          {query.trim().length < 2 ? (
            <div>
              <p className={styles.suggestLabel}>Try searching for</p>
              <ul className={styles.suggest}>
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button className={styles.suggestPill} onClick={() => runSuggestion(s)}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : loading ? (
            <SkeletonRows />
          ) : results.length > 0 ? (
            <ul className={styles.resultList} ref={listRef} role="listbox">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.sku ?? r.href}-${i}`} role="option" aria-selected={i === activeIndex} id={`sr-${i}`}>
                  <Link
                    href={r.href}
                    className={`${styles.resultRow} ${i === activeIndex ? styles.resultRowActive : ''}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={close}
                  >
                    {r.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.resultThumb} src={r.thumb} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.resultThumbFallback} aria-hidden />
                    )}
                    <span className={styles.resultText}>
                      <span className={styles.resultTitle}>
                        <Highlight text={r.title} query={query.trim()} />
                      </span>
                      <span className={styles.resultMeta}>
                        {r.type === 'archive' ? 'Archive' : 'Collection'}
                        {r.sku ? ` · ${r.sku}` : ''}
                      </span>
                    </span>
                    <span className={styles.resultArrow} aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <p className={styles.hint}>No results for &ldquo;{query.trim()}&rdquo;. Try the menu to browse collections.</p>
          ) : null}
        </div>

        {results.length > 0 && (
          <p className={styles.keyHint} aria-hidden="true">
            <kbd>↑↓</kbd> navigate &nbsp; <kbd>↵</kbd> open &nbsp; <kbd>esc</kbd> close
          </p>
        )}
      </div>
    </div>
  )
}
