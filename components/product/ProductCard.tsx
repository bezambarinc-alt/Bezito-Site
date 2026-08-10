import Link from 'next/link'
import type { Product } from '@/types/products'

/**
 * Product card — matches bezambar-web2026 Astro .ba-card exactly.
 * Uses <video> for video URLs, <img> fallback for images.
 * CSS lives in app/globals.css (ba-card, ba-card__media, ba-card__info, etc.)
 */
export default function ProductCard({ product, category }: { product: Product; category: string }) {
  const video = product.specs.heroVideoUrl
  const image = product.specs.heroPosterUrl

  return (
    <Link href={`/jewelry/${category.toLowerCase()}/${encodeURIComponent(product.sku)}`} className="ba-card">
      <div className="ba-card__media">
        {video ? (
          <video src={video} autoPlay muted loop playsInline />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" />
        ) : null}
      </div>
      <div className="ba-card__info">
        <p className="ba-card__collection">{product.specs.category}</p>
        <p className="ba-card__name">{product.name}</p>
        <p className="ba-card__ref">ref. {product.sku}</p>
      </div>
    </Link>
  )
}
