import Link from 'next/link'
import type { Product } from '@/types/products'
import LazyVideo from '@/components/common/LazyVideo'
import { parseProductName } from '@/lib/product-name'

/**
 * Product card — matches bezambar-web2026 Astro .ba-card exactly.
 * Uses <video> for video URLs, <img> fallback for images.
 * CSS lives in app/globals.css (ba-card, ba-card__media, ba-card__info, etc.)
 */
export default function ProductCard({ product, category }: { product: Product; category: string }) {
  const video = product.specs.heroVideoUrl
  const image = product.specs.heroPosterUrl

  return (
    <Link href={`/jewelry/${category.toLowerCase()}/${product.slug}`} className="ba-card">
      <div className="ba-card__media">
        {video ? (
          <LazyVideo src={video} poster={image ?? undefined} />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" />
        ) : null}
      </div>
      <div className="ba-card__info">
        {(() => {
          const { title, variant } = parseProductName(product.name)
          return (<>
            <p className="ba-card__collection">{product.specs.category}</p>
            <p className="ba-card__name">{title}</p>
            {variant && <p className="ba-card__variant">{variant}</p>}
            <p className="ba-card__ref">ref. {product.sku}</p>
          </>)
        })()}
      </div>
    </Link>
  )
}
