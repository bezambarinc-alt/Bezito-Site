'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveFilterRow from './ArchiveFilterRow'
import styles from './ArchiveCarousel.module.css'

interface Props {
  entries:         ArchiveEntry[]
  onOpen:          (slug: string) => void
  cat:             string
  shape:           string
  color:           string
  onFilterChange:  (cat: string, shape: string, color: string) => void
  availableCats:   Set<string>
  availableShapes: Set<string>
  availableColors: Set<string>
}

// Virtual window sizes — only this many slide DOM nodes exist at a time
const DESK_WIN   = 2  // ±2 around active → ≤5 nodes on desktop
const MOBILE_WIN = 1  // ±1 around active → ≤3 nodes on mobile

export default function ArchiveCarousel({
  entries, onOpen,
  cat, shape, color, onFilterChange,
  availableCats, availableShapes, availableColors,
}: Props) {
  const total = entries.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  // Slot-indexed: slotIdx 0 = offset -DESK_WIN … slotIdx DESK_WIN = active
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  )

  // offset = slotIdx - DESK_WIN; play active + neighbours, pause the rest
  useEffect(() => {
    videoRefs.current.forEach((v, slotIdx) => {
      if (!v) return
      const offset = slotIdx - DESK_WIN
      if (Math.abs(offset) <= 1) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index])

  // ── Mobile scroll-lock state ───────────────────────────────────────────────
  const [mobileIndex, setMobileIndex] = useState(0)
  const [stackHeight, setStackHeight] = useState<string | null>(null)
  const mobileStackRef      = useRef<HTMLDivElement>(null)
  const mobileSlideRefs     = useRef<(HTMLDivElement | null)[]>([])    // slot-indexed, ≤3
  const mobileVideoRefs     = useRef<(HTMLVideoElement | null)[]>([])  // slot-indexed, ≤3
  const mobileTextBottomRef = useRef<HTMLDivElement>(null)
  const isSnappingRef       = useRef(false)
  const mobileActiveRef     = useRef(0)
  const playPromisesRef     = useRef<Promise<void>[]>([])              // slot-indexed, ≤3
  // Tracks which entry index occupies each mobile slot so scroll/touch closures
  // can compute transforms and locate video refs without going through React state.
  const mobileWindowRef     = useRef<number[]>([])

  const handleFilterChange = useCallback(
    (nextCat: string, nextShape: string, nextColor: string) => {
      setIndex(0)
      setMobileIndex(0)
      videoRefs.current       = []
      mobileVideoRefs.current = []
      mobileActiveRef.current = 0
      playPromisesRef.current = []
      if (typeof window !== 'undefined') {
        const stackTop = mobileStackRef.current?.getBoundingClientRect().top ?? 0
        if (stackTop < 0) window.scrollTo({ top: window.scrollY + stackTop, behavior: 'auto' })
      }
      onFilterChange(nextCat, nextShape, nextColor)
    },
    [onFilterChange],
  )

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

    // idx is entry index — look up slot via mobileWindowRef to reach video ref
    const activateVideo = (idx: number) => {
      const prev = mobileActiveRef.current
      if (idx === prev) return
      mobileActiveRef.current = idx

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
      const progress  = Math.max(0, Math.min(1, -rect.top / scrollRange))
      const fracRaw   = progress * (total - 1)
      const segFloor  = Math.floor(fracRaw)
      const local     = fracRaw - segFloor
      const eased     = local * local * (3 - 2 * local)
      const fracIndex = segFloor + eased
      const rounded   = Math.round(fracIndex)

      // Each slot's transform is derived from its actual entry index vs fracIndex
      mobileSlideRefs.current.forEach((slide, slotIdx) => {
        if (!slide) return
        const entryIdx = mobileWindowRef.current[slotIdx]
        if (entryIdx === undefined) return
        const offset = entryIdx - fracIndex
        slide.style.transform = `translateY(calc(${offset * 100}% + 50%))`
      })

      const exitFactor = Math.min(1, Math.abs(fracIndex - rounded) * 2)
      const botText    = mobileTextBottomRef.current
      if (botText) {
        botText.style.transform = `translateY(${exitFactor * 120}%)`
        botText.style.opacity   = String(Math.max(0, 1 - exitFactor * 1.5))
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

  // Touch interception — prevents iOS momentum from skipping multiple entries.
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
      isSnappingRef.current = false
      if (snapEndTimer) { clearTimeout(snapEndTimer); snapEndTimer = null }
      const rect = stack.getBoundingClientRect()
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) { gestureActive = false; return }
      const scrolled = -rect.top
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

  if (total === 0) {
    return <div className={styles.empty}>No pieces match the current filters.</div>
  }

  const safeIndex       = Math.min(index, total - 1)
  const safeMobileIndex = Math.min(mobileIndex, total - 1)
  const current         = entries[safeIndex]
  const mobileCurrent   = entries[safeMobileIndex]

  // ── Desktop virtual window: ≤5 slides, circular, deduped for tiny totals ───
  const desktopSlots: { entryIdx: number; offset: number }[] = []
  {
    const seen = new Set<number>()
    for (let o = -DESK_WIN; o <= DESK_WIN; o++) {
      const entryIdx = ((safeIndex + o) % total + total) % total
      if (!seen.has(entryIdx)) {
        seen.add(entryIdx)
        desktopSlots.push({ entryIdx, offset: o })
      }
    }
  }

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
  mobileWindowRef.current = mobileWindow
  const mobileActiveSlot  = mobileWindow.indexOf(safeMobileIndex)

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
        <ArchiveFilterRow
          cat={cat} shape={shape} color={color} onFilterChange={handleFilterChange}
          availableCats={availableCats} availableShapes={availableShapes} availableColors={availableColors}
        />

        <section className={styles.stage} aria-label="The Archive" aria-roledescription="carousel">
          <div className={styles.track}>
            {desktopSlots.map(({ entryIdx, offset }, slotIdx) => {
              const e           = entries[entryIdx]
              const isActive    = offset === 0
              const isNeighbour = Math.abs(offset) === 1

              return (
                <div
                  key={e.slug}
                  className={styles.slide}
                  style={{
                    transform:     `translateX(calc(-50% + ${offset * 102}%))`,
                    filter:        isActive ? 'none' : 'blur(18px)',
                    opacity:       isActive ? 1 : isNeighbour ? 0.55 : 0,
                    zIndex:        isActive ? 2 : 1,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                  aria-hidden={!isActive}
                >
                  <div className={styles.media}>
                    {e.mp4Url ? (
                      <video
                        ref={(el) => { videoRefs.current[slotIdx] = el }}
                        src={e.mp4Url}
                        muted loop playsInline
                        autoPlay={isActive || isNeighbour}
                        preload={isActive || isNeighbour ? 'auto' : 'metadata'}
                      />
                    ) : (
                      <div className={styles.placeholder} />
                    )}
                  </div>

                  {isActive && (
                    <button
                      className={styles.slideBtn}
                      onClick={() => onOpen(e.slug)}
                      aria-label={`View ${e.title}`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {total > 1 && (
            <div className={styles.prevOverlay}>
              <div className={styles.captionGroup}>
                <p className={styles.ref}>ref. {current.sku}</p>
                <h2 className={styles.name}>{current.title}</h2>
                <button className={styles.cta} onClick={() => onOpen(current.slug)}>
                  View Piece →
                </button>
              </div>
            </div>
          )}

          {total > 1 && (
            <>
              <button className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={() => go(index - 1)} aria-label="Previous piece">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="1.25"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={() => go(index + 1)} aria-label="Next piece">
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

          {mobileWindow.map((entryIdx, slotIdx) => {
            const e = entries[entryIdx]
            return (
              <div
                key={e.slug}
                ref={(el) => { mobileSlideRefs.current[slotIdx] = el }}
                className={styles.mobileSlide}
                onClick={() => { if (entryIdx === safeMobileIndex) onOpen(e.slug) }}
                role={entryIdx === safeMobileIndex ? 'button' : undefined}
                aria-label={entryIdx === safeMobileIndex ? `View ${e.title}` : undefined}
              >
                {e.mp4Url ? (
                  <video
                    ref={(el) => { mobileVideoRefs.current[slotIdx] = el }}
                    src={e.mp4Url}
                    muted loop playsInline
                    autoPlay={slotIdx === mobileActiveSlot}
                    preload={slotIdx === mobileActiveSlot ? 'auto' : 'metadata'}
                  />
                ) : (
                  <div className={styles.mobilePlaceholder} />
                )}
              </div>
            )
          })}

          <div className={styles.mobileFilterZone}>
            <ArchiveFilterRow
              cat={cat} shape={shape} color={color} onFilterChange={handleFilterChange}
              availableCats={availableCats} availableShapes={availableShapes} availableColors={availableColors}
              dark
            />
          </div>

          <div className={styles.mobileBlurBottom} aria-hidden />

          <div ref={mobileTextBottomRef} className={styles.mobileTextBottom}>
            <p className={styles.mobileName}>{mobileCurrent.title}</p>
            <button
              className={styles.mobileCta}
              onClick={() => onOpen(mobileCurrent.slug)}
            >
              View Piece →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
