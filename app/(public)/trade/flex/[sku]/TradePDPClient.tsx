'use client'

import TradeGallery from './TradeGallery'
import { useSelectedMetal } from './MetalSwitcher'
import type { MetalOption } from './MetalSwitcher'

interface Props {
  metals: MetalOption[]
  defaultSlots: string[]
  displayName: string
  ijewelUrl: string | null
  heroIsIJewel: boolean
}

function buildMetalSlots(images: MetalOption['images']): string[] {
  // Order: Front, Model, Angled, Top (Turntable / Close-up videos are appended by TradeGallery).
  // Only real images — no padding with repeats.
  return [images.front, images.model, images.angled, images.top]
    .filter((u): u is string => Boolean(u))
    .slice(0, 6)
}

export default function TradePDPClient({ metals, defaultSlots, displayName, ijewelUrl, heroIsIJewel }: Props) {
  // Reads ?metal= on the client; the parent <Suspense> in TradePDP covers the
  // useSearchParams CSR bailout on the statically rendered (ISR) page.
  const activeMetal = useSelectedMetal(metals)
  const videoUrl = activeMetal?.images.video ?? undefined
  const closeupUrl = activeMetal?.images.closeup ?? undefined
  const slots = activeMetal ? buildMetalSlots(activeMetal.images) : defaultSlots

  const modelSrc = activeMetal?.images.model ?? undefined

  return (
    <TradeGallery
      slots={slots}
      displayName={displayName}
      ijewelUrl={ijewelUrl}
      heroIsIJewel={heroIsIJewel}
      videoUrl={videoUrl}
      closeupUrl={closeupUrl}
      modelSrc={modelSrc}
    />
  )
}
