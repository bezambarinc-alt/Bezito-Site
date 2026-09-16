'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveCarousel from './ArchiveCarousel'
import ArchiveModal from './ArchiveModal'

interface Props {
  entries:       ArchiveEntry[]
  initialCat:    string
  initialShape:  string
  initialColor:  string
  initialOpenId: string | null
}

export default function ArchiveClient({
  entries, initialCat, initialShape, initialColor, initialOpenId,
}: Props) {
  const router = useRouter()
  const params = useSearchParams()

  // Filter state lives in local React state — no router.replace() on filter change.
  // With force-dynamic on the page, URL navigation triggers a full server re-render;
  // keeping filters local avoids that completely.
  const [cat,   setCat]   = useState(initialCat)
  const [shape, setShape] = useState(initialShape)
  const [color, setColor] = useState(initialColor)

  // Only the open piece ID lives in the URL so deep-links work.
  const openId = params?.get('id') ?? initialOpenId

  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      setCat(nextCat)
      setShape(nextShape)
      setColor(nextColor)
    },
    [],
  )

  const openPiece = useCallback(
    (slug: string) => {
      const sp = new URLSearchParams()
      sp.set('id', slug)
      router.push(`?${sp.toString()}`, { scroll: false })
    },
    [router],
  )

  const closePiece = useCallback(() => {
    router.replace('/archive', { scroll: false })
  }, [router])

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
      <ArchiveCarousel
        entries={filtered}
        onOpen={openPiece}
        cat={cat}
        shape={shape}
        color={color}
        onFilterChange={handleFilterChange}
      />
      <ArchiveModal entry={openEntry} onClose={closePiece} />
    </>
  )
}
