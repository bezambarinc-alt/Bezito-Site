import type { HeroVideoBlock } from '@/types/blocks'
import HeroVideoClient from './HeroVideoClient'
import styles from './HeroVideo.module.css'

/**
 * Full-bleed hero video — server component wrapper.
 * Static markup (scrim, overlay, ref pill) is server-rendered;
 * the media crossfade (poster → video) is handled by HeroVideoClient.
 */
export default function HeroVideo({ block }: { block: HeroVideoBlock }) {
  const pos = block.overlay?.position ?? 'bottom-left'
  return (
    <section className={styles.hero}>
      {/* Poster → video crossfade — client-only interactive layer */}
      <HeroVideoClient videoUrl={block.videoUrl} posterUrl={block.posterUrl} />

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
