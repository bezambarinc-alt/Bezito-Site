import Image from 'next/image'
import Link from 'next/link'
import type { SegmentBlock } from '@/types/blocks'
import styles from './Segment.module.css'

/** Two-column media + text, reversible. Media may be image or looping video. */
export default function Segment({ block }: { block: SegmentBlock }) {
  return (
    <section className={`${styles.segment} ${block.reverse ? styles.reverse : ''}`}>
      <div className={styles.media}>
        {block.mediaType === 'video' ? (
          <video className={styles.video} autoPlay muted loop playsInline preload="none">
            <source src={block.mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={block.mediaUrl}
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.text}>
        <div className={styles.textInner}>
          {block.eyebrow && <p className="ba-eyebrow">{block.eyebrow}</p>}
          <h2 className={styles.title}>{block.title}</h2>
          {block.body && <p className={styles.body}>{block.body}</p>}
          {block.ctaLabel && block.ctaHref && (
            <Link className={styles.cta} href={block.ctaHref}>{block.ctaLabel}</Link>
          )}
        </div>
      </div>
    </section>
  )
}
