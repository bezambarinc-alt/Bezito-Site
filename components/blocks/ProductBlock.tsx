import { sql } from '@/lib/db'
import { TEMPLATES, isValidTemplateId } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
import { getCategoryLabel } from '@/lib/data/categories'
import type { SpecItem } from '@/types/blocks'
import type { ProductBlock as ProductBlockType } from '@/types/blocks'

const BLOCK_DEFAULT_TEMPLATE = 'default'

function isValidForBlock(id: string) {
  return isValidTemplateId(id)
}

export default async function ProductBlock({ block }: { block: ProductBlockType }) {
  const [product] = await sql<{
    sku: string; name: string; slug: string; category: string;
    subtitle: string | null; editorial: string | null;
    hero_visual: string | null; editorial_visual: string | null;
    metal: string | null; stone_shape: string | null; stone_carats: string | null;
    stone_color: string | null; stone_clarity: string | null;
    total_carat_weight: number | null; center_stone_weight: number | null;
    view_1_url: string | null; view_2_url: string | null; view_3_url: string | null;
  }>(
    `SELECT sku, name, slug, category, subtitle, editorial,
            hero_visual, editorial_visual, metal,
            stone_shape, stone_carats, stone_color, stone_clarity,
            total_carat_weight, center_stone_weight,
            view_1_url, view_2_url, view_3_url
     FROM products WHERE sku = $1`,
    [block.sku],
  )

  if (!product) return null

  const specItems: SpecItem[] = []
  if (product.stone_shape)         specItems.push({ label: 'Stone Shape',  body: product.stone_shape })
  if (product.stone_carats)        specItems.push({ label: 'Carat Weight', body: product.stone_carats })
  if (product.stone_color)         specItems.push({ label: 'Color',        body: product.stone_color })
  if (product.stone_clarity)       specItems.push({ label: 'Clarity',      body: product.stone_clarity })
  if (product.metal)               specItems.push({ label: 'Metal',        body: product.metal })
  if (product.center_stone_weight) specItems.push({ label: 'Center Stone', body: `${product.center_stone_weight} ct` })

  const templateId = (block.template && isValidForBlock(block.template))
    ? block.template
    : BLOCK_DEFAULT_TEMPLATE
  const Layout = TEMPLATES[templateId].component

  return (
    <Layout
      product={{
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        zohoId: '',
        featured: false,
        price: null,
        media: [],
        syncedAt: '',
        view1Url: product.view_1_url ?? null,
        view2Url: product.view_2_url ?? null,
        view3Url: product.view_3_url ?? null,
        relatedSkus: [],
        ijewelUrl: null,
        interactiveIsHero: false,
        specs: {
          codeName:      product.sku,
          subtitle:      product.subtitle      ?? undefined,
          lede:          product.editorial     ?? undefined,
          metal:         product.metal         ?? undefined,
          gemStone:      product.stone_shape   ?? undefined,
          caratWeight:   product.total_carat_weight ? String(product.total_carat_weight) : undefined,
          color:         product.stone_color   ?? undefined,
          clarity:       product.stone_clarity ?? undefined,
          heroVideoUrl:  product.hero_visual   ?? undefined,
          heroPosterUrl: product.editorial_visual ?? undefined,
        },
      }}
      heroVideo={product.hero_visual      ?? undefined}
      heroPoster={product.editorial_visual ?? undefined}
      onHandPhoto={product.editorial_visual ?? undefined}
      category={product.category}
      categoryLabel={getCategoryLabel(product.category)}
      specItems={specItems}
      views={[
        { label: 'View 1', url: product.view_1_url },
        { label: 'View 2', url: product.view_2_url },
        { label: 'View 3', url: product.view_3_url },
      ]}
    />
  )
}
