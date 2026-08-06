'use client'

/**
 * ScrollWipeCarousel — shared scroll-stack video hero used by both
 * HeroCarousel (left-aligned) and CinematicCarousel (center-aligned).
 *
 * Replaces two near-identical components. Behavior:
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
  /** 'left' = hero bottom-left text; 'center' = cinematic centered text */
  textAlign?: 'left' | 'center'
}

export default function ScrollWipeCarousel({ slides, textAlign = 'left' }: Props) {
  const stackRef  = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const [activeDot, setActiveDot]   = useState(0)
  const [dotsVisible, setDotsVisible] = useState(false)
  const video1Started = useRef(false)

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    video1Ref.current?.load()

    const onScroll = () => {
      const top      = stack.getBoundingClientRect().top
      const progress = Math.max(0, Math.min(1, -top / (stack.offsetHeight - window.innerHeight)))

      if (!reduced && slide1Ref.current) {
        slide1Ref.current.style.transform = `translateY(${(1 - progress) * 100}%)`
      }

      if (progress >= 0.45 && !video1Started.current) {
        video1Started.current = true
        video1Ref.current?.play().catch(() => {})
      }

      setActiveDot(progress >= 0.5 ? 1 : 0)
    }

    onScroll()
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      ([entry]) => setDotsVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(stack)

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const overlayClass = textAlign === 'center' ? styles.overlayCenter : styles.overlayLeft

  return (
    <div ref={stackRef} className={styles.stack}>
      <div className={styles.pin}>
        {/* Slide 0 */}
        <div className={styles.slide0}>
          <video
            autoPlay muted loop playsInline preload="none"
            poster={slides[0].posterUrl}
            className={styles.video}
          >
            <source src={slides[0].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.gradient} aria-hidden />
          <div className={overlayClass}>
            {slides[0].badge && <span className={styles.badge}>{slides[0].badge}</span>}
            <p className="ba-eyebrow">{slides[0].eyebrow}</p>
            <h2 className={styles.headline}>{slides[0].headline}</h2>
            <p className={styles.sub}>{slides[0].sub}</p>
          </div>
        </div>

        {/* Slide 1 */}
        <div ref={slide1Ref} className={styles.slide1}>
          <video
            ref={video1Ref}
            muted loop playsInline preload="none"
            poster={slides[1].posterUrl}
            className={styles.video}
          >
            <source src={slides[1].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.gradient} aria-hidden />
          <div className={overlayClass}>
            {slides[1].badge && <span className={styles.badge}>{slides[1].badge}</span>}
            <p className="ba-eyebrow">{slides[1].eyebrow}</p>
            <h2 className={styles.headline}>{slides[1].headline}</h2>
            <p className={styles.sub}>{slides[1].sub}</p>
          </div>
        </div>
      </div>

      {/* Dot navigator */}
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
  )
}
