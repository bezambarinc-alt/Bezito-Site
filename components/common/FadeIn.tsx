'use client'

/**
 * FadeIn — luxury scroll-reveal using motion/react.
 *
 * whileInView handles viewport detection internally (no IntersectionObserver
 * boilerplate). Respects prefers-reduced-motion automatically.
 *
 * Use for: text blocks, cards, editorial sections, pull quotes, CTAs.
 * Do NOT use for: above-fold heroes (HeroVideo handles that),
 *                  videos (LazyVideo handles that),
 *                  archive or journal pages.
 *
 * delay is in SECONDS (motion standard). Default easing matches the
 * luxury pace used on the hero overlay.
 */

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const EASE = [0.25, 0.1, 0.25, 1] as const

// Server Components can't import motion/react directly (it needs 'use client').
// `as` lets a page keep its semantic element — <header>, <section> — instead of
// reaching for motion.* itself and crashing the route at render time.
const TAGS = {
  div: motion.div,
  header: motion.header,
  section: motion.section,
  article: motion.article,
} as const

interface Props {
  children: ReactNode
  /** Seconds before the animation starts. Use to stagger sibling elements. */
  delay?: number
  /** Vertical offset to drift from. Default 20px. */
  y?: number
  className?: string
  /** Rendered element. Default 'div'. */
  as?: keyof typeof TAGS
}

export default function FadeIn({ children, delay = 0, y = 20, className, as = 'div' }: Props) {
  const Tag = TAGS[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </Tag>
  )
}
