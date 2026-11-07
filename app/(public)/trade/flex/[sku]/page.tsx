import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries'
import TradePDP from './TradePDP'

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

  return <TradePDP product={product} selectedMetal={metal} />
}
