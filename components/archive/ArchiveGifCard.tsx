'use client'

/**
 * ArchiveGifCard — one GIF tile in the masonry grid.
 *
 * Lazy load + pause strategy:
 *   - A single IntersectionObserver per card (rootMargin: 400px) tracks visibility.
 *   - When inView → true: render <img src={gifUrl}> — GIF loads & plays.
 *   - When inView → false: render placeholder <div> — GIF unmounts, stops animating,
 *     memory is freed.
 *   - Card height is governed by the parent aspect-ratio CSS class, NOT the img,
 *     so masonry layout never shifts regardless of visibility state.
 *
 * 562 observers is well within browser limits and is the cleanest React pattern
 * for this use case (no external library needed).
 */

import { useEffect, useRef, useState } from 'react'
import type { ArchiveEntry, CardSize } from '@/lib/data/archive-constants'
import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ArchiveGifCard.module.css'

interface Props {
  entry: ArchiveEntry
  size: CardSize
}

export default function ArchiveGifCard({ entry, size }: Props) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const [inView, setInView] = useState(false)
  const { openArchiveDrawer } = useDrawers()

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <button
      ref={cardRef}
      className={`${styles.card} ${styles[size]}`}
      onClick={() =>
        openArchiveDrawer({
          title:  entry.title,
          sku:    entry.sku,
          mp4Url: entry.mp4Url,
        })
      }
      aria-label={`View ${entry.title}`}
    >
      {/* Media area — always same height via aspect-ratio on .card */}
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

      {/* Play icon — visible on hover */}
      <span className={styles.playIcon} aria-hidden>
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      </span>

      {/* Caption gradient — visible on hover */}
      <span className={styles.caption}>{entry.title}</span>
    </button>
  )
}
