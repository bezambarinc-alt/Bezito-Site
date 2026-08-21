'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveFilterRow from './ArchiveFilterRow'
import styles from './ArchiveCarousel.module.css'

interface Props {
  entries:         ArchiveEntry[]
  onOpen:          (slug: string) => void
  // Filter props — rendered in carousel header
  cat:             string
  shape:           string
  color:           string
  filteredCount:   number
  totalCount:      number
  onFilterChange:  (cat: string, shape: string, color: string) => void
}

export default function ArchiveCarousel({
  entries, onOpen,
  cat, shape, color, filteredCount, totalCount, onFilterChange,
}: Props) {
  const total = entries.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

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

  // Play active + neighbours so blurred flanks show live frames
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (Math.abs(circOffset(i)) <= 1) v.play().catch(() => {})
      else { v.pause(); v.currentTime = 0 }
    })
  }, [index, circOffset])

  // ── Mobile scroll-lock state ───────────────────────────────────────────────
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileStackRef      = useRef<HTMLDivElement>(null)
  const mobileSlideRefs     = useRef<(HTMLDivElement | null)[]>([])
  const mobileVideoRefs     = useRef<(HTMLVideoElement | null)[]>([])
  const mobileTextTopRef    = useRef<HTMLDivElement>(null)

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
      const progress  = Math.max(0, Math.min(1, -rect.top / scrollRange))
      const fracRaw   = progress * (total - 1)
      const segFloor  = Math.floor(fracRaw)
      const local     = fracRaw - segFloor
      const eased     = local * local * (3 - 2 * local)
      const fracIndex = segFloor + eased
      const rounded   = Math.round(fracIndex)

      mobileSlideRefs.current.forEach((slide, i) => {
        if (!slide) return
        const offset = i - fracIndex
        slide.style.transform = `translateY(calc(${offset * 100}% + 50%))`
      })

      const exitFactor = Math.min(1, Math.abs(fracIndex - rounded) * 2)
      const topText    = mobileTextTopRef.current
      if (topText) {
        topText.style.transform = `translateY(${-exitFactor * 120}%)`
        topText.style.opacity   = String(Math.max(0, 1 - exitFactor * 1.5))
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

  if (total === 0) {
    return <div className={styles.empty}>No pieces match the current filters.</div>
  }

  const current       = entries[index]
  const mobileCurrent = entries[mobileIndex]

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
        <ArchiveFilterRow
          cat={cat} shape={shape} color={color}
          filteredCount={filteredCount} totalCount={totalCount}
          onFilterChange={onFilterChange}
        />

        <section className={styles.stage}>
          <div className={styles.track}>
            {entries.map((e, i) => {
              const offset      = circOffset(i)
              const isActive    = offset === 0
              const isNeighbour = Math.abs(offset) === 1
              const isLoaded    = Math.abs(offset) <= 2

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
                    {isLoaded && e.mp4Url ? (
                      <video
                        ref={(el) => { videoRefs.current[i] = el }}
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

          {/* Left peek panel — identity + CTA */}
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

          {/* Arrows */}
          {total > 1 && (
            <>
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

          {entries.map((e, i) => {
            const isLoaded = Math.abs(i - mobileIndex) <= 2
            return (
              <div
                key={e.slug}
                ref={(el) => { mobileSlideRefs.current[i] = el }}
                className={styles.mobileSlide}
                onClick={() => { if (i === mobileIndex) onOpen(e.slug) }}
                role={i === mobileIndex ? 'button' : undefined}
                aria-label={i === mobileIndex ? `View ${e.title}` : undefined}
              >
                {isLoaded && e.mp4Url ? (
                  <video
                    ref={(el) => { mobileVideoRefs.current[i] = el }}
                    src={e.mp4Url}
                    muted loop playsInline
                    preload={i === mobileIndex ? 'auto' : 'none'}
                  />
                ) : (
                  <div className={styles.mobilePlaceholder} />
                )}
              </div>
            )
          })}

          <div className={styles.mobileBlurTop}    aria-hidden />
          <div className={styles.mobileBlurBottom} aria-hidden />

          {/* Top text — ref + title + CTA, exits upward on transition */}
          <div ref={mobileTextTopRef} className={styles.mobileTextTop}>
            <p className={styles.mobileRef}>ref. {mobileCurrent.sku}</p>
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
