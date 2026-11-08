'use client'

import { useSearchParams } from 'next/navigation'
import TradeGallery from './TradeGallery'
import type { MetalOption } from './MetalSwitcher'

interface Props {
  metals: MetalOption[]
  defaultSlots: string[]
  displayName: string
  ijewelUrl: string | null
  heroIsIJewel: boolean
}

function buildMetalSlots(images: MetalOption['images'], hasMedia: boolean, fallback: string): string[] {
  // Order: Front, Angled, Top
  const slots = [images.front, images.angled, images.top].filter((u): u is string => Boolean(u))
  if (!hasMedia) {
    while (slots.length < 6) slots.push(fallback)
    return slots.slice(0, 6)
  }
  return slots.slice(0, 3)
}

export default function TradePDPClient({ metals, defaultSlots, displayName, ijewelUrl, heroIsIJewel }: Props) {
  const searchParams = useSearchParams()
  const selectedKey = searchParams?.get('metal') ?? metals[0]?.key

  const activeMetal = metals.find(m => m.key === selectedKey) ?? metals[0]
  const videoUrl = activeMetal?.images.video ?? undefined
  const closeupUrl = activeMetal?.images.closeup ?? undefined
  const hasMedia = Boolean(videoUrl || closeupUrl)
  const slots = activeMetal
    ? buildMetalSlots(activeMetal.images, hasMedia, defaultSlots[0] ?? '')
    : defaultSlots

  return (
    <TradeGallery
      slots={slots}
      displayName={displayName}
      ijewelUrl={ijewelUrl}
      heroIsIJewel={heroIsIJewel}
      videoUrl={videoUrl}
      closeupUrl={closeupUrl}
    />
  )
}
