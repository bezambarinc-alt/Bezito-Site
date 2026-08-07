'use client'

/**
 * ArchiveGifCard — one GIF tile, rendered by masonic.
 *
 * masonic measures this cell's rendered height to position the grid, so the
 * card must render at its natural (intrinsic) GIF aspect ratio. We fix the
 * frame to a portrait 3:4 ratio for uniform rhythm; masonic handles column
 * packing and virtualization.
 *
 * Lazy-load / pause: an IntersectionObserver per card toggles the GIF <img>
 * vs a placeholder. Since masonic virtualizes, only near-viewport cards mount
 * at all — so this is now a second, cheaper layer of the same optimization.
 */

import { useEffect, useRef, useState } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ArchiveGifCard.module.css'

interface Props {
  entry: ArchiveEntry
  /** Column width from masonic (unused for layout — CSS handles it — kept for API clarity) */
  width?: number
}

export default function ArchiveGifCard({ entry }: Props) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const [inView, setInView] = useState(false)
  const { openArchiveDrawer } = useDrawers()

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <button
      ref={cardRef}
      className={styles.card}
      onClick={() =>
        openArchiveDrawer({ title: entry.title, sku: entry.sku, mp4Url: entry.mp4Url })
      }
      aria-label={`View ${entry.title}`}
    >
      <div className={styles.mediaWrap} aria-hidden>
        {inView && entry.gifUrl ? (
          <img
            src={entry.gifUrl}
            alt=""
            className={styles.gif}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>

      {/* Play icon — hover */}
      <span className={styles.playIcon} aria-hidden>
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      </span>

      {/* Caption — hover. aria-hidden: title already announced by button aria-label */}
      <span className={styles.caption} aria-hidden>{entry.title}</span>
    </button>
  )
}
