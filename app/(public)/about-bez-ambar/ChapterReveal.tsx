'use client'

/**
 * ChapterReveal — motion.div wrapper that stagger-reveals children as the
 * chapter scrolls into view (About page copy of the-story's component).
 *   initial:   opacity 0, translateY 28px
 *   visible:   opacity 1, translateY 0
 *   easing:    cubic-bezier(0.22, 1, 0.36, 1)
 *   duration:  0.75s   ·   stagger: 0.1s between children
 *
 * ChapterReveal = container (triggers whileInView)
 * AnimateChild  = each animated child inside the container
 */

import { motion, type HTMLMotionProps } from 'motion/react'

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
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
}

type DivProps = HTMLMotionProps<'div'>

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

export function AnimateChild({ children, ...rest }: DivProps) {
  return (
    <motion.div {...rest} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
