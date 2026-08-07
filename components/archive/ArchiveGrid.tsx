'use client'

/**
 * ArchiveGrid — masonry grid of GIF cards.
 *
 * Built from scratch (reference: the shortest-column technique from dream-masonry,
 * https://dev.to/adioof/why-i-built-another-masonry-library-for-react).
 *
 * WHY NOT a library: masonic collapsed under Next.js App Router — it measured the
 * browser `window` and painted zero tiles until a manual resize. This is written
 * against THIS stack (React 19 + Next 16 App Router), measures OUR container via
 * ResizeObserver (never the window), and renders plain flex columns — so there is
 * no hydration collapse and no 'window is not defined'. Zero dependencies.
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
