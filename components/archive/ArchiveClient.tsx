'use client'

/**
 * ArchiveClient — client-side shell for the archive page.
 *
 * Receives ALL entries from the server component (Neon query, done once at render).
 * Owns filter state in memory → instant filtering, no server round-trip.
 * Updates URL via history.replaceState so filters are shareable/bookmarkable.
 *
 * Three filter dimensions: category · shape · color
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

  // Initialise from URL params (supports direct-link + back-button)
  const [cat,   setCat]   = useState(() => searchParams?.get('cat')   ?? 'all')
  const [shape, setShape] = useState(() => searchParams?.get('shape') ?? 'all')
  const [color, setColor] = useState(() => searchParams?.get('color') ?? 'all')

  /** Update filter state AND push to URL — no server round-trip. */
  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      setCat(nextCat)
      setShape(nextShape)
      setColor(nextColor)

      const sp = new URLSearchParams()
      if (nextCat   !== 'all') sp.set('cat',   nextCat)
      if (nextShape !== 'all') sp.set('shape', nextShape)
      if (nextColor !== 'all') sp.set('color', nextColor)

      const qs = sp.size > 0 ? `?${sp.toString()}` : window.location.pathname
      window.history.replaceState(null, '', qs)
    },
    [],
  )

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const catOk   = cat   === 'all' || e.category === cat
      const shapeOk = shape === 'all' || e.shapes.includes(shape)
      const colorOk = color === 'all' || e.colors.includes(color)
      return catOk && shapeOk && colorOk
    })
  }, [entries, cat, shape, color])

  const isFiltered = cat !== 'all' || shape !== 'all' || color !== 'all'

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <ArchiveFilterPill
          cat={cat}
          shape={shape}
          color={color}
          filteredCount={filtered.length}
          totalCount={entries.length}
          onFilterChange={handleFilterChange}
        />
        {isFiltered && (
          <span className={styles.activeLabel}>
            {filtered.length} of {entries.length} pieces
          </span>
        )}
      </div>

      <ArchiveGrid entries={filtered} />
    </div>
  )
}
