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

  // Available options per facet — computed against the entries that pass the
  // OTHER two active filters, so a facet never offers a value that would land
  // on an empty carousel. Each facet excludes its own selection from the test
  // (picking Shape=Heart shouldn't collapse the Shape list to just Heart).
  const available = useMemo(() => {
    const matches = (e: ArchiveEntry, skip: 'cat' | 'shape' | 'color') => {
      const catOk   = skip === 'cat'   || cat   === 'all' || e.category === cat
      const shapeOk = skip === 'shape' || shape === 'all' || e.shapes.includes(shape)
      const colorOk = skip === 'color' || color === 'all' || e.colors.includes(color)
      return catOk && shapeOk && colorOk
    }
    const cats   = new Set<string>()
    const shapes = new Set<string>()
    const colors = new Set<string>()
    for (const e of entries) {
      if (matches(e, 'cat')   && e.category) cats.add(e.category)
      if (matches(e, 'shape')) for (const s of e.shapes) shapes.add(s)
      if (matches(e, 'color')) for (const c of e.colors) colors.add(c)
    }
    return { cats, shapes, colors }
  }, [entries, cat, shape, color])

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
        availableCats={available.cats}
        availableShapes={available.shapes}
        availableColors={available.colors}
      />
      <ArchiveModal entry={openEntry} onClose={closePiece} />
    </>
  )
}
