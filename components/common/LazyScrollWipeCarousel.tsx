'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { CarouselSlide } from '@/lib/data/home-slides'

const ScrollWipeCarousel = dynamic(
  () => import('./ScrollWipeCarousel'),
  { ssr: false },
)

interface Props {
  slides: [CarouselSlide, CarouselSlide]
}

/**
 * Defers mounting ScrollWipeCarousel until 800px before viewport entry.
 * Placeholder is the same 200vh height as the real carousel to avoid layout shift.
 * Prevents the cinematic section's preload="auto" video from loading at page init.
 */
export default function LazyScrollWipeCarousel({ slides }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!mounted) {
    return (
      <div
        ref={sentinelRef}
        style={{ height: '200vh', background: '#000' }}
        aria-hidden="true"
      />
    )
  }

  return <ScrollWipeCarousel slides={slides} />
}
