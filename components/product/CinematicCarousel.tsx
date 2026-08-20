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

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(next, total - 1)))
  }, [total])

  // Play active video, pause all others
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === index) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index])

  if (total === 0) return null

  const current = products[index]

  return (
    <div className={styles.section}>
    <section className={styles.stage}>

      {/* Slide track */}
      <div className={styles.track}>
        {products.map((p, i) => {
          const offset = i - index
          const isActive = offset === 0
          const isAdjacent = Math.abs(offset) === 1
          const isVisible = Math.abs(offset) <= 1

          const video = p.specs.heroVideoUrl
          const image = p.specs.heroPosterUrl

          return (
            <div
              key={p.sku}
              className={styles.slide}
              style={{
                transform: `translateX(${offset * 88}%)`,
                filter: isActive ? 'none' : 'blur(14px)',
                opacity: isActive ? 1 : isAdjacent ? 0.4 : 0,
                zIndex: isActive ? 2 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.75s ease, opacity 0.75s ease',
              }}
              aria-hidden={!isActive}
            >
              <div className={styles.media}>
                {video ? (
                  <video
                    ref={el => { videoRefs.current[i] = el }}
                    src={video}
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

      {/* Bottom gradient scrim */}
      <div className={styles.scrim} />

      {/* Caption — always shows active product info */}
      <div className={styles.caption}>
        <Link href={`/jewelry/${category}/${current.slug}`} className={styles.captionLink}>
          <p className={styles.ref}>ref. {current.sku}</p>
          <h2 className={styles.name}>{current.name}</h2>
          {current.specs.subtitle && (
            <p className={styles.sub}>{current.specs.subtitle}</p>
          )}
          <span className={styles.cta}>View Piece →</span>
        </Link>
      </div>

      {/* Prev arrow */}
      {index > 0 && (
        <button className={`${styles.arrow} ${styles.arrowPrev}`} onClick={() => go(index - 1)} aria-label="Previous piece">
          ‹
        </button>
      )}

      {/* Next arrow */}
      {index < total - 1 && (
        <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={() => go(index + 1)} aria-label="Next piece">
          ›
        </button>
      )}

      {/* Dot nav — vertical, right edge */}
      {total > 1 && (
        <nav className={styles.dots} aria-label="Piece navigation">
          {products.map((p, i) => (
            <button
              key={p.sku}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => go(i)}
              aria-label={`Go to ${p.name}`}
            />
          ))}
        </nav>
      )}
    </section>
    </div>
  )
}
