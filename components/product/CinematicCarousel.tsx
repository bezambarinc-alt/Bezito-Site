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

  // Active video plays; neighbours stay loaded but paused for an instant swap.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === index) {
        v.play().catch(() => {})
      } else {
        v.pause()
        if (Math.abs(i - index) > 1) v.currentTime = 0
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
                  transform: `translateX(${offset * 84}%)`,
                  filter: isActive ? 'none' : 'blur(10px)',
                  opacity: isActive ? 1 : isNeighbour ? 0.5 : 0,
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
                      autoPlay={i === 0}
                      preload={isVisible ? 'metadata' : 'none'}
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
