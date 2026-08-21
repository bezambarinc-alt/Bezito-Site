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
  const total = products.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  const videoRefs    = useRef<(HTMLVideoElement | null)[]>([])
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // Play active + both neighbours so blurred flanks show live frames.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (Math.abs(circOffset(i)) <= 1) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index, circOffset])

  // ── Mobile scroll-lock state ───────────────────────────────────────────────
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileStackRef  = useRef<HTMLDivElement>(null)
  const mobileSlideRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileVideoRefs    = useRef<(HTMLVideoElement | null)[]>([])
  const mobileTextTopRef   = useRef<HTMLDivElement>(null)
  const mobileTextBottomRef = useRef<HTMLDivElement>(null)

  // Scroll-driven rAF — drives 50%-height slide transforms directly.
  // Each slide is 50% of the pin height. translateY(calc(offset×100% + 50%)) means:
  //   offset -1 → translateY(-50%)  → slide occupies -25% to +25% of pin → top 25% peeks
  //   offset  0 → translateY(+50%)  → slide occupies +25% to +75% of pin → active zone
  //   offset +1 → translateY(+150%) → slide occupies +75% to +125% of pin → bottom 25% peeks
  // Slides never overlap → no z-index tricks needed. Blur overlays sit at top/bottom 25%.
  // Text overlays are also rAF-driven: they exit outward during transition.
  useEffect(() => {
    const stack = mobileStackRef.current
    if (!stack || total <= 1) return

    const mq = window.matchMedia('(max-width: 768px)')
    if (!mq.matches) return

    let ticking = false

    const update = () => {
      ticking = false
      const rect        = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) return
      const progress    = Math.max(0, Math.min(1, -rect.top / scrollRange))
      const fracRaw     = progress * (total - 1)
      // Smoothstep per segment: active positions get extra dwell, transition is faster in middle
      const segFloor    = Math.floor(fracRaw)
      const local       = fracRaw - segFloor
      const eased       = local * local * (3 - 2 * local)
      const fracIndex   = segFloor + eased
      const rounded     = Math.round(fracIndex)

      mobileSlideRefs.current.forEach((slide, i) => {
        if (!slide) return
        const offset = i - fracIndex
        slide.style.transform = `translateY(calc(${offset * 100}% + 50%))`
      })

      // exitFactor: 0 at rest, 1 at midpoint (content snaps at 1, text is off-screen)
      const exitFactor = Math.min(1, Math.abs(fracIndex - rounded) * 2)
      const opacity    = String(Math.max(0, 1 - exitFactor * 1.5))
      const topText    = mobileTextTopRef.current
      const botText    = mobileTextBottomRef.current
      if (topText) {
        topText.style.transform = `translateY(${-exitFactor * 120}%)`
        topText.style.opacity   = opacity
      }
      if (botText) {
        botText.style.transform = `translateY(${exitFactor * 120}%)`
        botText.style.opacity   = opacity
      }

      setMobileIndex(prev => prev !== rounded ? rounded : prev)
    }

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update) }
    }

    requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [total])

  // Play/pause mobile videos on index change
  useEffect(() => {
    mobileVideoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === mobileIndex) v.play().catch(() => {})
      else v.pause()
    })
  }, [mobileIndex])

  if (total === 0) return null

  const current       = products[index]
  const mobileCurrent = products[mobileIndex]

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
                    transform: `translateX(calc(-50% + ${offset * 102}%))`,
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
                <h2 className={styles.name}>{current.name}</h2>
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

      {/* ── Mobile scroll-lock vertical stack (hidden on desktop) ──────── */}
      <div
        ref={mobileStackRef}
        className={styles.mobileStack}
        style={{ height: `calc(${total} * 100dvh)` }}
      >
        <div className={styles.mobilePin}>

          {/* Full-height video slides — scroll behind the blur overlays */}
          {products.map((p, i) => {
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl
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
                    preload={i === 0 ? 'auto' : 'none'}
                  />
                ) : image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={p.name} />
                ) : null}
              </div>
            )
          })}

          {/* Frosted glass overlays — fixed to pin, videos scroll beneath them */}
          <div className={styles.mobileBlurTop}    aria-hidden />
          <div className={styles.mobileBlurBottom} aria-hidden />

          {/* Identity text — above the blur, exits outward on transition via rAF */}
          <div ref={mobileTextTopRef} className={styles.mobileTextTop}>
            <Link href={`/jewelry/${category}/${mobileCurrent.slug}`} className={styles.captionLink}>
              <p className={styles.ref}>ref. {mobileCurrent.sku}</p>
              <h2 className={styles.name}>{mobileCurrent.name}</h2>
              {mobileCurrent.specs.subtitle && (
                <p className={styles.sub}>{mobileCurrent.specs.subtitle}</p>
              )}
              <span className={styles.cta}>View Piece →</span>
            </Link>
          </div>

          {/* Lede text — above the blur at bottom, exits outward on transition via rAF */}
          {mobileCurrent.specs.lede && (
            <div ref={mobileTextBottomRef} className={styles.mobileTextBottom}>
              <p className={styles.lede}>{mobileCurrent.specs.lede}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
