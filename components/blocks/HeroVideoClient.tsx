'use client'

/**
 * HeroVideoClient — client-side media layer for HeroVideo.
 *
 * Handles the poster → video crossfade:
 *   1. Poster (<Image priority>) paints immediately as the LCP element.
 *   2. Video downloads behind it with preload="none" and autoPlay.
 *   3. Once the video fires canPlayThrough, motion fades the poster out (0.9s).
 *
 * Kept intentionally thin — all static markup (overlay, scrim, ref pill)
 * lives in the server-rendered HeroVideo wrapper.
 */

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import styles from './HeroVideo.module.css'

interface Props {
  videoUrl: string
  posterUrl?: string
}

export default function HeroVideoClient({ videoUrl, posterUrl }: Props) {
  const [videoReady, setVideoReady] = useState(false)

  return (
    <>
      {/* Poster — LCP element, sits above the video until it's ready */}
      {posterUrl && (
        <motion.div
          className={styles.posterWrap}
          initial={{ opacity: 1 }}
          animate={{ opacity: videoReady ? 0 : 1 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          // Remove from paint tree once invisible so it doesn't block clicks
          style={{ pointerEvents: videoReady ? 'none' : 'auto' }}
        >
          <Image
            src={posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.poster}
          />
        </motion.div>
      )}

      {/* Video — renders behind poster (z-index: 1); crossfade reveals it */}
      <video
        className={styles.video}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={posterUrl}
        onCanPlayThrough={() => setVideoReady(true)}
      />
    </>
  )
}
