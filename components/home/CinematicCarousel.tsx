/**
 * CinematicCarousel — second scroll-wipe video section on the home page.
 * Text is centered, matching Astro cinematic-stack pattern.
 * Thin wrapper around the shared ScrollWipeCarousel component.
 */
import ScrollWipeCarousel from '@/components/common/ScrollWipeCarousel'
import { CINEMATIC_SLIDES } from '@/lib/data/home-slides'

export default function CinematicCarousel() {
  return <ScrollWipeCarousel slides={CINEMATIC_SLIDES} textAlign="center" />
}
