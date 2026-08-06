/**
 * HeroCarousel — scroll-wipe hero at the top of the home page.
 * Text is left-aligned (bottom-left position), matching Astro hero-stack.
 * Thin wrapper around the shared ScrollWipeCarousel component.
 */
import ScrollWipeCarousel from '@/components/common/ScrollWipeCarousel'
import { HERO_SLIDES } from '@/lib/data/home-slides'

export default function HeroCarousel() {
  return <ScrollWipeCarousel slides={HERO_SLIDES} textAlign="left" />
}
