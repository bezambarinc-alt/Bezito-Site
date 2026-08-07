'use client'

/**
 * ArchiveGrid — masonry grid of GIF cards.
 *
 * Renders items into flex columns via the useMasonryColumns hook. The container
 * is measured with a ResizeObserver (never the browser window), so the grid
 * produces identical markup on server and client — no hydration mismatch.
 *
 * Cards are a fixed 3:4 aspect ratio, so heights are uniform → round-robin column
 * distribution is both balanced and correct left-to-right reading order.
 */

import { useMasonryColumns } from './useMasonryColumns'
import ArchiveGifCard from './ArchiveGifCard'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import styles from './ArchiveGrid.module.css'

interface Props {
  entries: ArchiveEntry[]
}

export default function ArchiveGrid({ entries }: Props) {
  const { containerRef, columns, ready } = useMasonryColumns(entries, {
    targetColumnWidth: 220,
    gutter: 12,
    minColumns: 2,
    maxColumns: 6,
  })

  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        No pieces found for this filter. Try a different combination.
      </p>
    )
  }

  return (
    <div ref={containerRef} className={styles.masonry} data-ready={ready}>
      {columns.map((col, ci) => (
        <div key={ci} className={styles.column}>
          {col.map((entry) => (
            <ArchiveGifCard key={entry.slug} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Shimmer skeleton — shown while the client component hydrates */
export function ArchiveGridSkeleton() {
  return (
    <div className={styles.skeletonGrid} aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles[`sk${(i % 3) + 1}`]}`} />
      ))}
    </div>
  )
}
