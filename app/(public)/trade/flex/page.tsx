import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import TradePage from './TradePage'

export const metadata: Metadata = {
  title: 'Extent™ Flex Bracelet · Bez Ambar',
  description: 'Extent Flex Bracelet by Bez Ambar: diamond line bracelets with no clasp, made in Los Angeles. For retailers.',
  robots: { index: false, follow: false },
}

export default function TradeFlexPage() {
  return <TradePage />
}
