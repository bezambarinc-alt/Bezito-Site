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

// Virtual window sizes — only this many slide DOM nodes exist at a time.
// Categories are small today, but this keeps the carousel flat if a category
// ever grows large (future-proofing), and matches the shipped ArchiveCarousel.
const DESK_WIN   = 2  // ±2 around active → ≤5 nodes on desktop
const MOBILE_WIN = 1  // ±1 around active → ≤3 nodes on mobile

export default function CinematicCarousel({ products, category }: Props) {
  const total = products.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  // Mirrors the rendered desktopSlots so the [index] play effect knows each
  // slot's true offset (synced in render body, same pattern as mobileWindowRef).
  const desktopSlotsRef = useRef<{ entryIdx: number; offset: number }[]>([])

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
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
  // Offset read from the real rendered slot, so tiny totals (1–2 pieces) still
  // play the active slide instead of pausing a phantom-offset one.
  useEffect(() => {
    videoRefs.current.forEach((v, slotIdx) => {
      if (!v) return
      const offset = desktopSlotsRef.current[slotIdx]?.offset ?? DESK_WIN * 2
      if (Math.abs(offset) <= 1) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index])

  // ── Mobile scroll-lock state ───────────────────────────────────────────────
  const [mobileIndex, setMobileIndex] = useState(0)
  // Stack height in pixels — avoids dvh/vh calc issues in iOS Safari inline styles.
  // SSR gets a vh fallback; after mount we measure the real innerHeight and update.
  const [stackHeight, setStackHeight] = useState<string | null>(null)
  const mobileStackRef      = useRef<HTMLDivElement>(null)
  const mobileSlideRefs     = useRef<(HTMLDivElement | null)[]>([])    // slot-indexed, ≤3
  const mobileVideoRefs     = useRef<(HTMLVideoElement | null)[]>([])  // slot-indexed, ≤3
  const mobileTextBottomRef = useRef<HTMLDivElement>(null)
  // isSnappingRef shared between scroll driver and touch effect to prevent double-snap
  const isSnappingRef   = useRef(false)
  // mobileActiveRef tracks the currently-playing entry index without going through React state
  const mobileActiveRef = useRef(0)
  // playPromisesRef stores in-flight play() promises so we can await them before pausing
  const playPromisesRef = useRef<Promise<void>[]>([])                  // slot-indexed, ≤3
  // Tracks which entry index occupies each mobile slot so scroll/touch closures
  // can compute transforms and locate video refs without going through React state.
  const mobileWindowRef = useRef<number[]>([])

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

    // idx is entry index — look up slot via mobileWindowRef to reach the video ref.
    // Pause the previous (safely), play the new one. Driven directly from rAF so
    // video state never lags behind scroll position.
    const activateVideo = (idx: number) => {
      const prev = mobileActiveRef.current
      if (idx === prev) return
      mobileActiveRef.current = idx

      // Pause previous — if its play() promise is still pending, wait for it first
      const prevSlot = mobileWindowRef.current.indexOf(prev)
      if (prevSlot >= 0) {
        const pv = mobileVideoRefs.current[prevSlot]
        if (pv) {
          const pending = playPromisesRef.current[prevSlot]
          if (pending !== undefined) {
            pending.then(() => { if (mobileActiveRef.current !== prev) pv.pause() }).catch(() => {})
            playPromisesRef.current[prevSlot] = undefined as unknown as Promise<void>
          } else if (!pv.paused) {
            pv.pause()
          }
        }
      }
      // Play new
      const newSlot = mobileWindowRef.current.indexOf(idx)
      if (newSlot >= 0) {
        const nv = mobileVideoRefs.current[newSlot]
        if (nv) {
          const p = nv.play()
          playPromisesRef.current[newSlot] = p
          p.catch(() => { playPromisesRef.current[newSlot] = undefined as unknown as Promise<void> })
        }
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

      // Each slot's transform is derived from its actual entry index vs fracIndex.
      // 100% = 75% of the pin (see .mobileSlide CSS) — active fills top 75%,
      // next peeks in the bottom 25%.
      mobileSlideRefs.current.forEach((slide, slotIdx) => {
        if (!slide) return
        const entryIdx = mobileWindowRef.current[slotIdx]
        if (entryIdx === undefined) return
        const offset = entryIdx - fracIndex
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

  // Single-result mobile: the scroll driver above bails at total<=1 and never
  // sets the positioning transform, so the lone slide sits untransformed at the
  // top of the pin. Place it explicitly whenever the window collapses to one.
  useEffect(() => {
    if (total > 1) return
    const slide = mobileSlideRefs.current[0]
    if (slide) slide.style.transform = 'translateY(0%)'
    const botText = mobileTextBottomRef.current
    if (botText) { botText.style.transform = 'translateY(0)'; botText.style.opacity = '1' }
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
      const newSlot = mobileWindowRef.current.indexOf(idx)
      if (newSlot >= 0) {
        const nv = mobileVideoRefs.current[newSlot]
        if (nv) {
          const prev     = mobileActiveRef.current
          const prevSlot = mobileWindowRef.current.indexOf(prev)
          mobileActiveRef.current = idx
          if (prevSlot >= 0 && prev !== idx) mobileVideoRefs.current[prevSlot]?.pause()
          const p = nv.play()
          playPromisesRef.current[newSlot] = p
          p.catch(() => { playPromisesRef.current[newSlot] = undefined as unknown as Promise<void> })
        }
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

  const safeIndex           = Math.min(index, total - 1)
  const safeMobileIndex     = Math.min(mobileIndex, total - 1)
  const current             = products[safeIndex]
  const mobileCurrent       = products[safeMobileIndex]
  const currentParsed       = parseProductName(current.name)
  const mobileCurrentParsed = parseProductName(mobileCurrent.name)

  const handleManual = (next: number) => { resetTimer(); go(next) }

  // ── Desktop virtual window: ≤5 slides, circular, deduped for tiny totals ───
  // Cap the window at total-1 so tiny sets (1–2 pieces) never assign the active
  // entry a non-zero offset. total=1 → only o=0 (active). total=2 → o=-1,0,1
  // deduped to the active + its single neighbour, active still at 0.
  const desktopSlots: { entryIdx: number; offset: number }[] = []
  {
    const halfWin = Math.min(DESK_WIN, total - 1)
    const seen = new Set<number>()
    for (let o = -halfWin; o <= halfWin; o++) {
      const entryIdx = ((safeIndex + o) % total + total) % total
      if (!seen.has(entryIdx)) {
        seen.add(entryIdx)
        desktopSlots.push({ entryIdx, offset: o })
      }
    }
  }
  // Sync for the [index] play/pause effect — idempotent assignment safe in render.
  // eslint-disable-next-line react-hooks/refs
  desktopSlotsRef.current = desktopSlots
  // Drop trailing slots when the window shrinks, so the play effect never
  // iterates refs to unmounted videos. Slots 0..N-1 are always rewritten by the
  // map's ref callbacks below, so truncation only removes dead tail refs.
  // eslint-disable-next-line react-hooks/refs
  if (videoRefs.current.length > desktopSlots.length) videoRefs.current.length = desktopSlots.length

  // ── Mobile virtual window: ≤3 slides, linear, deduped at edges ─────────────
  const mobileWindow: number[] = []
  {
    const seen = new Set<number>()
    for (let o = -MOBILE_WIN; o <= MOBILE_WIN; o++) {
      const idx = Math.max(0, Math.min(total - 1, safeMobileIndex + o))
      if (!seen.has(idx)) { seen.add(idx); mobileWindow.push(idx) }
    }
  }
  // Sync for scroll/touch closures — idempotent assignment safe in render body
  // eslint-disable-next-line react-hooks/refs
  mobileWindowRef.current = mobileWindow
  // Same trailing-slot truncation as desktop — keeps the scroll/touch closures
  // from reaching video/slide refs left over from a wider previous window.
  /* eslint-disable react-hooks/refs */
  if (mobileSlideRefs.current.length > mobileWindow.length) mobileSlideRefs.current.length = mobileWindow.length
  if (mobileVideoRefs.current.length > mobileWindow.length) mobileVideoRefs.current.length = mobileWindow.length
  if (playPromisesRef.current.length > mobileWindow.length) playPromisesRef.current.length = mobileWindow.length
  /* eslint-enable react-hooks/refs */
  const mobileActiveSlot = mobileWindow.indexOf(safeMobileIndex)

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
        <section className={styles.stage} aria-label="Featured pieces" aria-roledescription="carousel">
          <div className={styles.track}>
            {desktopSlots.map(({ entryIdx, offset }, slotIdx) => {
              const p           = products[entryIdx]
              const isActive    = offset === 0
              const isNeighbour = Math.abs(offset) === 1
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
                        ref={(el) => { videoRefs.current[slotIdx] = el }}
                        src={video}
                        poster={image ?? undefined}
                        muted loop playsInline
                        autoPlay={isActive || isNeighbour}
                        preload={isActive || isNeighbour ? 'auto' : 'metadata'}
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
          {mobileWindow.map((entryIdx, slotIdx) => {
            const p = products[entryIdx]
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl
            const { title: pTitle } = parseProductName(p.name)
            return (
              <div
                key={p.sku}
                ref={(el) => { mobileSlideRefs.current[slotIdx] = el }}
                className={styles.mobileSlide}
              >
                <Link href={`/jewelry/${category}/${p.slug}`} className={styles.slideLink} tabIndex={-1} aria-hidden="true">
                  {video ? (
                    <video
                      ref={(el) => { mobileVideoRefs.current[slotIdx] = el }}
                      src={video}
                      poster={image ?? undefined}
                      muted loop playsInline
                      autoPlay={slotIdx === mobileActiveSlot}
                      preload={slotIdx === mobileActiveSlot ? 'auto' : 'metadata'}
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

          {/* Scroll position indicator — cheap decorative spans, one per piece */}
          {total > 1 && (
            <div className={styles.mobileDots} aria-hidden>
              {products.map((p, i) => (
                <span
                  key={p.sku}
                  className={`${styles.mobileDot} ${i === safeMobileIndex ? styles.mobileDotActive : ''}`}
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
