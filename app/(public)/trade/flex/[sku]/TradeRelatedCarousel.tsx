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

export default function TradeRelatedCarousel({ products }: { products: TradeRelatedCard[] }) {
  const cards = products.filter(p => firstFrontImage(p.metalImages, p.availableMetals))
  if (cards.length === 0) return null

  return (
    <section className={styles.relatedSection}>
      <div className={styles.relatedScroll}>
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
    </section>
  )
}
