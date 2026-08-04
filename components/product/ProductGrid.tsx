import { getProductsByCategory } from '@/lib/queries'
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

/**
 * Async server component — fetches products for a category. Meant to be wrapped
 * in a <Suspense> boundary so the page shell streams first.
 */
export default async function ProductGrid({ category }: { category: string }) {
  const products = await getProductsByCategory(category)

  if (products.length === 0) {
    return (
      <p className={styles.empty}>
        New pieces for this category are being catalogued. Please inquire for current availability.
      </p>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.sku} product={p} category={category} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className={styles.grid} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  )
}
