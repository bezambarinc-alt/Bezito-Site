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
}

export default function ScrollWipeCarousel({ slides }: Props) {
  const stackRef  = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const video0Ref = useRef<HTMLVideoElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const [activeDot, setActiveDot]   = useState(0)
  const [dotsVisible, setDotsVisible] = useState(false)
  const video1Started = useRef(false)
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
      const rect     = stack.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))

      if (!reduced && slide1Ref.current) {
        slide1Ref.current.style.transform = `translateY(${(1 - progress) * 100}%)`
      }

      if (progress >= 0.45 && !video1Started.current) {
        video1Started.current = true
        if (stackInView) video1?.play().catch(() => {})
      }

      setActiveDot(progress >= 0.5 ? 1 : 0)
    }

    // rAF-throttled scroll handler (Astro parity — avoids layout thrash per event)
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    // Resize handler — recompute after the viewport settles (Astro parity)
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(onScroll, 120)
    }

    // Pause both videos when the stack scrolls off-screen (perf: no decoding
    // offscreen video); resume the active one when it returns.
    const io = new IntersectionObserver(
      ([entry]) => {
        stackInView = entry.isIntersecting
        setDotsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          video1?.load()
          onScroll()
        } else {
          video0?.pause()
          video1?.pause()
        }
      },
      { threshold: 0 },
    )
    io.observe(stack)

    requestAnimationFrame(update)
    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onResize)
    }

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
          <video
            ref={video0Ref}
            autoPlay muted loop playsInline preload="none"
            poster={slides[0].posterUrl}
            className={styles.video}
          >
            <source src={slides[0].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.gradient} aria-hidden />
          <div className={styles.overlayLeft}>
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
          <div className={styles.overlayLeft}>
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
