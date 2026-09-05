import type { Metadata } from 'next'
import LayoutDefault from '../../jewelry/[category]/[slug]/layouts/LayoutDefault'
import { getNonce } from '@/lib/nonce'
import type { Product } from '@/types/products'
import type { SpecItem } from '@/types/blocks'

/**
 * Legacy page preserved from the WordPress site (bezambar.com/shop/…).
 * Intentionally an orphan — no nav link, no catalog entry, no DB row.
 * Exempted from the /shop/:slug → /archive redirect in redirects.ts.
 */

const IMAGE =
  'https://res.cloudinary.com/dlg2mou53/image/upload/v1788585901/Jewelry%20Images/Rings/maharajah-ring-red-green-diamonds.jpg'

const product: Product = {
  sku: 'MAHARAJAH',
  slug: 'maharajah-ring-with-red-and-green-diamonds',
  view1Url: null,
  view2Url: null,
  view3Url: null,
  zohoId: '',
  name: 'Maharajah',
  featured: false,
  price: null,
  media: [{ url: IMAGE, type: 'image' }],
  syncedAt: '',
  specs: {
    category: 'rings',
    subtitle: 'A unique design with rare colored diamonds.',
    lede:
      'The Maharajah ring is a unique design with rare colored diamonds. ' +
      'Available in platinum, 18K white, rose and yellow gold, this design can ' +
      'accommodate different shapes, sizes, and colored center stones.',
    metal: 'Platinum · 18K white, rose or yellow gold',
    heroPosterUrl: IMAGE,
  },
}

const specItems: SpecItem[] = [
  { label: 'Gem Stone', body: 'Rare red and green diamonds' },
  { label: 'Metal', body: product.specs.metal! },
  { label: 'Center Stone', body: 'Accommodates different shapes, sizes, and colored center stones' },
  { label: 'Made In', body: 'Los Angeles' },
  { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
]

export const metadata: Metadata = {
  title: 'Maharajah Ring — Rare Colored Diamonds | Bez Ambar',
  description:
    'The Maharajah ring is a unique design with rare colored diamonds. Available in platinum, 18K white, rose and yellow gold.',
  openGraph: {
    title: 'Maharajah Ring · Bez Ambar',
    description: 'A unique design with rare colored diamonds.',
    images: [{ url: IMAGE }],
  },
  alternates: {
    canonical: 'https://bezambar.com/shop/maharajah-ring-with-red-and-green-diamonds',
  },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Maharajah Ring',
  description:
    'A unique design with rare colored diamonds. Available in platinum, 18K white, rose and yellow gold.',
  image: [IMAGE],
  sku: 'MAHARAJAH',
  brand: { '@type': 'Brand', name: 'Bez Ambar' },
  offers: {
    '@type': 'Offer',
    url: 'https://bezambar.com/shop/maharajah-ring-with-red-and-green-diamonds',
    seller: { '@type': 'Organization', name: 'Bez Ambar' },
    availability: 'https://schema.org/InStoreOnly',
    priceCurrency: 'USD',
  },
}

export default async function MaharajahPage() {
  const nonce = await getNonce()
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }}
      />
      <LayoutDefault
        product={product}
        heroVideo={undefined}
        heroPoster={IMAGE}
        onHandPhoto={IMAGE}
        category="rings"
        categoryLabel="Rings"
        specItems={specItems}
        views={[]}
        prevProduct={null}
        nextProduct={null}
      />
    </>
  )
}
