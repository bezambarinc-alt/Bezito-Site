/**
 * Content for the About Bez Ambar page.
 * Extracted so page.tsx stays logic-only.
 */

export interface StatItem {
  number: string
  label: string
}

export interface TimelineEntry {
  year: string
  title: string
  body: string
  imgUrl?: string
  imgAlt?: string
}

export const STATS: StatItem[] = [
  { number: '1979', label: 'Founded in Los Angeles' },
  { number: '3',    label: 'Patented Diamond Cuts' },
  { number: '45+',  label: 'Years of Innovation' },
  { number: '1982', label: 'Inventor of the Princess Cut' },
]

export const TIMELINE: TimelineEntry[] = [
  {
    year: '1979',
    title: 'Los Angeles. The Beginning.',
    body: 'Bez Ambar arrives in Los Angeles and founds Ambar Diamonds Inc. He comes as a cutter, not a retailer. From the first day, the studio is where the work begins — not where finished pieces arrive from somewhere else.',
  },
  {
    year: '1982',
    title: 'The Princess Cut',
    body: 'The Quadrillion® cut is introduced: a square brilliant that delivers the fire of a round diamond inside a clean, modern geometry. The trade adopts it immediately. The world eventually calls it the Princess cut. It becomes the most popular diamond shape on Earth.',
    imgUrl:
      'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_600/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    imgAlt: 'The Quadrillion® Princess Cut diamond by Bez Ambar, 1982',
  },
  {
    year: '1985',
    title: 'The DeBeers Award',
    body: "The ATW Quadrillion® ring receives the DeBeers Award, one of the diamond industry's most recognized honors. The cut is now an industry standard.",
  },
  {
    year: '1988',
    title: 'The Laserset® Setting',
    body: 'The Laserset® is a rimless, prongless setting for square-cut diamonds. There is no metal at the edge of the stone. The diamond appears to float in the hand. It is the first setting of its kind.',
  },
  {
    year: '1992',
    title: 'The Boundless Setting',
    body: 'The same logic, applied to round diamonds. The Boundless setting removes the prong from the round brilliant, letting the stone sit clean in the hand without the visual interruption of metal at its edge.',
  },
  {
    year: '1999',
    title: 'Micro-Pavé',
    body: 'A new pavé technique enters the Bez Ambar atelier. The industry eventually names it Micro-Pavé. It is now one of the most widely used setting styles in fine jewelry.',
  },
  {
    year: '2003',
    title: 'The Blaze® Cut',
    body: 'The Blaze® cut is patented. Thirteen precisely aligned facets produce a starburst of light visible to the naked eye under white light. This effect is specific to the Blaze® geometry. No other house in the world produces it.',
  },
  {
    year: '2015',
    title: 'The Divine Cut®',
    body: "The Divine Cut® is introduced: a round brilliant engineered for a specific quality of dispersion, continuing the atelier's forty-year study of how light moves inside a cut stone.",
  },
]
