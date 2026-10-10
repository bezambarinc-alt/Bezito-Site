'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import { useDrawers } from '../layout/DrawerContext'
import ArchiveCarousel from './ArchiveCarousel'

interface Props {
  entries:      ArchiveEntry[]
  initialCat:   string
  initialShape: string
  initialColor: string
  hideCategoryFilter?: boolean
}

export default function ArchiveClient({
  entries, initialCat, initialShape, initialColor, hideCategoryFilter,
}: Props) {
  const { openInquiryDrawer } = useDrawers()

  const [cat,   setCat]   = useState(initialCat)
  const [shape, setShape] = useState(initialShape)
  const [color, setColor] = useState(initialColor)

  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      setCat(nextCat)
      setShape(nextShape)
      setColor(nextColor)
    },
    [],
  )

  const openPiece = useCallback(
    (entry: { slug: string; title: string; sku: string }) => {
      openInquiryDrawer({
        intent: 'A Piece from the Archive',
        title: entry.title,
        sku: entry.sku,
      })
    },
    [openInquiryDrawer],
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

  return (
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
      hideCategoryFilter={hideCategoryFilter}
    />
  )
}
