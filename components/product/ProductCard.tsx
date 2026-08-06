import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, category }: { product: Product; category: string }) {
  const image = product.media.find((m) => m.type !== 'video') ?? product.media[0]
  const gem = product.specs.gemStone
  return (
    <Link href={`/jewelry/${category}/${product.sku}`} className={styles.card}>
      <div className={styles.frame}>
        {image?.url ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
        {/* Hover reveal — "View Piece" label on dark scrim */}
        <div className={styles.hover} aria-hidden>
          <span className={styles.hoverLabel}>View Piece</span>
        </div>
      </div>
      <div className={styles.meta}>
        <h3 className={styles.name}>{product.name}</h3>
        {/* Gem shown on card; SKU lives on the detail page only */}
        {gem && <p className={styles.gem}>{gem}</p>}
      </div>
    </Link>
  )
}
