/**
 * CinematicCarousel — second scroll-wipe video section on the home page.
 * Text is BOTTOM-LEFT, same as the hero. Astro's .cinematic__content uses the
 * identical layout as .hero__content (position:absolute; left:clamp(40px,6vw,80px);
 * bottom; text-align:left) — it is NOT centered. My earlier `textAlign="center"`
 * was a bug; corrected to match both Astro and the hero carousel.
 * Thin wrapper around the shared ScrollWipeCarousel component.
 */
import ScrollWipeCarousel from '@/components/common/ScrollWipeCarousel'
import { CINEMATIC_SLIDES } from '@/lib/data/home-slides'

export default function CinematicCarousel() {
  return <ScrollWipeCarousel slides={CINEMATIC_SLIDES} textAlign="left" />
}
