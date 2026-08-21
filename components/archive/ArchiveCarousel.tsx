'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import { getCategoryLabel } from '@/lib/data/categories'
import styles from './ArchiveCarousel.module.css'

interface Props {
  entries: ArchiveEntry[]
  onOpen:  (slug: string) => void
}

export default function ArchiveCarousel({ entries, onOpen }: Props) {
  const total = entries.length

  // ── Desktop state ──────────────────────────────────────────────────────────
  const [index, setIndex] = useState(0)

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

  // ── Mobile scroll-lock state ───────────────────────────────────────────────
  const [mobileIndex, setMobileIndex] = useState(0)
  const mobileStackRef      = useRef<HTMLDivElement>(null)
  const mobileSlideRefs     = useRef<(HTMLDivElement | null)[]>([])
  const mobileTextTopRef    = useRef<HTMLDivElement>(null)
  const mobileTextBottomRef = useRef<HTMLDivElement>(null)

  // Scroll-driven rAF — same pattern as CinematicCarousel mobile.
  // Tall wrapper + sticky pin + smoothstep per segment.
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

  if (total === 0) {
    return <div className={styles.empty}>No pieces match the current filters.</div>
  }

  const current       = entries[index]
  const mobileCurrent = entries[mobileIndex]

  return (
    <>
      {/* ── Desktop horizontal filmstrip (hidden on mobile) ─────────────── */}
      <div className={styles.section}>
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
                    transform:     `translateX(calc(-50% + ${offset * 105}%))`,
                    filter:        isActive ? 'none' : 'blur(18px)',
                    opacity:       isActive ? 1 : isNeighbour ? 0.55 : 0,
                    zIndex:        isActive ? 2 : 1,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                  aria-hidden={!isActive}
                >
                  <div className={styles.media}>
                    {isLoaded && e.gifUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.gifUrl} alt={e.title} className={styles.gifImg} />
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
                <p className={styles.sub}>{getCategoryLabel(current.category)}</p>
                <button className={styles.cta} onClick={() => onOpen(current.slug)}>
                  View Piece →
                </button>
              </div>
            </div>
          )}

          {/* Right peek panel — shape + color tags */}
          {total > 1 && (current.shapes.length > 0 || current.colors.length > 0) && (
            <div className={styles.nextOverlay}>
              <div className={styles.tagGroup}>
                {current.shapes.map(s => (
                  <span key={s} className={styles.tag}>{s}</span>
                ))}
                {current.colors.map(c => (
                  <span key={c} className={styles.tag}>{c}</span>
                ))}
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
                {isLoaded && e.gifUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.gifUrl} alt="" className={styles.mobileGif} />
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

          {/* Bottom text — category, exits downward on transition */}
          <div ref={mobileTextBottomRef} className={styles.mobileTextBottom}>
            <p className={styles.mobileSub}>{getCategoryLabel(mobileCurrent.category)}</p>
            {mobileCurrent.shapes.length > 0 && (
              <p className={styles.mobileTags}>{mobileCurrent.shapes.join(' · ')}</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
