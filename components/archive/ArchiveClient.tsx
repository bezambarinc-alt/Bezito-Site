'use client'

/**
 * ArchiveClient — client-side shell for the archive page.
 *
 * Receives ALL entries from the server component (Neon query, once at render).
 * Filter state is derived DIRECTLY from the URL (useSearchParams) — the URL is
 * the single source of truth. This keeps browser back/forward in sync: pressing
 * back changes the URL, useSearchParams re-reads, the grid re-filters. No local
 * useState mirror to desync.
 *
 * Filter writes go through router.replace (scroll:false) which updates the URL
 * and triggers the re-render — instant, client-side, shareable/bookmarkable.
 *
 * Three filter dimensions: category · shape · color
 */

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveFilterPill from './ArchiveFilterPill'
import ArchiveGrid from './ArchiveGrid'
import styles from './ArchiveClient.module.css'

interface Props {
  entries: ArchiveEntry[]
}

export default function ArchiveClient({ entries }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  // URL is the source of truth — always in sync with back/forward
  const cat   = params?.get('cat')   ?? 'all'
  const shape = params?.get('shape') ?? 'all'
  const color = params?.get('color') ?? 'all'

  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      const sp = new URLSearchParams()
      if (nextCat   !== 'all') sp.set('cat',   nextCat)
      if (nextShape !== 'all') sp.set('shape', nextShape)
      if (nextColor !== 'all') sp.set('color', nextColor)
      const qs = sp.toString()
      router.replace(qs ? `?${qs}` : '/archive', { scroll: false })
    },
    [router],
  )

  const filtered = useMemo(
    () =>
      entries.filter(e => {
        const catOk   = cat   === 'all' || e.category === cat
        const shapeOk = shape === 'all' || e.shapes.includes(shape)
        const colorOk = color === 'all' || e.colors.includes(color)
        return catOk && shapeOk && colorOk
      }),
    [entries, cat, shape, color],
  )

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
