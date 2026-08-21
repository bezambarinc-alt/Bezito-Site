'use client'

/**
 * ArchiveClient — filter state + carousel + modal.
 *
 * Hero, editorial section, and AtelierBanner live in the server page component.
 * This component owns URL state for filters (?cat= ?shape= ?color=) and the
 * open piece (?id=<slug>), plus the interactive carousel and modal.
 */

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveCarousel from './ArchiveCarousel'
import ArchiveModal from './ArchiveModal'

interface Props {
  entries: ArchiveEntry[]
}

export default function ArchiveClient({ entries }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const cat    = params?.get('cat')   ?? 'all'
  const shape  = params?.get('shape') ?? 'all'
  const color  = params?.get('color') ?? 'all'
  const openId = params?.get('id')    ?? null

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
      const qs = buildQs({ cat: nextCat, shape: nextShape, color: nextColor, id: null })
      router.replace(qs ? `?${qs}` : '/archive', { scroll: false })
    },
    [router, buildQs],
  )

  const openPiece = useCallback(
    (slug: string) => {
      const qs = buildQs({ id: slug })
      router.push(`?${qs}`, { scroll: false })
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

  const openEntry = useMemo(
    () => (openId ? entries.find(e => e.slug === openId) ?? null : null),
    [entries, openId],
  )

  return (
    <>
      {/* Carousel — filter pill is rendered inside carousel header; key resets index on filter change */}
      <ArchiveCarousel
        key={`${cat}|${shape}|${color}`}
        entries={filtered}
        onOpen={openPiece}
        cat={cat}
        shape={shape}
        color={color}
        filteredCount={filtered.length}
        totalCount={entries.length}
        onFilterChange={handleFilterChange}
      />

      <ArchiveModal entry={openEntry} onClose={closePiece} />
    </>
  )
}
