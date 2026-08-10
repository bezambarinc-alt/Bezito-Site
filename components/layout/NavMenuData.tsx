/**
 * NavMenuData — server component.
 *
 * Fetches active categories + collections from Neon and passes them
 * to the (client) MenuOverlay so the navigation is always data-driven.
 * Errors are swallowed so a DB hiccup never breaks the page shell.
 */
import { getActiveCategories, getActiveCollections } from '@/lib/queries'
import MenuOverlay from './MenuOverlay'

export default async function NavMenuData() {
  const [categories, collections] = await Promise.all([
    getActiveCategories().catch(() => [] as string[]),
    getActiveCollections().catch(() => [] as string[]),
  ])
  return <MenuOverlay categories={categories} collections={collections} />
}
