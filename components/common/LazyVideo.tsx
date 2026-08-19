'use client'

/**
 * LazyVideo — viewport-triggered autoplay video with pause on exit.
 *
 * Uses react-intersection-observer (already a project dependency).
 * - Loads + plays when the element enters 200px before the viewport.
 * - Pauses when it exits the viewport (saves GPU on large grids).
 * - Aborts buffering (src reset) when exiting before canplay fires,
 *   preventing decode-buffer accumulation on large category grids.
 *
 * Do NOT use for above-fold heroes — use HeroVideo (poster-crossfade) for that.
 */

import { useRef } from 'react'
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
  // Track pending canplay listener so we can remove it on exit
  const pendingPlay = useRef<(() => void) | null>(null)

  const { ref } = useInView({
    triggerOnce: false,
    rootMargin,
    onChange: (inView, entry) => {
      const video = entry.target as HTMLVideoElement
      if (inView) {
        if (!video.src) {
          video.src = src
          video.load()
        }
        const doPlay = () => {
          pendingPlay.current = null
          video.play().catch(() => {})
        }
        if (video.readyState >= 2) {
          doPlay()
        } else {
          pendingPlay.current = doPlay
          video.addEventListener('canplay', doPlay, { once: true })
        }
      } else {
        // Remove the pending canplay listener to prevent ghost plays after exit
        if (pendingPlay.current) {
          video.removeEventListener('canplay', pendingPlay.current)
          pendingPlay.current = null
        }
        video.pause()
        // If still buffering (never reached canplay), reset src to free the
        // decode buffer. Next in-view entry reloads from scratch — acceptable
        // cost; the alternative is N simultaneous buffers on large grids.
        if (video.readyState < 2) {
          video.src = ''
          video.load()
        }
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
