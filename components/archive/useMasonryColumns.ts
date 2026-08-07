'use client'

/**
 * useMasonryColumns — minimal, dependency-free masonry column distributor.
 *
 * Reference: the "shortest-column placement" technique from
 * https://dev.to/adioof/why-i-built-another-masonry-library-for-react (dream-masonry),
 * adapted and simplified for our exact case.
 *
 * Why hand-built (not masonic / dream-masonry):
 *  - masonic measured the browser `window` and collapsed under Next.js App Router
 *    (rendered zero tiles until a resize). This measures OUR container via
 *    ResizeObserver — never the window — so there is no hydration collapse.
 *  - Our cards are a fixed 3:4 aspect ratio, so every card's height is known
 *    (= columnWidth * 4/3). That removes the hardest part of masonry (measuring
 *    each image) — with uniform heights, round-robin placement is already
 *    perfectly column-balanced AND gives correct left-to-right reading order.
 *  - Zero dependencies, ~40 lines, provably compatible because it's written
 *    against this stack (React 19 + Next 16 App Router). No 'window is not
 *    defined', no client-only measurement gap.
 *
 * SSR-safe: renders `ready:false` until the container is measured client-side,
 * so the caller shows a skeleton rather than a collapsed/empty grid.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface Options {
  /** Target column width in px. Column count = floor(containerWidth / (target+gutter)). */
  targetColumnWidth?: number
  gutter?: number
  minColumns?: number
  maxColumns?: number
}

interface Result<T> {
  containerRef: React.RefObject<HTMLDivElement | null>
  columns: T[][]
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

  // Distribute items. Uniform card height → round-robin is balanced + reading-order correct.
  const count = columnCount || minColumns
  const columns: T[][] = Array.from({ length: count }, () => [])
  items.forEach((item, i) => {
    columns[i % count].push(item)
  })

  return {
    containerRef,
    columns,
    columnCount: count,
    ready: columnCount > 0,
  }
}
