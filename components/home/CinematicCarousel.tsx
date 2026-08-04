'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './CinematicCarousel.module.css'

const cinematicSlides = [
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,f_auto,q_auto/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.jpg',
    badge: 'Coming Soon',
    eyebrow: 'Coming Soon',
    headline: 'The Elysian Pear',
    sub: 'A teardrop, reborn — the next chapter in the line of brilliance.',
  },
  {
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,f_auto,q_auto/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.mp4',
    posterUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.jpg',
    badge: undefined as string | undefined,
    eyebrow: 'The Elysian Pear Band',
    headline: 'Pear Cut. Continuous Line.',
    sub: 'Each teardrop calibrated to the next, until light becomes the band itself.',
  },
]

export default function CinematicCarousel() {
  const cineStackRef = useRef<HTMLDivElement>(null)
  const cineSlide1Ref = useRef<HTMLDivElement>(null)
  const cineVideo1Ref = useRef<HTMLVideoElement>(null)
  const [cineActiveDot, setCineActiveDot] = useState(0)
  const [cineDotsVisible, setCineDotsVisible] = useState(false)
  const cineVideo1Started = useRef(false)

  useEffect(() => {
    const stack = cineStackRef.current
    if (!stack) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    cineVideo1Ref.current?.load()

    const onScroll = () => {
      const top = stack.getBoundingClientRect().top
      const progress = Math.max(
        0,
        Math.min(1, -top / (stack.offsetHeight - window.innerHeight)),
      )

      if (!reduced && cineSlide1Ref.current) {
        cineSlide1Ref.current.style.transform = `translateY(${(1 - progress) * 100}%)`
      }

      if (progress >= 0.45 && !cineVideo1Started.current) {
        cineVideo1Started.current = true
        cineVideo1Ref.current?.play().catch(() => {})
      }

      setCineActiveDot(progress >= 0.5 ? 1 : 0)
    }

    onScroll()

    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true })

    const io = new IntersectionObserver(
      ([entry]) => setCineDotsVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(stack)

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={cineStackRef} className={styles.cineStack}>
      <div className={styles.cinePin}>
        {/* Slide 0 */}
        <div className={styles.cineSlide0}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={cinematicSlides[0].posterUrl}
            className={styles.cineVideo}
          >
            <source src={cinematicSlides[0].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.cineGradient} />
          <div className={styles.cineOverlay}>
            {cinematicSlides[0].badge ? (
              <span className={styles.badge}>{cinematicSlides[0].badge}</span>
            ) : null}
            <p className="ba-eyebrow">{cinematicSlides[0].eyebrow}</p>
            <h2 className={styles.cineHeadline}>{cinematicSlides[0].headline}</h2>
            <p className={styles.cineSub}>{cinematicSlides[0].sub}</p>
          </div>
        </div>

        {/* Slide 1 */}
        <div ref={cineSlide1Ref} className={styles.cineSlide1}>
          <video
            ref={cineVideo1Ref}
            muted
            loop
            playsInline
            preload="none"
            poster={cinematicSlides[1].posterUrl}
            className={styles.cineVideo}
          >
            <source src={cinematicSlides[1].videoUrl} type="video/mp4" />
          </video>
          <div className={styles.cineGradient} />
          <div className={styles.cineOverlay}>
            {cinematicSlides[1].badge ? (
              <span className={styles.badge}>{cinematicSlides[1].badge}</span>
            ) : null}
            <p className="ba-eyebrow">{cinematicSlides[1].eyebrow}</p>
            <h2 className={styles.cineHeadline}>{cinematicSlides[1].headline}</h2>
            <p className={styles.cineSub}>{cinematicSlides[1].sub}</p>
          </div>
        </div>
      </div>

      <div
        className={styles.cineDots}
        style={{ opacity: cineDotsVisible ? 1 : 0 }}
        aria-hidden="true"
      >
        {cinematicSlides.map((_, i) => (
          <span
            key={i}
            className={styles.cineDot}
            style={
              i === cineActiveDot
                ? { background: 'var(--ba-white)', transform: 'scale(1.4)' }
                : { background: 'rgba(255,255,255,0.35)' }
            }
          />
        ))}
      </div>
    </div>
  )
}
