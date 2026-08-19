/**
 * NavMenuData — server component.
 *
 * Fetches categories from Neon and passes them to the (client) MenuOverlay
 * so the navigation is fully data-driven. Errors are swallowed so a DB hiccup
 * never breaks the page shell.
 */
import { getActiveCategories } from '@/lib/queries'
import MenuOverlay from './MenuOverlay'

export default async function NavMenuData() {
  const categories = await getActiveCategories().catch(() => [] as string[])
  return <MenuOverlay categories={categories} />
}
