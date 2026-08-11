/**
 * NavMenuData — server component.
 *
 * Fetches categories, collections, and featured products from Neon and passes
 * them to the (client) MenuOverlay so the navigation is fully data-driven.
 * Errors are swallowed so a DB hiccup never breaks the page shell.
 */
import { getActiveCategories, getActiveCollections, getFeaturedProducts } from '@/lib/queries'
import type { Product } from '@/types/products'
import MenuOverlay from './MenuOverlay'

export default async function NavMenuData() {
  const [categories, collections, featuredProducts] = await Promise.all([
    getActiveCategories().catch(()  => [] as string[]),
    getActiveCollections().catch(() => [] as string[]),
    getFeaturedProducts().catch(()  => [] as Product[]),
  ])
  return (
    <MenuOverlay
      categories={categories}
      collections={collections}
      featuredProducts={featuredProducts}
    />
  )
}
