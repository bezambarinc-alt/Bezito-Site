'use client'

/**
 * ArchiveClient — client-side shell for the archive page.
 *
 * Receives ALL entries from the server component (static JSON, parsed once).
 * Owns filter state in memory → instant filtering, no server round-trip.
 * Updates URL via history.replaceState so filters are shareable/bookmarkable.
 *
 * Wrapped in <Suspense> by the server page because it uses useSearchParams.
 */

import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveFilterPill from './ArchiveFilterPill'
import ArchiveGrid from './ArchiveGrid'
import styles from './ArchiveClient.module.css'

interface Props {
  entries: ArchiveEntry[]
}

export default function ArchiveClient({ entries }: Props) {
  const searchParams = useSearchParams()

  // Initialise from URL params (supports direct-link / back-button)
  const [cat,   setCatState]   = useState(() => searchParams?.get('cat')   ?? 'all')
  const [shape, setShapeState] = useState(() => searchParams?.get('shape') ?? 'all')

  /** Update both state + URL (no server round-trip, pushes to browser history). */
  const handleFilterChange = useCallback((nextCat: string, nextShape: string) => {
    setCatState(nextCat)
    setShapeState(nextShape)

    const sp = new URLSearchParams()
    if (nextCat   !== 'all') sp.set('cat',   nextCat)
    if (nextShape !== 'all') sp.set('shape', nextShape)

    const qs = sp.size > 0 ? `?${sp.toString()}` : window.location.pathname
    window.history.replaceState(null, '', qs)
  }, [])

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const catOk   = cat   === 'all' || e.category === cat
      const shapeOk = shape === 'all' || e.shapes.includes(shape)
      return catOk && shapeOk
    })
  }, [entries, cat, shape])

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <ArchiveFilterPill
          cat={cat}
          shape={shape}
          filteredCount={filtered.length}
          totalCount={entries.length}
          onFilterChange={handleFilterChange}
        />
        {(cat !== 'all' || shape !== 'all') && (
          <span className={styles.activeLabel}>
            {filtered.length} of {entries.length} pieces
          </span>
        )}
      </div>

      <ArchiveGrid entries={filtered} />
    </div>
  )
}
