import type { Metadata } from 'next'
import PasswordGate from './PasswordGate'
import TradePage from './TradePage'

export const metadata: Metadata = {
  title: 'The Flex Collection · Bez Ambar',
  description: 'The Flex collection by Bez Ambar: diamond line bracelets with no clasp, made in Los Angeles. For retailers.',
  robots: { index: false, follow: false },
}

export default function TradeFlexPage() {
  return (
    <PasswordGate>
      <TradePage />
    </PasswordGate>
  )
}
