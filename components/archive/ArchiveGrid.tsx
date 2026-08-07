/**
 * ArchiveGrid — CSS columns masonry grid of GIF cards.
 *
 * Receives pre-filtered entries from ArchiveClient.
 * Pure rendering — no filter logic lives here.
 *
 * Layout: CSS `columns` (matches Astro, zero JS overhead, SSR-safe).
 * Cards cycle through sm/md/lg aspect-ratios (12-step Astro pattern).
 */

import ArchiveGifCard from './ArchiveGifCard'
import type { ArchiveEntry, CardSize } from '@/lib/data/archive-constants'
import { CARD_SIZE_CYCLE } from '@/lib/data/archive-constants'
import styles from './ArchiveGrid.module.css'

interface Props {
  entries: ArchiveEntry[]
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
    <div className={styles.masonry}>
      {entries.map((entry, i) => (
        <ArchiveGifCard
          key={entry.slug}
          entry={entry}
          size={CARD_SIZE_CYCLE[i % CARD_SIZE_CYCLE.length] as CardSize}
        />
      ))}
    </div>
  )
}

/** Shimmer skeleton — shown while the client component hydrates */
export function ArchiveGridSkeleton() {
  // Heights mirror the sm/md/lg size cycle visually
  const heights = [240, 320, 200, 260, 200, 320, 240, 200, 320, 260, 320, 200]
  return (
    <div className={styles.masonry} aria-hidden>
      {heights.map((h, i) => (
        <div key={i} className={styles.skeleton} style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}
