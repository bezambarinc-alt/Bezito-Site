'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './CinematicCarousel.module.css'

interface Props {
  products: Product[]
  category: string
}

const AUTOSCROLL_MS = 5000

export default function CinematicCarousel({ products, category }: Props) {
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total = products.length

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  )

  const circOffset = useCallback(
    (i: number) => {
      let o = i - index
      if (o > total / 2) o -= total
      else if (o < -total / 2) o += total
      return o
    },
    [index, total],
  )

  // Reset and restart the autoscroll timer. Call on manual navigation so the
  // timer doesn't fire immediately after a user-initiated advance.
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (total <= 1) return
    timerRef.current = setTimeout(() => {
      setIndex((prev) => ((prev + 1) % total))
    }, AUTOSCROLL_MS)
  }, [total])

  // Start autoscroll on mount; restart whenever index changes.
  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [index, resetTimer])

  // Active + both neighbours play so the blurred flanks show live frames.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (Math.abs(circOffset(i)) <= 1) {
        v.play().catch(() => {})
      } else {
        v.pause()
        v.currentTime = 0
      }
    })
  }, [index, circOffset])

  if (total === 0) return null

  const current = products[index]

  const handleManual = (next: number) => {
    resetTimer()
    go(next)
  }

  return (
    <div className={styles.section}>
      <section className={styles.stage}>
        <div className={styles.track}>
          {products.map((p, i) => {
            const offset = circOffset(i)
            const isActive = offset === 0
            const isNeighbour = Math.abs(offset) === 1
            const isPlaying = Math.abs(offset) <= 1
            const isLoaded = Math.abs(offset) <= 2
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl

            return (
              <div
                key={p.sku}
                className={styles.slide}
                style={{
                  transform: `translateX(calc(-50% + ${offset * 102}%))`,
                  filter: isActive ? 'none' : 'blur(18px)',
                  opacity: isActive ? 1 : isNeighbour ? 0.6 : 0,
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
                aria-hidden={!isActive}
              >
                <div className={styles.media}>
                  {video ? (
                    <video
                      ref={(el) => { videoRefs.current[i] = el }}
                      src={isLoaded ? video : undefined}
                      poster={image ?? undefined}
                      muted
                      loop
                      playsInline
                      autoPlay={isPlaying}
                      preload={isPlaying ? 'auto' : isLoaded ? 'metadata' : 'none'}
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

        {/* Left peek panel — current product identity, centered in prev slot */}
        {total > 1 && (
          <div className={styles.prevOverlay}>
            <Link href={`/jewelry/${category}/${current.slug}`} className={styles.captionLink}>
              <p className={styles.ref}>ref. {current.sku}</p>
              <h2 className={styles.name}>{current.name}</h2>
              <span className={styles.cta}>View Piece →</span>
            </Link>
          </div>
        )}

        {/* Right peek panel — editorial description, centered in next slot */}
        {total > 1 && current.specs.subtitle && (
          <div className={styles.nextOverlay}>
            <p className={styles.sub}>{current.specs.subtitle}</p>
          </div>
        )}

        {total > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => handleManual(index - 1)}
              aria-label="Previous piece"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="1.25"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => handleManual(index + 1)}
              aria-label="Next piece"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 5 L16 12 L9 19" stroke="currentColor" strokeWidth="1.25"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </section>
    </div>
  )
}
