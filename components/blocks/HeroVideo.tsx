import Image from 'next/image'
import type { HeroVideoBlock } from '@/types/blocks'
import styles from './HeroVideo.module.css'

/** Full-bleed hero video with an optional reference id + editorial overlay. */
export default function HeroVideo({ block }: { block: HeroVideoBlock }) {
  const pos = block.overlay?.position ?? 'bottom-left'
  return (
    <section className={styles.hero}>
      {block.posterUrl && (
        <Image
          src={block.posterUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.poster}
        />
      )}
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster={block.posterUrl}
      >
        <source src={block.videoUrl} type="video/mp4" />
      </video>

      <div className={styles.scrim} aria-hidden />

      {block.overlay && (
        <div className={`${styles.overlay} ${pos === 'center' ? styles.center : styles.bottomLeft}`}>
          {block.overlay.eyebrow && <p className="ba-eyebrow">{block.overlay.eyebrow}</p>}
          {block.overlay.title && <h1 className={styles.title}>{block.overlay.title}</h1>}
          {block.overlay.body && <p className={styles.body}>{block.overlay.body}</p>}
        </div>
      )}

      {block.refId && (
        <p className={styles.ref}>
          {block.refName ? `${block.refName} · ` : ''}Ref. {block.refId}
        </p>
      )}
    </section>
  )
}
