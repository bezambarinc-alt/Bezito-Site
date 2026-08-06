'use client'

/**
 * ChapterReveal — motion.div wrapper that stagger-reveals children as the
 * chapter scrolls into view. Matches Astro's .fadein-el behavior:
 *   initial:    opacity 0, translateY 28px
 *   visible:    opacity 1, translateY 0
 *   easing:     cubic-bezier(0.22, 1, 0.36, 1) — from story.css
 *   duration:   0.75s
 *   stagger:    0.1s between children
 *
 * ChapterReveal  = the container (triggers whileInView)
 * AnimateChild   = each individual animated child inside the container
 *
 * Usage (RSC parent passes children and HTML attrs):
 *   <ChapterReveal className={styles.chapter} id="year-1982" data-year="1982">
 *     <AnimateChild><p className={styles.ynum}>1982</p></AnimateChild>
 *     <AnimateChild><h2>The Princess Cut.</h2></AnimateChild>
 *     <AnimateChild><p>Body text…</p></AnimateChild>
 *   </ChapterReveal>
 */

import { motion, type HTMLMotionProps } from 'motion/react'

// ── Variants ──────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as number[], // story.css cubic-bezier
    },
  },
}

// ── Components ────────────────────────────────────────────────────────────────

type DivProps = HTMLMotionProps<'div'>

/**
 * Container — triggers the reveal when scrolled into view.
 * Forwards id, data-*, className and all other HTML attributes to the motion.div.
 */
export function ChapterReveal({ children, ...rest }: DivProps) {
  return (
    <motion.div
      {...rest}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12% 0px' }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual animated child — picks up itemVariants from the parent container.
 * Wrap any block-level element you want to reveal with this.
 */
export function AnimateChild({ children, ...rest }: DivProps) {
  return (
    <motion.div {...rest} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
