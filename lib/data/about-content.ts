/**
 * Content for the About Bez Ambar page.
 * Extracted so page.tsx stays logic-only.
 */

export interface StatItem {
  number: string
  label: string
}

export const STATS: StatItem[] = [
  { number: '1979', label: 'Founded in Los Angeles' },
  { number: '3',    label: 'Patented Diamond Cuts' },
  { number: '47+',  label: 'Years of Innovation' },
  { number: '1982', label: 'Inventor of the Princess Cut' },
]
