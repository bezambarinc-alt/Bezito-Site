/**
 * NavMenuData — server component.
 *
 * Fetches categories, products, and collections from Neon and passes them to
 * the (client) MenuOverlay so the navigation is fully data-driven.
 * Errors are swallowed so a DB hiccup never breaks the page shell.
 */
import { getActiveCategories, getActiveCollections, getNavProducts } from '@/lib/queries'
import MenuOverlay from './MenuOverlay'

export default async function NavMenuData() {
  const [categories, navProducts, collections] = await Promise.all([
    getActiveCategories().catch(() => [] as string[]),
    getNavProducts().catch(() => [] as { slug: string; name: string; category: string }[]),
    getActiveCollections().catch(() => [] as string[]),
  ])

  // Group products by category slug for the third-level drill-down.
  const categoryProducts: Record<string, { slug: string; name: string }[]> = {}
  for (const p of navProducts) {
    if (!categoryProducts[p.category]) categoryProducts[p.category] = []
    categoryProducts[p.category].push({ slug: p.slug, name: p.name })
  }

  return (
    <MenuOverlay
      categories={categories}
      categoryProducts={categoryProducts}
      collections={collections}
    />
  )
}
