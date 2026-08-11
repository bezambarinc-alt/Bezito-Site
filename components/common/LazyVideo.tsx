'use client'

/**
 * LazyVideo — viewport-triggered autoplay video.
 *
 * Uses react-intersection-observer (already a project dependency) to
 * observe the video element itself. When it enters the viewport (or comes
 * within `rootMargin`), the src is set imperatively and play() is called.
 *
 * Accepts all standard <video> attributes via rest-props so it can be used
 * as a drop-in replacement for any raw <video> that was previously loading
 * eagerly (ProductCard, category spotlights, HomeSegment, etc.).
 *
 * Do NOT use this for the above-fold hero — use HeroVideo (poster-crossfade)
 * for that. This is for everything below the fold.
 */

import { useInView } from 'react-intersection-observer'
import type { VideoHTMLAttributes } from 'react'

interface Props extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string
  /** How far before entering the viewport to start loading. Default: 200px */
  rootMargin?: string
}

export default function LazyVideo({
  src,
  rootMargin = '200px 0px',
  className,
  poster,
  ...rest
}: Props) {
  const { ref } = useInView({
    triggerOnce: true,
    rootMargin,
    onChange: (inView, entry) => {
      if (!inView) return
      const video = entry.target as HTMLVideoElement
      if (video.src) return // already loaded
      video.src = src
      video.load()
      video.play().catch(() => {
        // Autoplay blocked — browser will show poster/controls
      })
    },
  })

  return (
    <video
      ref={ref}
      preload="none"
      poster={poster}
      muted
      loop
      playsInline
      className={className}
      {...rest}
    />
  )
}
