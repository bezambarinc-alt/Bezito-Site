'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './CinematicCarousel.module.css'
import { parseProductName } from '@/lib/product-name'

interface Props {
  products: Product[]
  category: string
}

const AUTOSCROLL_MS = 5000

export default function CinematicCarousel({ products, category }: Props) {
  const total = products.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (total <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((prev) => ((prev + 1) % total))
    }, AUTOSCROLL_MS)
  }, [total])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (Math.abs(circOffset(i)) <= 1) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index, circOffset])

  // ── Mobile state ───────────────────────────────────────────────────────────
  // CSS scroll-snap-type handles all snap/advance — no JS scroll driver.
  // IntersectionObserver tracks which slide is active for play/pause + dots.
  const [mobileIndex, setMobileIndex]   = useState(0)
  const mobilePinRef    = useRef<HTMLDivElement>(null)
  const mobileSlideRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const pin = mobilePinRef.current
    if (!pin) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = mobileSlideRefs.current.indexOf(entry.target as HTMLDivElement)
          if (idx !== -1) setMobileIndex(idx)
        }
      },
      { root: pin, threshold: 0.5 },
    )

    mobileSlideRefs.current.forEach((s) => { if (s) io.observe(s) })
    return () => io.disconnect()
  }, [total])

  useEffect(() => {
    mobileVideoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === mobileIndex) v.play().catch(() => {})
      else v.pause()
    })
  }, [mobileIndex])

  if (total === 0) return null

  const current       = products[index]
  const currentParsed = parseProductName(current.name)

  const handleManual = (next: number) => { resetTimer(); go(next) }

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
        <section className={styles.stage}>
          <div className={styles.track}>
            {products.map((p, i) => {
              const offset      = circOffset(i)
              const isActive    = offset === 0
              const isNeighbour = Math.abs(offset) === 1
              const isLoaded    = Math.abs(offset) <= 2
              const video = p.specs.heroVideoUrl
              const image = p.specs.heroPosterUrl
              return (
                <div
                  key={p.sku}
                  className={styles.slide}
                  style={{
                    transform:     `translateX(calc(-50% + ${offset * 102}%))`,
                    filter:        isActive ? 'none' : 'blur(18px)',
                    opacity:       isActive ? 1 : isNeighbour ? 0.6 : 0,
                    zIndex:        isActive ? 2 : 1,
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
                        muted loop playsInline
                        autoPlay={Math.abs(offset) <= 1}
                        preload={Math.abs(offset) <= 1 ? 'auto' : isLoaded ? 'metadata' : 'none'}
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

          {/* Left peek panel — identity + CTA */}
          {total > 1 && (
            <div className={styles.prevOverlay}>
              <Link href={`/jewelry/${category}/${current.slug}`} className={styles.captionLink}>
                <p className={styles.ref}>ref. {current.sku}</p>
                <h2 className={styles.name}>{currentParsed.title}</h2>
                {currentParsed.variant && <p className={styles.sub}>{currentParsed.variant}</p>}
                {current.specs.subtitle && <p className={styles.sub}>{current.specs.subtitle}</p>}
                <span className={styles.cta}>View Piece →</span>
              </Link>
            </div>
          )}

          {/* Right peek panel — editorial lede */}
          {total > 1 && current.specs.lede && (
            <div className={styles.nextOverlay}>
              <p className={styles.lede}>{current.specs.lede}</p>
            </div>
          )}

          {/* Arrows */}
          {total > 1 && (
            <>
              <button className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={() => handleManual(index - 1)} aria-label="Previous piece">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="1.25"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={() => handleManual(index + 1)} aria-label="Next piece">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M9 5 L16 12 L9 19" stroke="currentColor" strokeWidth="1.25"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </section>
      </div>

      {/* ── Mobile CSS-snap vertical reel (hidden on desktop) ──────────── */}
      <div className={styles.mobileStack}>
        {/* Scroll container — scroll-snap-type + scroll-snap-stop: always
            gives native one-product-per-swipe; no JS scroll driver needed. */}
        <div ref={mobilePinRef} className={styles.mobilePin}>
          {products.map((p, i) => {
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl
            const { title: pTitle, variant: pVariant } = parseProductName(p.name)
            return (
              <div
                key={p.sku}
                ref={(el) => { mobileSlideRefs.current[i] = el }}
                className={styles.mobileSlide}
              >
                {video ? (
                  <video
                    ref={(el) => { mobileVideoRefs.current[i] = el }}
                    src={video}
                    poster={image ?? undefined}
                    muted loop playsInline
                    autoPlay={i === 0}
                    preload={i === 0 ? 'auto' : 'metadata'}
                    className={styles.mobileVideo}
                  />
                ) : image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={pTitle} className={styles.mobileVideo} />
                ) : null}

                {/* Gradient scrim — top + bottom */}
                <div className={styles.mobileGradient} aria-hidden />

                {/* Product identity — top of slide */}
                <div className={styles.mobileTextTop}>
                  <Link href={`/jewelry/${category}/${p.slug}`} className={styles.captionLink}>
                    <p className={styles.ref}>ref. {p.sku}</p>
                    <h2 className={styles.name}>{pTitle}</h2>
                    {pVariant && <p className={styles.sub}>{pVariant}</p>}
                    {p.specs.subtitle && <p className={styles.sub}>{p.specs.subtitle}</p>}
                    <span className={styles.cta}>View Piece →</span>
                  </Link>
                </div>

                {/* Editorial lede — bottom of slide */}
                {p.specs.lede && (
                  <div className={styles.mobileTextBottom}>
                    <p className={styles.lede}>{p.specs.lede}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress dots — sibling to scroll container so they never scroll away */}
        {total > 1 && (
          <div className={styles.mobileDots} aria-hidden>
            {products.map((_, i) => (
              <span
                key={i}
                className={`${styles.mobileDot} ${i === mobileIndex ? styles.mobileDotActive : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
