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
  const mobilePinRef    = useRef<HTMLDivElement>(null)
  const mobileSlideRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileMediaRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileIdentRefs = useRef<(HTMLDivElement | null)[]>([])
  const mobileLedeRefs  = useRef<(HTMLDivElement | null)[]>([])
  const mobileVideoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Scroll-driven rAF loop — drives slide transforms directly, avoiding
  // React re-renders per frame. Only activates on mobile viewports.
  useEffect(() => {
    const stack = mobileStackRef.current
    if (!stack || total <= 1) return

    const mq = window.matchMedia('(max-width: 768px)')
    if (!mq.matches) return

    let ticking = false

    const update = () => {
      ticking = false
      const pin = mobilePinRef.current
      if (!pin) return
      const rect        = stack.getBoundingClientRect()
      // Pin's actual usable height in px (100dvh minus header offset)
      const pinH        = pin.clientHeight
      const peekH       = pinH * 0.25   // 25% of pin = one peek zone
      const activeH     = pinH * 0.5    // 50% of pin = active zone
      const scrollRange = rect.height - window.innerHeight
      if (scrollRange <= 0) return
      const progress    = Math.max(0, Math.min(1, -rect.top / scrollRange))
      const fracIndex   = progress * (total - 1)
      const rounded     = Math.round(fracIndex)

      mobileSlideRefs.current.forEach((slide, i) => {
        if (!slide) return
        const offset = i - fracIndex

        // Position slide — peekH offsets it so active lands in middle zone
        slide.style.transform = `translateY(${peekH + offset * activeH}px)`

        // Active slide on top so next slide's lede naturally rises behind it
        slide.style.zIndex = i === rounded ? '2' : '1'
        // Reveal visible slides (opacity starts 0 in CSS)
        slide.style.opacity = Math.abs(offset) < 1.5 ? '1' : '0'

        // Blur + dim only the media layer — text stays crisp
        const media = mobileMediaRefs.current[i]
        if (media) {
          const absOff = Math.abs(offset)
          media.style.filter  = absOff < 0.5 ? 'none' : 'blur(18px)'
          media.style.opacity = absOff < 0.5 ? '1' : absOff < 1.5 ? '0.5' : '0'
        }

        // Identity text (bottom of slide) — visible when this slide is prev
        // fades in as offset moves toward -1, fades out as it approaches 0
        const ident = mobileIdentRefs.current[i]
        if (ident) {
          ident.style.opacity = String(Math.max(0, Math.min(1, (-offset - 0.25) * 2)))
        }

        // Lede text (top of slide) — visible when this slide is next
        // rises up from bottom peek zone and goes behind the active video
        const lede = mobileLedeRefs.current[i]
        if (lede) {
          lede.style.opacity = String(Math.max(0, Math.min(1, (offset - 0.25) * 2)))
        }
      })

      // Trigger React re-render only when displayed product changes (for video play/pause)
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

  const current = products[index]

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
        <div ref={mobilePinRef} className={styles.mobilePin}>
          {products.map((p, i) => {
            const video = p.specs.heroVideoUrl
            const image = p.specs.heroPosterUrl
            return (
              <div
                key={p.sku}
                ref={(el) => { mobileSlideRefs.current[i] = el }}
                className={styles.mobileSlide}
              >
                {/* Media layer — blur/dim applied here so text stays crisp */}
                <div
                  ref={(el) => { mobileMediaRefs.current[i] = el }}
                  className={styles.mobileMedia}
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

                {/* Identity (bottom of slide) — scrolls off the top as prev */}
                <div
                  ref={(el) => { mobileIdentRefs.current[i] = el }}
                  className={styles.mobileSlideIdent}
                >
                  <Link href={`/jewelry/${category}/${p.slug}`} className={styles.captionLink}>
                    <p className={styles.ref}>ref. {p.sku}</p>
                    <h2 className={styles.name}>{p.name}</h2>
                    {p.specs.subtitle && <p className={styles.sub}>{p.specs.subtitle}</p>}
                    <span className={styles.cta}>View Piece →</span>
                  </Link>
                </div>

                {/* Lede (top of slide) — rises from bottom peek, goes behind active video */}
                {p.specs.lede && (
                  <div
                    ref={(el) => { mobileLedeRefs.current[i] = el }}
                    className={styles.mobileSlideLede}
                  >
                    <p className={styles.lede}>{p.specs.lede}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
