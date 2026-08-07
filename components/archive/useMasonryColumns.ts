'use client'

/**
 * useMasonryColumns — minimal, dependency-free masonry column distributor.
 *
 * Distributes items into N flex columns for a masonry grid.
 *
 * Design:
 *  - Measures the grid container via ResizeObserver (never the browser window),
 *    so it works identically on server and client — no hydration mismatch.
 *  - Cards are a fixed 3:4 aspect ratio, so heights are uniform. With uniform
 *    heights, round-robin placement is already column-balanced AND gives correct
 *    left-to-right reading order — no per-image measurement needed.
 *  - Zero dependencies.
 *
 * Renders `ready:false` until the container is measured client-side, so the
 * grid fades in cleanly rather than reflowing.
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
