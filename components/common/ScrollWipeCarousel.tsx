'use client'

/**
 * ScrollWipeCarousel — scroll-stack video hero. Text is always bottom-left
 * (matches Astro .hero__content AND .cinematic__content, which are identical).
 * Used directly on the home page for both the top hero and the cinematic
 * section — same component, only the slide data differs.
 *
 * Behavior:
 *  - Slide 0 plays immediately (autoPlay)
 *  - Slide 1 wipes up as user scrolls into the second half of the stack
 *  - Slide 1 video preloads lazily, plays once wipe reaches 45% progress
 *  - Dot nav appears when stack is in-viewport; active dot tracks progress
 */

import { useEffect, useRef, useState } from 'react'
import type { CarouselSlide } from '@/lib/data/home-slides'
import styles from './ScrollWipeCarousel.module.css'

interface Props {
  slides: [CarouselSlide, CarouselSlide]
  /** When true, slide 0's headline renders as <h1> — use only on the above-fold hero. */
  primaryHero?: boolean
}

export default function ScrollWipeCarousel({ slides, primaryHero = false }: Props) {
  const stackRef  = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const video0Ref = useRef<HTMLVideoElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const [activeDot, setActiveDot]   = useState(0)
  const [dotsVisible, setDotsVisible] = useState(false)
  const video1Started = useRef(false)
  const video1Loaded  = useRef(false)
  const ticking = useRef(false)

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const video0 = video0Ref.current
    const video1 = video1Ref.current

    let stackInView = false

    // Compute wipe progress + drive transform/video/dots. Called inside rAF.
    const update = () => {
      ticking.current = false
      if (!stackInView) return  // skip getBoundingClientRect + setState when off-screen
      const rect     = stack.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))

      if (!reduced && slide1Ref.current) {
        slide1Ref.current.style.transform = `translateY(${(1 - progress) * 100}%)`
      }

      if (progress >= 0.45 && !video1Started.current) {
        video1Started.current = true
        video1?.play().catch(() => {})
      }

      setActiveDot(progress >= 0.5 ? 1 : 0)
    }

    // rAF-throttled scroll handler
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    // Resize handler — recompute after the viewport settles
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(onScroll, 120)
    }

    // Scroll listener is ONLY active while the stack is in the viewport.
    // IO adds it on entry and removes it on exit — off-screen carousel costs zero per scroll.
    const io = new IntersectionObserver(
      ([entry]) => {
        stackInView = entry.isIntersecting
        setDotsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          video0?.play().catch(() => {})
          if (!video1Loaded.current) {
            video1Loaded.current = true
            video1?.load()
          }
          if (!reduced) {
            window.addEventListener('scroll', onScroll, { passive: true })
            window.addEventListener('resize', onResize)
          }
          onScroll()
        } else {
          video0?.pause()
          video1?.pause()
          video1Started.current = false
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onResize)
          clearTimeout(resizeTimer)
        }
      },
      { threshold: 0 },
    )
    io.observe(stack)

    // One-time position check on mount (sets slide1 initial transform)
    requestAnimationFrame(update)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={stackRef} className={styles.stack}>
      <div className={styles.pin}>
        {/* Slide 0 */}
        <div className={styles.slide0}>
          {/* preload="auto" — above fold hero, must buffer immediately for autoplay */}
          <video
            ref={video0Ref}
            src={slides[0].videoUrl}
            autoPlay muted loop playsInline preload="auto"
            poster={slides[0].posterUrl}
            className={styles.video}
            onError={(e) => { const v = e.currentTarget; console.error('[Hero] video 0 failed:', v.currentSrc); v.src = '' }}
          />
          <div className={styles.gradient} aria-hidden />
          <div className={styles.overlayLeft}>
            <p className="ba-eyebrow">{slides[0].eyebrow}</p>
            {primaryHero
              ? <h1 className={styles.headline}>{slides[0].headline}</h1>
              : <h2 className={styles.headline}>{slides[0].headline}</h2>}
            <p className={styles.sub}>{slides[0].sub}</p>
          </div>
        </div>

        {/* Slide 1 */}
        <div ref={slide1Ref} className={styles.slide1}>
          <video
            ref={video1Ref}
            src={slides[1].videoUrl}
            muted loop playsInline preload="none"
            poster={slides[1].posterUrl}
            className={styles.video}
            onError={(e) => { const v = e.currentTarget; console.error('[Hero] video 1 failed:', v.currentSrc); v.src = '' }}
          />
          <div className={styles.gradient} aria-hidden />
          <div className={styles.overlayLeft}>
            <p className="ba-eyebrow">{slides[1].eyebrow}</p>
            <h2 className={styles.headline}>{slides[1].headline}</h2>
            <p className={styles.sub}>{slides[1].sub}</p>
          </div>
        </div>

        {/* Dot navigator — inside .pin so position:absolute is scoped to the sticky panel,
            not the viewport. Prevents overlap when two carousels are on the same page. */}
        <div
          className={styles.dots}
          style={{ opacity: dotsVisible ? 1 : 0 }}
          aria-hidden="true"
        >
          {slides.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === activeDot ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
