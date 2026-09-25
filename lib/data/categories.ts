/**
 * Category metadata — drives the [category] listing page hero + SEO.
 * Extracted from page.tsx so the component stays logic-only.
 */

export interface CategoryMeta {
  eyebrow: string
  title: string
  intro: string
  videoUrl?: string
  heroImageUrl?: string
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  rings: {
    eyebrow: 'The Collection',
    title: 'Rings',
    intro: 'Engagement, cocktail, and eternity — each stone chiseled to catch the light.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1786669104/C0765-HD.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1790377646/Jewelry%20Images/Rings/rings-hero.avif',
  },
  bands: {
    eyebrow: 'The Collection',
    title: 'Bands',
    intro: 'Eternity bands and wedding bands — one continuous line of light.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/v1787612988/Jewelry%20Images/Bands/C0786-concept.avif',
  },
  bracelets: {
    eyebrow: 'The Collection',
    title: 'Bracelets',
    intro: 'Articulated lines of brilliance for the wrist.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/Jewelry%20Images/Bracelets/axiom-bracelet-model-shot.jpg',
  },
  necklaces: {
    eyebrow: 'The Collection',
    title: 'Necklaces',
    intro: 'Statement and everyday, drawn from the atelier.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1779254420/Jewelry%20Videos/Necklaces/C0508_4k_noykv3.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/v1787797461/Jewelry%20Images/Necklaces/C0711-concept.avif',
  },
  earrings: {
    eyebrow: 'The Collection',
    title: 'Earrings',
    intro: 'Studs, drops, and hoops in signature Bez Ambar cuts.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Earrings/R09059_4k_final_diylja.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/v1775202736/Jewelry%20Videos/Earrings/Hero_Earrings_lu15zz.jpg',
  },
  pendants: {
    eyebrow: 'The Collection',
    title: 'Pendants',
    intro: 'Single stones and sculptural forms — light held at the throat.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1784671452/Jewelry%20Videos/Pendants/C0785_qkjsfm.mp4',
    heroImageUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/v1787871120/Jewelry%20Images/Pendants/C0346-concept.avif',
  },
  'wedding-bands': {
    eyebrow: 'The Collection',
    title: 'Wedding Bands',
    intro: 'Eternity bands and wedding rings — the Elysian Cut™ in continuous line.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4',
  },
  'engagement-rings': {
    eyebrow: 'The Collection',
    title: 'Engagement Rings',
    intro: 'Every engagement ring begins with the stone. We cut it here.',
  },
}

/** Human-readable label for breadcrumbs. */
export const CATEGORY_LABELS: Record<string, string> = {
  rings: 'Rings',
  bracelets: 'Bracelets',
  necklaces: 'Necklaces',
  earrings: 'Earrings',
  'wedding-bands': 'Wedding Bands',
  'engagement-rings': 'Engagement Rings',
  pendants: 'Pendants',
}

/**
 * Canonical display order matching the live Astro site nav.
 * getActiveCategories() sorts by this; unknowns fall to the end.
 */
export const CATEGORY_ORDER = [
  'rings',
  'bands',
  'bracelets',
  'earrings',
  'necklaces',
  'pendants',
  'wedding-bands',
  'engagement-rings',
]

/** Fallback for unknown slugs. */
export function getCategoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORIES[slug] ?? {
      eyebrow: 'The Collection',
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      intro: 'From the Bez Ambar atelier.',
    }
  )
}

export function getCategoryLabel(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}
