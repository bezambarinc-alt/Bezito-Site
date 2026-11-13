import type { Metadata } from 'next'
export const revalidate = 3600

import { cache } from 'react'
import { notFound } from 'next/navigation'
import { getProductBySlug, getTradeRelatedByCut } from '@/lib/queries'
import TradePDP, { tradeDisplayTitle } from './TradePDP'

function cutSkuPattern(sku: string): string {
  const u = sku.toUpperCase()
  if (/5FLXEM/.test(u)) return '5FLXEM%'
  if (/ASC/.test(u)) return '%ASC%'
  return '5FLX%'
}

// Dedupe the product lookup between generateMetadata and the page render.
const getTradeProduct = cache(async (slug: string) => {
  const product = await getProductBySlug(slug)
  if (!product || product.productChannel !== 'Trade') return null
  return product
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>
}): Promise<Metadata> {
  const { sku } = await params
  const product = await getTradeProduct(sku)
  if (!product) {
    return { title: { absolute: 'Piece Not Found · Bez Ambar Trade' }, robots: { index: false, follow: false } }
  }
  return {
    // absolute: bypass the root '%s · Bez Ambar' template so the title isn't doubled
    title: { absolute: `${tradeDisplayTitle(product)} · ${product.sku} · Bez Ambar Trade` },
    robots: { index: false, follow: false },
  }
}

export default async function TradeFlexPDPPage({
  params,
}: {
  params: Promise<{ sku: string }>
}) {
  const { sku } = await params
  const product = await getTradeProduct(sku)
  if (!product) notFound()

  const related = await getTradeRelatedByCut(cutSkuPattern(product.sku), product.slug)

  return <TradePDP product={product} related={related} />
}
