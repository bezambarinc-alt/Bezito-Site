'use client'

/**
 * ArchiveClient — client-side shell for the archive page.
 *
 * Receives ALL entries from the server component (Neon query, once at render).
 * The URL is the single source of truth for BOTH:
 *   - filters:   ?cat= ?shape= ?color=
 *   - open piece: ?id=<slug>   (deep-linkable, shareable, back-button aware)
 *
 * Card click → router.push(?id=slug) → modal opens.
 * Modal close / ESC / backdrop → clears ?id= → modal closes.
 * Direct load of /archive?id=slug opens that piece's modal immediately.
 */

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveFilterPill from './ArchiveFilterPill'
import ArchiveGrid from './ArchiveGrid'
import ArchiveModal from './ArchiveModal'
import styles from './ArchiveClient.module.css'

interface Props {
  entries: ArchiveEntry[]
}

export default function ArchiveClient({ entries }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  // URL is the source of truth
  const cat    = params?.get('cat')   ?? 'all'
  const shape  = params?.get('shape') ?? 'all'
  const color  = params?.get('color') ?? 'all'
  const openId = params?.get('id')    ?? null

  // Build a query string preserving current filters, optionally with an id
  const buildQs = useCallback(
    (next: { cat?: string; shape?: string; color?: string; id?: string | null }) => {
      const sp = new URLSearchParams()
      const c  = next.cat   ?? cat
      const s  = next.shape ?? shape
      const cl = next.color ?? color
      const id = next.id === undefined ? openId : next.id
      if (c  !== 'all') sp.set('cat',   c)
      if (s  !== 'all') sp.set('shape', s)
      if (cl !== 'all') sp.set('color', cl)
      if (id)           sp.set('id',    id)
      return sp.toString()
    },
    [cat, shape, color, openId],
  )

  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      // Changing filters clears any open piece
      const qs = buildQs({ cat: nextCat, shape: nextShape, color: nextColor, id: null })
      router.replace(qs ? `?${qs}` : '/archive', { scroll: false })
    },
    [router, buildQs],
  )

  const openPiece = useCallback(
    (slug: string) => {
      const qs = buildQs({ id: slug })
      router.push(`?${qs}`, { scroll: false })  // push → back button closes modal
    },
    [router, buildQs],
  )

  const closePiece = useCallback(() => {
    const qs = buildQs({ id: null })
    router.replace(qs ? `?${qs}` : '/archive', { scroll: false })
  }, [router, buildQs])

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

  // Resolve the open piece from the URL id (search full set, not just filtered,
  // so a shared link works even if the visitor's filters would hide it)
  const openEntry = useMemo(
    () => (openId ? entries.find(e => e.slug === openId) ?? null : null),
    [entries, openId],
  )

  return (
    <div className={styles.wrap}>
      <ArchiveFilterPill
        cat={cat}
        shape={shape}
        color={color}
        filteredCount={filtered.length}
        totalCount={entries.length}
        onFilterChange={handleFilterChange}
      />

      <ArchiveGrid entries={filtered} onOpen={openPiece} />

      <ArchiveModal entry={openEntry} onClose={closePiece} />
    </div>
  )
}
