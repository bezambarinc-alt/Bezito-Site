/** Chapter data for The Story page. Ported from Astro the-story.astro. */

export type Chapter = {
  year: string
  layout: 'horz' | 'normal' | 'split'
  reverse?: boolean
  headline: string
  body: string
  pullquote?: string
  img?: { src: string; alt: string }
  video?: { src: string; poster: string }
}

export const CHAPTERS: Chapter[] = [
  {
    year: '1955',
    layout: 'horz',
    headline: 'Born in Jerusalem.',
    body: 'Bez Ambar is born in Jerusalem to a family with deep roots in the trade districts of the Old City. He grows up surrounded by craftsmen — goldsmiths, silversmiths, stonecutters — learning to read materials the way other children learn to read words. The obsession starts here.',
  },
  {
    year: '1972',
    layout: 'normal',
    headline: 'First Stones.',
    body: 'At seventeen, Bez begins working with rough diamonds in Tel Aviv, apprenticing under senior cutters who still plan facets by hand. He learns that a diamond is not a fixed object — it is potential waiting to be released. The difference between a diamond that dies in the light and one that lives in it is entirely in how it is cut.',
  },
  {
    year: '1979',
    layout: 'split',
    headline: 'Los Angeles. The Beginning.',
    body: 'Bez Ambar arrives in Los Angeles and founds Ambar Diamonds Inc. He comes as a cutter, not a retailer — his clients are the jewelers, not the public. Working out of a small studio on 611 Wilshire Blvd, he begins pushing the boundaries of what a square diamond can do. The industry knows him as the man who will not cut a stone the conventional way.',
    img: {
      src: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
      alt: 'Quadrillion stone — the square brilliant that launched the Princess Cut lineage',
    },
  },
  {
    year: '1982',
    layout: 'split',
    reverse: true,
    headline: 'The Princess Cut.',
    body: "The Quadrillion® cut is introduced: a square brilliant with chevron facets that direct light inward and back up through the table. It becomes the most commercially successful new diamond cut of the twentieth century. Jewelers across the world adopt it. It is later widely known as the Princess Cut — Bez's cut, under a different name.",
    pullquote: '"The square was considered a compromise. I wanted to prove it was a statement."',
    img: {
      src: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
      alt: 'The Quadrillion® — the original Princess Cut',
    },
  },
  {
    year: '1985',
    layout: 'horz',
    headline: 'The De Beers Award.',
    body: "Bez receives the De Beers Diamond Award for Innovation — recognition from the most powerful institution in the diamond trade that a cutter working independently in Los Angeles has changed the industry. It is one of the most prestigious honors in the field, and he is among the youngest recipients in the award's history.",
  },
  {
    year: '1988',
    layout: 'split',
    reverse: true,
    headline: 'The Laserset® Setting.',
    body: 'Precision laser-cut channels allow diamonds to be set directly into metal with no prong interference, no bezel wall — nothing between the stone and the light. The Laserset® setting gives Bez\'s pieces their signature floating quality: stones suspended in metal as if held by tension alone.',
    img: {
      src: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1782876014/Jewelry%20Images/Necklaces/single-row-lifestyle.jpg',
      alt: 'Single row flex bracelet — Laserset® channel setting',
    },
  },
  {
    year: '1992',
    layout: 'normal',
    headline: 'The Boundless Setting.',
    body: "Continuous channel setting — stone after stone, edge to edge, with no visible interruption — becomes commercially viable through Bez's manufacturing breakthroughs. The result is what the trade calls \"seamless\" flex work: lines of diamonds that move like fabric. The Boundless setting defines the flex bracelet form that becomes a Bez Ambar signature across four decades.",
  },
  {
    year: '1999',
    layout: 'split',
    headline: 'Micro-Pavé.',
    body: 'Bez introduces micro-pavé setting to the Los Angeles market — a technique requiring stones smaller than 1mm, set under magnification with hand-cut prongs barely visible to the naked eye. The effect is a continuous field of light rather than individual stones. The technique redefines what delicate means in fine jewelry.',
    img: {
      src: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775549202/Jewelry%20Images/Rings/C0625_Baguette_band_Master_e4azkj.jpg',
      alt: 'Baguette band — micro-pavé and channel setting combined',
    },
  },
  {
    year: '2003',
    layout: 'split',
    reverse: true,
    headline: 'The Blaze®.',
    body: 'The Blaze® accent stone is introduced — a patent-pending triangular brilliant cut designed to nestle against channel-set stones and amplify their collective light output. Where previous accent cuts sat passively between main stones, the Blaze® interacts with them, redirecting light across the setting. It becomes a registered trademark and a protected design innovation.',
    video: {
      src: 'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026.mp4',
      poster:
        'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1782876014/Jewelry%20Images/Necklaces/single-row-lifestyle.jpg',
    },
  },
  {
    year: '2015',
    layout: 'split',
    headline: 'The Elysian Cut™.',
    body: 'The Elysian Cut™ — a family of new step-cut geometries engineered for maximum face-up brilliance. More facets. Tighter tolerances. Built for the way light behaves at this scale when precision manufacturing finally makes it possible. Seven shapes, one calibration standard. The Elysian Cut™ represents four decades of refinement distilled into a system.',
    img: {
      src: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779074065/Jewelry%20Images/Stones/Elysian_cut_oval_qcdt5r.jpg',
      alt: 'Elysian Cut™ — the latest evolution of the step-cut brilliant',
    },
  },
  {
    year: '2026',
    layout: 'normal',
    headline: 'Still Cutting.',
    body: 'Forty-seven years after arriving in Los Angeles with a set of cutting tools and an argument about square diamonds, Bez Ambar is still in the studio. The collection today spans single-row flex bracelets, channel-set rings, Asscher and emerald-cut pieces, and bespoke commissions for clients who understand that a piece of jewelry is not bought — it is acquired. The work continues.',
    pullquote: '"The cut is not a style. It is a solution."',
    video: {
      src: 'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/v1783061546/Jewelry%20Videos/Rings/c0747-hd-2026.mp4',
      poster:
        'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775549202/Jewelry%20Images/Rings/C0625_Baguette_band_Master_e4azkj.jpg',
    },
  },
]

export const STORY_YEARS = CHAPTERS.map((ch) => ch.year)
