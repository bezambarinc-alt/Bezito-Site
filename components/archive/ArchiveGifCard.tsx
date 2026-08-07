'use client'

/**
 * ArchiveGifCard — one GIF tile in the hand-built masonry grid.
 *
 * Fixed portrait 3:4 frame (uniform rhythm). Because height is known up front,
 * the grid's round-robin column distribution stays balanced without measuring
 * each image.
 *
 * Lazy-load / pause: an IntersectionObserver per card toggles the GIF <img>
 * vs a light placeholder, so off-screen GIFs stop animating and free memory.
 */

import { useEffect, useRef, useState } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ArchiveGifCard.module.css'

interface Props {
  entry: ArchiveEntry
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
