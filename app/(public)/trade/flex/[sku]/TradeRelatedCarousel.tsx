'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import type { TradeRelatedCard } from '@/lib/queries'
import type { MetalImages } from '@/types/products'
import { cldUrl } from '@/lib/cloudinary'
import styles from './pdp.module.css'

function firstFrontImage(metalImages: MetalImages | null, availableMetals: string[] | null): string | null {
  if (!metalImages || !availableMetals) return null
  for (const label of availableMetals) {
    const key = label.toLowerCase().replace(/\s+/g, '_') as keyof MetalImages
    const front = metalImages[key]?.front
    if (front) return front
  }
  return null
}

function orientation(sku: string): string {
  if (sku.endsWith('N')) return 'N–S'
  if (sku.endsWith('E')) return 'E–W'
  return ''
}

const GAP = 4 // px — must match CSS gap

export default function TradeRelatedCarousel({ products }: { products: TradeRelatedCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const cards = products.filter(p => firstFrontImage(p.metalImages, p.availableMetals))
  const totalPages = Math.ceil(cards.length / 4)

  const scrollToPage = useCallback((p: number) => {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.children[0] as HTMLElement | undefined
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + GAP
    el.scrollTo({ left: p * 4 * cardWidth, behavior: 'smooth' })
    setPage(p)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const firstCard = el.children[0] as HTMLElement | undefined
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + GAP
    const p = Math.round(el.scrollLeft / (cardWidth * 4))
    setPage(Math.min(Math.max(p, 0), totalPages - 1))
  }, [totalPages])

  if (cards.length === 0) return null

  return (
    <section className={styles.relatedSection}>
      <div className={styles.relatedScroll} ref={scrollRef} onScroll={handleScroll}>
        {cards.map(p => {
          const img = firstFrontImage(p.metalImages, p.availableMetals)!
          const orient = orientation(p.sku)
          return (
            <Link key={p.slug} href={`/trade/flex/${p.slug}`} className={styles.relatedCard}>
              <div className={styles.relatedImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cldUrl(img, 'f_auto,q_auto:best,w_600,ar_4:5,c_fill')}
                  alt={p.sku}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div className={styles.relatedMeta}>
                <p className={styles.relatedRef}>{p.sku}</p>
                {(p.stoneWeightEach || orient) && (
                  <p className={styles.relatedWeight}>
                    {p.stoneWeightEach ? `${p.stoneWeightEach.toFixed(2)} ct each` : ''}
                    {p.stoneWeightEach && orient ? ' · ' : ''}
                    {orient}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className={styles.relatedNav}>
          <button
            className={styles.relatedArrow}
            onClick={() => scrollToPage(Math.max(0, page - 1))}
            disabled={page === 0}
            aria-label="Previous"
          >
            ←
          </button>
          <div className={styles.relatedDots} role="tablist" aria-label="Carousel pages">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === page}
                className={`${styles.relatedDot}${i === page ? ` ${styles.relatedDotActive}` : ''}`}
                onClick={() => scrollToPage(i)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
          <button
            className={styles.relatedArrow}
            onClick={() => scrollToPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </section>
  )
}
