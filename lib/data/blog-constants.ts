/**
 * blog-constants.ts — client-safe blog types + category labels.
 * No server-only deps; safe to import in client components.
 */

/** Full post (index detail page). */
export interface BlogPost {
  slug: string
  title: string
  date: string
  updatedDate: string | null
  category: string
  excerpt: string
  heroImage: string | null
  heroVideo: string | null
  heroImageAlt: string | null
  author: string
  status: string
  schemaType: string | null
  schemaFaq: boolean
  body: string
}

/** Lightweight card (index grid) — no body. */
export interface BlogCard {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  heroImage: string | null
  heroImageAlt: string | null
}

/** Category slugs → display labels (mirrors the Astro category set). */
export const BLOG_CATEGORY_LABELS: Record<string, string> = {
  all:                'All',
  'engagement-rings': 'Engagement Rings',
  diamonds:           'Diamonds',
  'colored-stones':   'Colored Stones',
  guides:             'Guides',
  earrings:           'Earrings',
  necklaces:          'Necklaces',
  bracelets:          'Bracelets',
  'wedding-rings':    'Wedding Rings',
  'mens-jewelry':     "Men's Jewelry",
  'jewelry-care':     'Jewelry Care',
  craftsmanship:      'Craftsmanship',
  brand:              'The House',
}

export function blogCategoryLabel(cat: string): string {
  return BLOG_CATEGORY_LABELS[cat] ?? cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
