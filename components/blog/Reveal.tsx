'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
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
      className={`${styles.reveal} ${shown ? styles.in : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
