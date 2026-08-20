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
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.track} ref={trackRef}>
        {products.map((p) => {
          const video  = p.specs.heroVideoUrl
          const poster = p.specs.heroPosterUrl
          return (
            <div key={p.slug} className={styles.card}>
              <div className={styles.media}>
                {video ? (
                  <LazyVideo
                    src={video}
                    poster={poster ?? undefined}
                    className={styles.video}
                    rootMargin="0px 400px"
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
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
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
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
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
