'use client'

import Link from 'next/link'
import LazyVideo from '@/components/common/LazyVideo'
import type { Product } from '@/types/products'
import styles from './CategoryCarousel.module.css'

interface Props {
  products: Product[]
  category: string
}

export default function CategoryCarousel({ products, category }: Props) {
  return (
    <div className={styles.track}>
      {products.map((p) => {
        const video  = p.specs.heroVideoUrl
        const poster = p.specs.heroPosterUrl
        return (
          <Link
            key={p.slug}
            href={`/jewelry/${category}/${p.slug}`}
            className={styles.card}
          >
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
                <span className={styles.cta}>View piece →</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
