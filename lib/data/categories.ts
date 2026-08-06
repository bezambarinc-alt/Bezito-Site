/**
 * Category metadata — drives the [category] listing page hero + SEO.
 * Extracted from page.tsx so the component stays logic-only.
 */

export interface CategoryMeta {
  eyebrow: string
  title: string
  intro: string
  videoUrl?: string
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  rings: {
    eyebrow: 'The Collection',
    title: 'Rings',
    intro: 'Engagement, cocktail, and eternity — each stone chiseled to catch the light.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Rings/c0578_4k_v1_2160p_wwnfcz.mp4',
  },
  bracelets: {
    eyebrow: 'The Collection',
    title: 'Bracelets',
    intro: 'Articulated lines of brilliance for the wrist.',
    videoUrl:
      'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
  },
  necklaces: {
    eyebrow: 'The Collection',
    title: 'Necklaces',
    intro: 'Statement and everyday, drawn from the atelier.',
  },
  earrings: {
    eyebrow: 'The Collection',
    title: 'Earrings',
    intro: 'Studs, drops, and hoops in signature Bez Ambar cuts.',
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
  pendants: {
    eyebrow: 'The Collection',
    title: 'Pendants',
    intro: 'Stone and metal, suspended — from the simplest to the exceptional.',
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
