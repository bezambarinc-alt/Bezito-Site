'use client'

import { useState, useEffect, useRef } from 'react'
import ScrollWipeCarousel from './ScrollWipeCarousel'
import type { CarouselSlide } from '@/lib/data/home-slides'

interface Props {
  slides: [CarouselSlide, CarouselSlide]
}

/**
 * Defers mounting ScrollWipeCarousel until 800px before viewport entry.
 * Placeholder is the same 200vh height as the real carousel — no layout shift.
 * Prevents the cinematic section's video and scroll listener from loading at page init.
 * Uses a direct import (not next/dynamic) since the chunk is already in the main bundle.
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
