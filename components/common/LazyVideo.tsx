'use client'

/**
 * LazyVideo — viewport-triggered autoplay video with pause on exit.
 *
 * Uses react-intersection-observer (already a project dependency).
 * - Loads + plays when the element enters 200px before the viewport.
 * - Pauses when it exits the viewport (saves GPU on large grids).
 *
 * Do NOT use for above-fold heroes — use HeroVideo (poster-crossfade) for that.
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
    triggerOnce: false, // must stay false to detect exit for pause
    rootMargin,
    onChange: (inView, entry) => {
      const video = entry.target as HTMLVideoElement
      if (inView) {
        if (!video.src) {
          video.src = src
          video.load()
        }
        // Wait for enough data before calling play() — more reliable cross-browser
        const doPlay = () => video.play().catch(() => {})
        if (video.readyState >= 2) {
          doPlay()
        } else {
          video.addEventListener('canplay', doPlay, { once: true })
        }
      } else if (video.src) {
        video.pause()
      }
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
