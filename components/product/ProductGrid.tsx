import { getProductsByCategory } from '@/lib/queries'
import ProductCard from './ProductCard'

/**
 * Renders product cards for a category.
 * The ba-product-grid wrapper belongs on the page (so spotlights can be excluded).
 * Accepts an optional exclude list for SKUs used in spotlight segments.
 */
export default async function ProductGrid({
  category,
  exclude = [],
}: {
  category: string
  exclude?: string[]
}) {
  const products = await getProductsByCategory(category)
  const filtered = products.filter((p) => !exclude.includes(p.sku))

  if (filtered.length === 0) return null

  return (
    <>
      {filtered.map((p) => (
        <ProductCard key={p.sku} product={p} category={category} />
      ))}
    </>
  )
}

export function ProductGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '4/5',
            background: 'var(--paper)',
            animation: 'ba-shimmer 1.4s ease-in-out infinite',
          }}
        />
      ))}
    </>
  )
}
