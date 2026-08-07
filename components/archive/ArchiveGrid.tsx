'use client'

/**
 * ArchiveGrid — virtualized masonry grid of GIF cards, powered by `masonic`.
 *
 * Why masonic (vs the previous hand-rolled CSS-columns approach):
 *  - Correct left-to-right reading order (CSS columns fill top-to-bottom per column)
 *  - Virtualization — only renders cells near the viewport, recycles the rest
 *    (matters at 560+ animated GIFs)
 *  - Battle-tested resize/measure handling
 *
 * Card sizing is uniform (no sm/md/lg jitter) — masonic still produces a natural
 * masonry because each GIF's intrinsic aspect ratio drives its rendered height.
 */

import { Masonry } from 'masonic'
import ArchiveGifCard from './ArchiveGifCard'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import styles from './ArchiveGrid.module.css'

interface Props {
  entries: ArchiveEntry[]
}

// masonic render prop — one cell. `data` is the entry, `width` is the column width.
function renderCard({ data, width }: { index: number; data: ArchiveEntry; width: number }) {
  return <ArchiveGifCard entry={data} width={width} />
}

export default function ArchiveGrid({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        No pieces found for this filter. Try a different combination.
      </p>
    )
  }

  return (
    <Masonry
      // Re-mount the grid when the filtered set changes so positions reset cleanly
      key={entries.length + entries[0]?.slug}
      items={entries}
      render={renderCard}
      columnGutter={12}
      columnWidth={200}
      maxColumnCount={6}
      overscanBy={2}
      itemKey={(data) => data.slug}
    />
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
