'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './CinematicCarousel.module.css'

interface Props {
  products: Product[]
  category: string
}

export default function CinematicCarousel({ products, category }: Props) {
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const total = products.length

  const go = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(next, total - 1))),
    [total],
  )

  // Active + both neighbours play (muted) so the blurred prev/next peeks show a
  // live frame, not a black paused video. Off-screen slides are paused + reset.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (Math.abs(i - index) <= 1) {
        v.play().catch(() => {})
      } else {
        v.pause()
        v.currentTime = 0
      }
    })
  }, [index])

  if (total === 0) return null

  const current = products[index]

  return (
    <div className={styles.section}>
      <section className={styles.stage}>
        <div className={styles.track}>
          {products.map((p, i) => {
            const offset = i - index
            const isActive = offset === 0
            const isNeighbour = Math.abs(offset) === 1
            const isVisible = Math.abs(offset) <= 1
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl

            return (
              <div
                key={p.sku}
                className={styles.slide}
                style={{
                  // Coverflow: slide is centered on left:50% via -50%, then each
                  // neighbour is pushed out ~68% of its own width so its CENTER
                  // (the piece itself) peeks into the stage — not just a black edge.
                  transform: `translateX(calc(-50% + ${offset * 68}%)) scale(${isActive ? 1 : 0.84})`,
                  filter: isActive ? 'none' : 'blur(6px)',
                  opacity: isActive ? 1 : isNeighbour ? 0.7 : 0,
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
                aria-hidden={!isActive}
              >
                <div className={styles.media}>
                  {video ? (
                    <video
                      ref={(el) => { videoRefs.current[i] = el }}
                      src={isVisible ? video : undefined}
                      poster={image ?? undefined}
                      muted
                      loop
                      playsInline
                      autoPlay={isVisible}
                      preload={isVisible ? 'auto' : 'none'}
                    />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={p.name} />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.scrim} />

        <div className={styles.caption}>
          <Link href={`/jewelry/${category}/${current.slug}`} className={styles.captionLink}>
            <p className={styles.ref}>ref. {current.sku}</p>
            <h2 className={styles.name}>{current.name}</h2>
            {current.specs.subtitle && <p className={styles.sub}>{current.specs.subtitle}</p>}
            <span className={styles.cta}>View Piece →</span>
          </Link>
        </div>

        {index > 0 && (
          <button
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => go(index - 1)}
            aria-label="Previous piece"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="1.25"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {index < total - 1 && (
          <button
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => go(index + 1)}
            aria-label="Next piece"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 5 L16 12 L9 19" stroke="currentColor" strokeWidth="1.25"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </section>
    </div>
  )
}
