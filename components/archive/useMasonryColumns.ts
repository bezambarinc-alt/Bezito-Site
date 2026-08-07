'use client'

/**
 * useMasonryColumns — dependency-free masonry column distributor.
 *
 * Matches the Astro archive look: cards cycle through sm/md/lg heights
 * (12-step pattern) and are packed shortest-column-first so the varied
 * heights stay balanced (round-robin only works for uniform heights).
 *
 * Design:
 *  - Measures the grid container via ResizeObserver (never the browser window),
 *    so it works identically on server and client — no hydration mismatch.
 *  - Each item gets a height bucket (sm/md/lg) from the 12-step cycle, then is
 *    placed into whichever column is currently shortest → true masonry stagger.
 *  - Zero dependencies.
 *
 * Returns `ready:false` until the container is measured client-side.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export type CardSize = 'sm' | 'md' | 'lg'

/** Astro HEIGHTS 12-step cycle → relative weights for shortest-column packing. */
const SIZE_CYCLE: CardSize[] = [
  'md', 'lg', 'sm', 'md', 'sm', 'lg',
  'md', 'sm', 'lg', 'md', 'lg', 'sm',
]

/** Relative height weights (Astro: sm 160 / md 240 / lg 340). */
const SIZE_WEIGHT: Record<CardSize, number> = { sm: 160, md: 240, lg: 340 }

export interface PlacedItem<T> {
  item: T
  size: CardSize
}

interface Options {
  targetColumnWidth?: number
  gutter?: number
  minColumns?: number
  maxColumns?: number
}

interface Result<T> {
  containerRef: React.RefObject<HTMLDivElement | null>
  columns: PlacedItem<T>[][]
  columnCount: number
  ready: boolean
}

export function useMasonryColumns<T>(
  items: T[],
  {
    targetColumnWidth = 220,
    gutter = 12,
    minColumns = 2,
    maxColumns = 6,
  }: Options = {},
): Result<T> {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [columnCount, setColumnCount] = useState(0) // 0 = not measured yet

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    const raw = Math.floor((w + gutter) / (targetColumnWidth + gutter))
    const next = Math.max(minColumns, Math.min(maxColumns, raw || minColumns))
    setColumnCount(prev => (prev === next ? prev : next))
  }, [targetColumnWidth, gutter, minColumns, maxColumns])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const count = columnCount || minColumns

  // Shortest-column packing with sm/md/lg height buckets → masonry stagger.
  const columns: PlacedItem<T>[][] = Array.from({ length: count }, () => [])
  const heights: number[] = Array.from({ length: count }, () => 0)

  items.forEach((item, i) => {
    const size = SIZE_CYCLE[i % SIZE_CYCLE.length]
    // find shortest column (ties → leftmost, preserves reading order)
    let target = 0
    for (let c = 1; c < count; c++) {
      if (heights[c] < heights[target]) target = c
    }
    columns[target].push({ item, size })
    heights[target] += SIZE_WEIGHT[size] + gutter
  })

  return {
    containerRef,
    columns,
    columnCount: count,
    ready: columnCount > 0,
  }
}
