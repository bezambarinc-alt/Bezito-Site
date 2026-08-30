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
        // Guard on the attribute, NOT the `.src` property. After an exit-reset
        // we removeAttribute('src'), so getAttribute returns null here and we
        // correctly restore the real URL. (Reading `video.src` would resolve an
        // empty/absent src to the page URL — truthy — and skip the reload,
        // leaving the poster frozen forever.)
        if (!video.getAttribute('src')) {
          video.src = src
          video.load()
        }
        // Attempt play now AND keep listening while in view. A single {once}
        // canplay is fragile: if that one play() promise is interrupted (common
        // under fast scroll / many concurrent videos), it's never retried and
        // the poster freezes. Listening on canplay + playing (persistent, torn
        // down on exit) means any later "ready" event re-attempts the play.
        const doPlay = () => { video.play().catch(() => {}) }
        pendingPlay.current = doPlay
        video.addEventListener('canplay', doPlay)
        video.addEventListener('loadeddata', doPlay)
        if (video.readyState >= 2) doPlay()
      } else {
        // Tear down the in-view play listeners so nothing fires after exit
        if (pendingPlay.current) {
          video.removeEventListener('canplay', pendingPlay.current)
          video.removeEventListener('loadeddata', pendingPlay.current)
          pendingPlay.current = null
        }
        video.pause()
        // If still buffering (never reached canplay), reset src to free the
        // decode buffer. Next in-view entry reloads from scratch — acceptable
        // cost; the alternative is N simultaneous buffers on large grids.
        if (video.readyState < 2) {
          // removeAttribute (not `src = ''`) so the next in-view check sees an
          // absent src and reloads. Setting `src = ''` leaves a truthy
          // `video.src` (page URL) that blocks the reload guard above.
          video.removeAttribute('src')
          video.load()
        }
      }
    },
  })

  const handleError: React.EventHandler<React.SyntheticEvent<HTMLVideoElement>> = (e) => {
    const v = e.currentTarget
    console.warn('[LazyVideo] failed to load:', v.currentSrc || v.getAttribute('src') || 'no src')
    v.removeAttribute('src')
  }

  return (
    <video
      ref={ref}
      preload="none"
      poster={poster}
      muted
      loop
      playsInline
      className={className}
      onError={handleError}
      {...rest}
    />
  )
}
