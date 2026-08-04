'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './HeroCarousel.module.css'

const slides = [
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.jpg',
    eyebrow: 'The Elysian Cut™',
    headline: 'A Game of Angles',
    sub: 'Crown meets pavilion. Stone meets stone. Light becomes a line.',
  },
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,f_auto,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.jpg',
    eyebrow: 'The Elysian Oval Band',
    headline: 'Worn on the Finger, Worn as Light',
    sub: 'Every angle catches the next. The line never breaks.',
  },
]

export default function HeroCarousel() {
  const stackRef = useRef<HTMLDivElement>(null)
  const slide1Ref = useRef<HTMLDivElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const [activeDot, setActiveDot] = useState(0)
  const [dotsVisible, setDotsVisible] = useState(false)
  const video1Started = useRef(false)

  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Preload slide 1 video.
    video1Ref.current?.load()

    if (reduced) {
      // Show slide 0 statically, keep slide 1 hidden below.
      setActiveDot(0)
    }

    const onScroll = () => {
      const top = stack.getBoundingClientRect().top
      const progress = Math.max(
        0,
        Math.min(1, -top / (stack.offsetHeight - window.innerHeight)),
      )

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

  return (
    <div ref={stackRef} className={styles.stack}>
      <div className={styles.pin}>
        {/* Slide 0 */}
        <div className={styles.slide0}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={slides[0].posterUrl}
            className={styles.video}
          >
            <source src={slides[0].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.gradient} />
          <div className={styles.overlay}>
            <p className="ba-eyebrow">{slides[0].eyebrow}</p>
            <h2 className={styles.headline}>{slides[0].headline}</h2>
            <p className={styles.sub}>{slides[0].sub}</p>
          </div>
        </div>

        {/* Slide 1 */}
        <div ref={slide1Ref} className={styles.slide1}>
          <video
            ref={video1Ref}
            muted
            loop
            playsInline
            preload="none"
            poster={slides[1].posterUrl}
            className={styles.video}
          >
            <source src={slides[1].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.gradient} />
          <div className={styles.overlay}>
            <p className="ba-eyebrow">{slides[1].eyebrow}</p>
            <h2 className={styles.headline}>{slides[1].headline}</h2>
            <p className={styles.sub}>{slides[1].sub}</p>
          </div>
        </div>
      </div>

      <div
        className={styles.dots}
        style={{ opacity: dotsVisible ? 1 : 0 }}
        aria-hidden="true"
      >
        {slides.map((_, i) => (
          <span
            key={i}
            className={styles.dot}
            style={
              i === activeDot
                ? { background: 'var(--ba-white)', transform: 'scale(1.4)' }
                : { background: 'rgba(255,255,255,0.35)' }
            }
          />
        ))}
      </div>
    </div>
  )
}
