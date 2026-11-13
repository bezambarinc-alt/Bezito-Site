import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getProductBySlug, getTradeRelatedByCut } from '@/lib/queries'
import TradePDP from './TradePDP'

function cutSkuPattern(sku: string): string {
  const u = sku.toUpperCase()
  if (/5FLXEM/.test(u)) return '5FLXEM%'
  if (/ASC/.test(u)) return '%ASC%'
  return '5FLX%'
}

export const metadata: Metadata = {
  title: 'Flex · Bez Ambar Trade',
  robots: { index: false, follow: false },
}

export default async function TradeFlexPDPPage({
  params,
  searchParams,
}: {
  params: Promise<{ sku: string }>
  searchParams: Promise<{ metal?: string }>
}) {
  const [{ sku }, { metal }] = await Promise.all([params, searchParams])
  const product = await getProductBySlug(sku)
  if (!product) notFound()
  if (product.productChannel !== 'Trade') notFound()

  const related = await getTradeRelatedByCut(cutSkuPattern(product.sku), product.slug)

  return <TradePDP product={product} selectedMetal={metal} related={related} />
}
