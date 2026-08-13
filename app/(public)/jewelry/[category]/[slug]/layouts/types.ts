import type { Product } from '@/types/products'
import type { SpecItem } from '@/types/blocks'

/** Props passed to every product page layout variant. */
export interface ProductLayoutProps {
  product: Product
  heroVideo: string | undefined
  heroPoster: string | undefined
  onHandPhoto: string | undefined
  category: string
  categoryLabel: string
  specItems: SpecItem[]
  views: { label: string; url: string | null | undefined }[]
}
