import Image from 'next/image'
import Link from 'next/link'
import type { RelatedCard } from '@/lib/queries'
import { parseProductName } from '@/lib/product-name'
import styles from './RelatedCarousel.module.css'

interface Props {
  products: RelatedCard[]
}

export default function RelatedCarousel({ products }: Props) {
  if (!products.length) return null
  return (
    <section className={styles.section}>
      <p className={styles.eyebrow}>Related Pieces</p>
      <div className={styles.strip}>
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/jewelry/${p.category || 'jewelry'}/${p.slug}`}
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              {p.heroPosterUrl ? (
                <Image
                  src={p.heroPosterUrl}
                  alt={parseProductName(p.name).title}
                  fill
                  sizes="280px"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              ) : (
                <div className={styles.placeholder} />
              )}
            </div>
            <p className={styles.title}>{parseProductName(p.name).title}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
