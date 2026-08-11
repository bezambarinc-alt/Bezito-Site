'use client'

/**
 * HeroVideo — full-bleed hero with poster→video crossfade + luxury entrance.
 *
 * Consolidated into a single client component (was split into HeroVideo +
 * HeroVideoClient; the server/client boundary wasn't buying us anything once
 * the overlay needed animation too).
 *
 * Crossfade: CSS opacity transition on the posterWrap (GPU compositor thread).
 * Entrance: motion.div on the overlay text — soft drift up with a short delay
 * so the text appears after the hero is visually settled.
 */

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import type { HeroVideoBlock } from '@/types/blocks'
import styles from './HeroVideo.module.css'

export default function HeroVideo({ block }: { block: HeroVideoBlock }) {
  const [videoPlaying, setVideoPlaying] = useState(false)
  const pos = block.overlay?.position ?? 'bottom-left'

  return (
    <section className={styles.hero}>
      {/* Poster — LCP element, z-index:2, fades out once video starts playing */}
      {block.posterUrl && (
        <div className={`${styles.posterWrap} ${videoPlaying ? styles.posterHidden : ''}`}>
          <Image
            src={block.posterUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.poster}
          />
        </div>
      )}

      {/* Video — z-index:1, preload aggressively (always above fold) */}
      <video
        className={styles.video}
        src={block.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={block.posterUrl}
        onPlaying={() => setVideoPlaying(true)}
      />

      <div className={styles.scrim} aria-hidden />

      {/* Overlay — luxury entrance: soft upward drift with delayed fade */}
      {block.overlay && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1], delay: 0.45 }}
          className={`${styles.overlay} ${pos === 'center' ? styles.center : styles.bottomLeft}`}
        >
          {block.overlay.eyebrow && (
            <motion.p
              className="ba-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
            >
              {block.overlay.eyebrow}
            </motion.p>
          )}
          {block.overlay.title && <h1 className={styles.title}>{block.overlay.title}</h1>}
          {block.overlay.body && <p className={styles.body}>{block.overlay.body}</p>}
        </motion.div>
      )}

      {block.refId && (
        <motion.p
          className={styles.ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          {block.refName ? `${block.refName} · ` : ''}Ref. {block.refId}
        </motion.p>
      )}
    </section>
  )
}
