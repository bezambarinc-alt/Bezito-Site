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
  // Stack height in pixels — avoids dvh/vh calc issues in iOS Safari inline styles.
  // SSR gets a vh fallback; after mount we measure the real innerHeight and update.
  const [stackHeight, setStackHeight] = useState<string | null>(null)
  const mobileStackRef      = useRef<HTMLDivElement>(null)
  const mobileSlideRefs     = useRef<(HTMLDivElement | null)[]>([])
  const mobileVideoRefs     = useRef<(HTMLVideoElement | null)[]>([])
  const mobileTextBottomRef = useRef<HTMLDivElement>(null)
  // isSnappingRef shared between scroll driver and touch effect to prevent double-snap
  const isSnappingRef   = useRef(false)
  // mobileActiveRef tracks the currently-playing video index without going through React state
  const mobileActiveRef = useRef(0)
  // playPromisesRef stores in-flight play() promises so we can await them before pausing
  const playPromisesRef = useRef<Promise<void>[]>([])

  // Stack height in px — avoids dvh/vh calc issues in iOS Safari inline styles.
  // SSR gets a vh fallback; after mount we measure real innerHeight.
  useEffect(() => {
    const update = () => setStackHeight(`${window.innerHeight * total}px`)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [total])

  useEffect(() => {
    if (total <= 1) return

    const mq = window.matchMedia('(max-width: 768px)')

    let ticking  = false
    let attached = false
    let rafId    = 0
    let snapTimer: ReturnType<typeof setTimeout> | null = null

    // Activate a video at the given index: pause the previous (safely), play the new one.
    // Driven directly from rAF so video state never lags behind scroll position.
    const activateVideo = (idx: number) => {
      const prev = mobileActiveRef.current
      if (idx === prev) return
      mobileActiveRef.current = idx
      // Pause previous — if its play() promise is still pending, wait for it first
      if (prev >= 0) {
        const pv = mobileVideoRefs.current[prev]
        if (pv) {
          const pending = playPromisesRef.current[prev]
          if (pending !== undefined) {
            pending.then(() => { if (mobileActiveRef.current !== prev) pv.pause() }).catch(() => {})
            playPromisesRef.current[prev] = undefined as unknown as Promise<void>
          } else if (!pv.paused) {
            pv.pause()
          }
        }
      }
      // Play new
      const nv = mobileVideoRefs.current[idx]
      if (nv) {
        const p = nv.play()
        playPromisesRef.current[idx] = p
        p.catch(() => { playPromisesRef.current[idx] = undefined as unknown as Promise<void> })
      }
    }

    const update = () => {
      ticking = false
      const stack = mobileStackRef.current
      if (!stack) return
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
        slide.style.transform = `translateY(${offset * 100}%)`
      })

      // exitFactor: 0 at rest, 1 at midpoint (content snaps at 1, text is off-screen)
      const exitFactor = Math.min(1, Math.abs(fracIndex - rounded) * 2)
      const opacity    = String(Math.max(0, 1 - exitFactor * 1.5))
      const botText    = mobileTextBottomRef.current
      if (botText) {
        botText.style.transform = `translateY(${exitFactor * 120}%)`
        botText.style.opacity   = opacity
      }

      activateVideo(rounded)
      setMobileIndex(prev => prev !== rounded ? rounded : prev)
    }

    const snapToNearest = () => {
      if (isSnappingRef.current) return
      const stack = mobileStackRef.current
      if (!stack) return
      const rect = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) return
      const rawProgress = -rect.top / scrollRange
      if (rawProgress < 0 || rawProgress > 1) return
      const nearest = Math.max(0, Math.min(total - 1, Math.round(rawProgress * (total - 1))))
      if (Math.abs(rawProgress * (total - 1) - nearest) < 0.02) return
      isSnappingRef.current = true
      const targetY = window.scrollY + rect.top + (nearest / (total - 1)) * scrollRange
      window.scrollTo({ top: targetY, behavior: 'smooth' })
      setTimeout(() => { isSnappingRef.current = false }, 600)
    }

    const onScrollEnd = () => { isSnappingRef.current = false; snapToNearest() }

    const onScroll = () => {
      if (!ticking) { ticking = true; rafId = requestAnimationFrame(update) }
      if (!isSnappingRef.current) {
        if (snapTimer) clearTimeout(snapTimer)
        snapTimer = setTimeout(snapToNearest, 100)
      }
    }

    // Attach/detach on breakpoint changes so a desktop→mobile resize (or an
    // orientation change) still wires up the scroll driver.
    const attach = () => {
      if (attached || !mq.matches) return
      attached = true
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('scrollend', onScrollEnd, { passive: true })
      rafId = requestAnimationFrame(update)
    }

    const detach = () => {
      if (!attached) return
      attached = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      cancelAnimationFrame(rafId)
      if (snapTimer) clearTimeout(snapTimer)
      ticking = false
      isSnappingRef.current = false
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) attach()
      else detach()
    }

    mq.addEventListener('change', handleChange)
    attach()

    return () => {
      mq.removeEventListener('change', handleChange)
      detach()
    }
  }, [total])

  // Touch interception — prevents iOS momentum from skipping multiple products.
  // Intercepts touchmove (non-passive) to cap scroll to ±1 slide per gesture,
  // then on touchend snaps to exactly the next/prev/current product.
  useEffect(() => {
    if (total <= 1) return
    const stack = mobileStackRef.current
    if (!stack) return

    let startY        = 0
    let startScrollY  = 0
    let startActive   = 0
    let slideRange    = 0
    let gestureActive = false

    const getNearestIndex = () => {
      const rect = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) return 0
      const progress = Math.max(0, Math.min(1, -rect.top / scrollRange))
      return Math.round(progress * (total - 1))
    }

    let snapEndTimer: ReturnType<typeof setTimeout> | null = null

    const snapTo = (idx: number) => {
      const rect = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) return
      window.scrollTo({ top: window.scrollY + rect.top + (idx / (total - 1)) * scrollRange, behavior: 'smooth' })
      // Activate video immediately — don't wait for the React state cycle
      const nv = mobileVideoRefs.current[idx]
      if (nv) {
        const prev = mobileActiveRef.current
        mobileActiveRef.current = idx
        if (prev >= 0 && prev !== idx) mobileVideoRefs.current[prev]?.pause()
        const p = nv.play()
        playPromisesRef.current[idx] = p
        p.catch(() => { playPromisesRef.current[idx] = undefined as unknown as Promise<void> })
      }
    }

    const onStart = (e: TouchEvent) => {
      // Clear any pending snap so a new gesture always gets a clean state
      isSnappingRef.current = false
      if (snapEndTimer) { clearTimeout(snapEndTimer); snapEndTimer = null }
      const rect = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) { gestureActive = false; return }
      const scrolled = -rect.top
      // Only intercept when we're actually scrolling through the carousel
      if (scrolled < -20 || scrolled > scrollRange + 20) { gestureActive = false; return }
      gestureActive = true
      startY       = e.touches[0].clientY
      startScrollY = window.scrollY
      startActive  = getNearestIndex()
      slideRange   = scrollRange / (total - 1)
    }

    const onMove = (e: TouchEvent) => {
      if (!gestureActive) return
      e.preventDefault()
      const dy     = startY - e.touches[0].clientY
      const capped = Math.max(-slideRange * 0.9, Math.min(slideRange * 0.9, dy))
      window.scrollTo(0, startScrollY + capped)
    }

    const onEnd = (e: TouchEvent) => {
      if (!gestureActive) return
      gestureActive = false
      // Suppress the scroll driver's auto-snap while our gesture snap completes
      isSnappingRef.current = true
      if (snapEndTimer) clearTimeout(snapEndTimer)
      snapEndTimer = setTimeout(() => { isSnappingRef.current = false; snapEndTimer = null }, 600)
      const dy = startY - e.changedTouches[0].clientY
      if (dy > 30)       snapTo(Math.min(total - 1, startActive + 1))
      else if (dy < -30) snapTo(Math.max(0, startActive - 1))
      else               snapTo(startActive)
    }

    stack.addEventListener('touchstart', onStart, { passive: true })
    stack.addEventListener('touchmove',  onMove,  { passive: false })
    stack.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      stack.removeEventListener('touchstart', onStart)
      stack.removeEventListener('touchmove',  onMove)
      stack.removeEventListener('touchend',   onEnd)
      if (snapEndTimer) clearTimeout(snapEndTimer)
    }
  }, [total])

  if (total === 0) return null

  const current             = products[index]
  const mobileCurrent       = products[mobileIndex]
  const currentParsed       = parseProductName(current.name)
  const mobileCurrentParsed = parseProductName(mobileCurrent.name)

  const handleManual = (next: number) => { resetTimer(); go(next) }

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
        <section className={styles.stage} aria-label="Featured pieces" aria-roledescription="carousel">
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
                <h2 className={styles.name}>{currentParsed.title}</h2>
                {(currentParsed.variant ?? current.specs.subtitle) && (
                  <p className={styles.sub}>{currentParsed.variant ?? current.specs.subtitle}</p>
                )}
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
        style={{ height: stackHeight ?? `calc(${total} * 100vh)` }}
      >
        <div className={styles.mobilePin}>

          {/* Full-height video slides — scroll behind the blur overlays */}
          {products.map((p, i) => {
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl
            const { title: pTitle } = parseProductName(p.name)
            return (
              <div
                key={p.sku}
                ref={(el) => { mobileSlideRefs.current[i] = el }}
                className={styles.mobileSlide}
              >
                <Link href={`/jewelry/${category}/${p.slug}`} className={styles.slideLink} tabIndex={-1} aria-hidden="true">
                  {video ? (
                    <video
                      ref={(el) => { mobileVideoRefs.current[i] = el }}
                      src={video}
                      poster={image ?? undefined}
                      muted loop playsInline
                      autoPlay={i === 0}
                      preload={i === 0 ? 'auto' : 'metadata'}
                    />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={pTitle} />
                  ) : null}
                </Link>
              </div>
            )
          })}

          {/* Frosted glass overlay — bottom 25% blurs next product peeking through */}
          <div className={styles.mobileBlurBottom} aria-hidden />

          {/* Scroll position indicator */}
          {total > 1 && (
            <div className={styles.mobileDots} aria-hidden>
              {products.map((p, i) => (
                <span
                  key={p.sku}
                  className={`${styles.mobileDot} ${i === mobileIndex ? styles.mobileDotActive : ''}`}
                />
              ))}
            </div>
          )}

          {/* Identity text — sits over bottom blur, exits down on transition via rAF */}
          <div ref={mobileTextBottomRef} className={styles.mobileTextBottom}>
            <Link href={`/jewelry/${category}/${mobileCurrent.slug}`} className={styles.captionLink}>
              <p className={styles.ref}>ref. {mobileCurrent.sku}</p>
              <h2 className={styles.name}>{mobileCurrentParsed.title}</h2>
              {(mobileCurrentParsed.variant ?? mobileCurrent.specs.subtitle) && (
                <p className={styles.sub}>{mobileCurrentParsed.variant ?? mobileCurrent.specs.subtitle}</p>
              )}
              <span className={styles.cta}>View Piece →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
