import type { Metadata } from 'next'
import HeroCarousel from '@/components/home/HeroCarousel'
import HomeSegment from '@/components/home/HomeSegment'
import HomeHeroImage from '@/components/home/HomeHeroImage'
import CinematicCarousel from '@/components/home/CinematicCarousel'
import Newsletter from '@/components/home/Newsletter'

export const metadata: Metadata = {
  title: 'Bez Ambar — Chiseling Light',
  description:
    'Inventor of the Princess Cut. Fine jewelry from the Los Angeles atelier, since 1979.',
}

const segments = [
  {
    id: 'foundation',
    reverse: true,
    imageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/v1785629661/Diamond_Design_Hero_eoykbn.avif',
    eyebrow: 'Designing Diamond Cuts Since 1979',
    title: "We Don't Just Cut the Stone. We Design the Cut.",
    body: "Most jewelry houses source pre-cut diamonds and build around them. Some cut their own—using other people's geometries. Bez Ambar designs the facets themselves, executes every cut in-house, and shapes each stone to fit its exact position in the piece. That's not craftsmanship. It's a different discipline entirely.",
  },
  {
    id: 'cuts',
    reverse: false,
    imageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    eyebrow: 'The Cuts',
    title: 'From the Princess to the Elysian',
    body: 'Bez Ambar is one of the original architects of the modern princess cut—a cut now part of the global language of fine jewelry. The same instinct continues through the Blaze®, the Elysian Cut™ and everything that follows.',
    ctaLabel: 'Discover the Cuts',
    ctaHref: '/elysian-cut',
  },
  {
    id: 'atelier',
    reverse: true,
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/Jewelry%20Videos/Rings/Ring_CAD_DESIG_c9mnsf_1_v8f2bq.mp4',
    eyebrow: 'The Design',
    title: 'Drawn, Engineered, Finished by Hand',
    body: 'For decades Bez Ambar has pushed the diamond cutting and faceting industry—treating every component as an act of high artistry. We honour the tools of tradition while constantly searching for new directions in style, technology, and technique. Everything we make arrives at uncompromised excellence.',
    ctaLabel: 'Inside the Atelier',
    ctaHref: '/about-bez-ambar',
  },
  {
    id: 'work',
    reverse: false,
    imageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/v1782520989/Jewelry%20Images/Rings/plisse/plisse_macro.jpg',
    eyebrow: 'The Details',
    title: 'A Commitment to Perfection',
    body: "We don't source stones and build around them. We cut every stone to fit its exact position in the piece—using our own diamond cutting facility and deep faceting expertise. Each stone is shaped, calibrated, and set so nothing is ever off. Not by a degree. Not ever.",
  },
  {
    id: 'service',
    reverse: false,
    noMedia: true,
    eyebrow: 'Our Service',
    title: 'We Are Committed to Service',
    body: "We repair or restore any piece manufactured by Bez Ambar since 1979—regardless of its age. If we made it, we stand behind it. Bring it back. We'll make it right.",
  },
  {
    id: 'private',
    reverse: false,
    imageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1200/v1785654364/find_a_retailer_in1kpt.avif',
    eyebrow: 'Private Viewing',
    title: 'By Appointment, with the Concierge',
    body: "Some pieces ask to be seen alone. Arrange a private viewing at the Los Angeles atelier—an existing piece, a single stone, or a commission of your own. Our concierge will guide you through the collection personally. No showroom, no crowd. Just the work, and the people who know it best.",
    ctaLabel: 'Arrange a Private Consultation',
    openConcierge: true,
  },
]

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      <HomeSegment {...segments[0]} />
      <HomeSegment {...segments[1]} />

      <HomeHeroImage
        imageUrl="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1800/v1785615928/Hero-Model-Earrings-Yellow-Black-Shhhh_copy_uibife.avif"
        height={600}
        eyebrow="The Secret"
        title="SHHH"
        sub="Bez Ambar. Los Angeles. Est. 1979."
        textDark
      />

      <HomeSegment {...segments[2]} />
      <HomeSegment {...segments[3]} />

      <HomeHeroImage
        imageUrl="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1800/Jewelry%20Images/Atelier/designer-portrait-2026.jpg"
        height={700}
        eyebrow="Bez Ambar"
        title="Chiseling Light"
        sub="Los Angeles · Since 1979"
      />

      <HomeSegment {...segments[4]} />
      <HomeSegment {...segments[5]} />

      <CinematicCarousel />
      <Newsletter />
    </>
  )
}
