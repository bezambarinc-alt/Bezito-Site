'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import LazyVideo from '@/components/common/LazyVideo'
import type { Product } from '@/types/products'
import styles from './CategoryCarousel.module.css'

interface Props {
  products: Product[]
  category: string
}

export default function CategoryCarousel({ products, category }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // After each scroll, find whichever card center is closest to the viewport center.
  const updateActive = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const viewCenter = el.scrollLeft + el.clientWidth / 2
    let closest = 0
    let minDist = Infinity
    Array.from(el.querySelectorAll<HTMLElement>('[data-card]')).forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - viewCenter)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    setActiveIndex(closest)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      el.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [updateActive])

  // Scroll so the target card is centered in the viewport.
  const goTo = useCallback((index: number) => {
    const el = trackRef.current
    if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
    const card = cards[index]
    if (!card) return
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  if (products.length === 0) return null

  return (
    <div className={styles.viewport}>
      <div className={styles.track} ref={trackRef}>
        {products.map((p, i) => {
          const video = p.specs.heroVideoUrl
          const poster = p.specs.heroPosterUrl
          const isActive = i === activeIndex
          return (
            <div
              key={p.slug}
              data-card=""
              className={`${styles.card} ${isActive ? styles.cardActive : styles.cardDim}`}
            >
              <div className={styles.media}>
                {video ? (
                  <LazyVideo
                    src={video}
                    poster={poster ?? undefined}
                    className={styles.video}
                    rootMargin="0px 600px"
                  />
                ) : poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt={p.name} className={styles.video} />
                ) : (
                  <div className={styles.placeholder} />
                )}
                <div className={styles.gradient} aria-hidden />
                <div className={styles.info}>
                  <span className={styles.ref}>ref. {p.sku}</span>
                  <h3 className={styles.name}>{p.name}</h3>
                  {p.specs.subtitle && <p className={styles.sub}>{p.specs.subtitle}</p>}
                  <Link href={`/jewelry/${category}/${p.slug}`} className={styles.cta}>
                    View Piece <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {products.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.nav} ${styles.prev}`}
            aria-label="Previous piece"
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5 L8 12 L15 19" stroke="currentColor" strokeWidth="1.25"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.next}`}
            aria-label="Next piece"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === products.length - 1}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 5 L16 12 L9 19" stroke="currentColor" strokeWidth="1.25"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
