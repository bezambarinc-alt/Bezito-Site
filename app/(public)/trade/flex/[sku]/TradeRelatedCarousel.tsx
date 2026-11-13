'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { TradeRelatedCard } from '@/lib/queries'
import type { MetalImages } from '@/types/products'
import { cldUrl } from '@/lib/cloudinary'
import styles from './pdp.module.css'

interface CarouselCard {
  key: string
  slug: string
  sku: string
  totalCaratWeight: number | null
  metalKey: string
  metalLabel: string
  imageUrl: string
}

function expandToCards(products: TradeRelatedCard[]): CarouselCard[] {
  return products.flatMap(p => {
    if (!p.metalImages || !p.availableMetals) return []
    return p.availableMetals.flatMap(label => {
      const metalKey = label.toLowerCase().replace(/\s+/g, '_')
      const front = (p.metalImages as Record<string, { front?: string }>)[metalKey]?.front
      if (!front) return []
      return [{
        key: `${p.slug}-${metalKey}`,
        slug: p.slug,
        sku: p.sku,
        totalCaratWeight: p.totalCaratWeight,
        metalKey,
        metalLabel: label,
        imageUrl: front,
      }]
    })
  })
}

const GAP = 4

function ChevronLeft() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 1 2 9 8 17" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 1 8 9 2 17" />
    </svg>
  )
}

export default function TradeRelatedCarousel({ products }: { products: TradeRelatedCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  // Cards visible per view — 4 on desktop, 2 at ≤860px (see pdp.module.css).
  // Measured from the DOM; 4 is only the pre-measure SSR default.
  const [perView, setPerView] = useState(4)

  const cards = expandToCards(products)
  const totalPages = Math.max(1, Math.ceil(cards.length / perView))

  /** Card pitch (width + gap) and how many cards fit in the container. */
  const measure = useCallback(() => {
    const el = scrollRef.current
    const firstCard = el?.children[0] as HTMLElement | undefined
    if (!el || !firstCard) return null
    const cardWidth = firstCard.offsetWidth + GAP
    const n = Math.max(1, Math.round(el.clientWidth / cardWidth))
    return { el, cardWidth, n }
  }, [])

  useEffect(() => {
    const update = () => {
      const m = measure()
      if (m) setPerView(m.n)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [measure])

  // Keep the active page in range when perView changes (e.g. rotate / resize)
  const activePage = Math.min(page, totalPages - 1)

  const scrollToPage = useCallback((p: number) => {
    const m = measure()
    if (!m) return
    m.el.scrollTo({ left: p * m.n * m.cardWidth, behavior: 'smooth' })
    setPage(p)
  }, [measure])

  const handleScroll = useCallback(() => {
    const m = measure()
    if (!m) return
    const p = Math.round(m.el.scrollLeft / (m.cardWidth * m.n))
    setPage(Math.min(Math.max(p, 0), totalPages - 1))
  }, [measure, totalPages])

  if (cards.length === 0) return null

  return (
    <section className={styles.relatedSection}>
      <div className={styles.relatedScrollWrap}>
        {/* Arrows only when there is more than one page (disabled = hidden via CSS at the ends) */}
        {totalPages > 1 && (
          <button
            className={`${styles.relatedArrow} ${styles.relatedArrowLeft}`}
            onClick={() => scrollToPage(Math.max(0, activePage - 1))}
            disabled={activePage === 0}
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>
        )}

        <div className={styles.relatedScroll} ref={scrollRef} onScroll={handleScroll}>
          {cards.map(card => {
            return (
              <Link key={card.key} href={`/trade/flex/${card.slug}?metal=${card.metalKey}`} className={styles.relatedCard}>
                <div className={styles.relatedImgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cldUrl(card.imageUrl, 'f_auto,q_auto:best,w_600,ar_4:5,c_fill')}
                    alt={`${card.sku} ${card.metalLabel}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div className={styles.relatedMeta}>
                  <p className={styles.relatedRef}>{card.sku}</p>
                  <p className={styles.relatedWeight}>
                    {card.metalLabel}{card.totalCaratWeight ? ` · ${card.totalCaratWeight.toFixed(2)} ct tw` : ''}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {totalPages > 1 && (
          <button
            className={`${styles.relatedArrow} ${styles.relatedArrowRight}`}
            onClick={() => scrollToPage(Math.min(totalPages - 1, activePage + 1))}
            disabled={activePage === totalPages - 1}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.relatedNav}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.relatedDot}${i === activePage ? ` ${styles.relatedDotActive}` : ''}`}
              onClick={() => scrollToPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
