import type { Metadata } from 'next'
export const revalidate = 3600
import TradePage from './TradePage'
import { sql } from '@/lib/db'
import type { MetalImages } from '@/types/products'
import type { FlexCardData } from './TradePage'

export const metadata: Metadata = {
  title: 'Extent™ Flex Bracelet · Bez Ambar',
  description: 'Extent Flex Bracelet by Bez Ambar: diamond line bracelets with no clasp, made in Los Angeles. For retailers.',
  robots: { index: false, follow: false },
}

const METAL_LABEL_TO_KEY: Record<string, string> = {
  'Platinum':    'platinum',
  'Rose Gold':   'rose_gold',
  'Yellow Gold': 'yellow_gold',
}

function deriveCut(sku: string): 'round' | 'emerald' | 'asscher' {
  const u = sku.toUpperCase()
  if (/5FLXEM/.test(u)) return 'emerald'
  if (/ASC/.test(u)) return 'asscher'
  return 'round'
}

export default async function TradeFlexPage() {
  let dbCards: FlexCardData[] = []

  try {
    const rows = await sql<{
      sku: string
      slug: string | null
      stone_weight_each: string | null
      total_carat_weight: string | null
      metal_images: MetalImages | null
      available_metals: string[] | null
    }>(
      `SELECT sku, slug, stone_weight_each, total_carat_weight,
              metal_images, available_metals
       FROM products
       WHERE sku LIKE '5FLX%' AND product_channel = 'Trade' AND active = true
       ORDER BY sort_order ASC, sku ASC`,
    )

    for (const row of rows) {
      const mi = row.metal_images
      const am = row.available_metals
      if (!mi || !am) {
        console.warn(`TradeFlexPage: skipping ${row.sku} — missing metal_images or available_metals`)
        continue
      }

      const metals: FlexCardData['metals'] = []
      for (const metalLabel of am) {
        const metalKey = METAL_LABEL_TO_KEY[metalLabel]
        if (!metalKey) continue
        const front = mi[metalKey as keyof MetalImages]?.front
        if (!front) continue
        metals.push({ key: metalKey, label: metalLabel, image: front })
      }
      if (metals.length === 0) {
        console.warn(`TradeFlexPage: skipping ${row.sku} — no valid metals resolved`)
        continue
      }

      const ctLabel = row.total_carat_weight ? 'ct tw' : 'ct each'
      const ct = row.total_carat_weight
        ? parseFloat(row.total_carat_weight)
        : row.stone_weight_each
          ? parseFloat(row.stone_weight_each)
          : 0

      dbCards.push({
        id: row.sku,
        sku: row.sku,
        slug: row.slug ?? undefined,
        cut: deriveCut(row.sku),
        ct,
        ctLabel,
        metals,
      })
    }
  } catch (e) {
    console.error('TradeFlexPage: DB query failed', e)
  }

  return <TradePage dbCards={dbCards} />
}
