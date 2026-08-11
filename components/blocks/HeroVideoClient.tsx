'use client'

/**
 * HeroVideoClient — client-side media layer for HeroVideo.
 *
 * Poster → video crossfade strategy:
 *   1. Poster (Cloudinary frame extraction, <Image priority>) paints immediately
 *      as the LCP element. It's a frame from the actual video so the transition
 *      is invisible — no jarring cut between a photo and the video content.
 *   2. Video downloads with preload="auto" (above-fold hero — we want it buffered).
 *   3. Once `playing` fires (video is genuinely rendering frames), CSS transition
 *      fades the poster out. GPU-composited, no JS animation frame budget.
 */

import { useState } from 'react'
import Image from 'next/image'
import styles from './HeroVideo.module.css'

interface Props {
  videoUrl: string
  posterUrl?: string
}

export default function HeroVideoClient({ videoUrl, posterUrl }: Props) {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* Poster — LCP element, z-index:2, fades out once video is playing */}
      {posterUrl && (
        <div className={`${styles.posterWrap} ${videoPlaying ? styles.posterHidden : ''}`}>
          <Image
            src={posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.poster}
          />
        </div>
      )}

      {/* Video — z-index:1, preload aggressively (above fold) */}
      <video
        className={styles.video}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterUrl}
        onPlaying={() => setVideoPlaying(true)}
      />
    </>
  )
}
