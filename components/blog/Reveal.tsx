'use client'

import { useEffect, useRef } from 'react'
import styles from './Reveal.module.css'

/**
 * Reveal — isolated scroll-reveal wrapper.
 *
 * Self-contained: uses IntersectionObserver to add an `is-in` class once the
 * element enters the viewport. No layout shift (opacity + small translateY only),
 * respects prefers-reduced-motion, and degrades to visible if JS/IO is absent.
 *
 * Deliberately narrow so it can never break page layout — it only animates its
 * own opacity/transform, never affects siblings' box model.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  as?: React.ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)

  // The reveal is a single class toggle on our own node, so it is applied
  // straight to the DOM rather than held in React state — no re-render, and
  // no cascading render pass for every Reveal on the page.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reveal = () => el.classList.add(styles.in)
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      reveal()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal()
            io.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
