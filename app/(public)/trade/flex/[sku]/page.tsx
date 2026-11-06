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
}: {
  params: { sku: string }
}) {
  const product = await getProductBySlug(params.sku)
  if (!product) notFound()

  return <TradePDP product={product} />
}
