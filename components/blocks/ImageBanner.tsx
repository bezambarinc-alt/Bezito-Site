import type { ImageBannerBlock } from '@/types/blocks'
import styles from './ImageBanner.module.css'

/** Two-image banner matching the PDP heroBanner: 55% left · 1fr right, 60vh.
 *  Uses plain <img> (no next/image) so it loads correctly through the bezito.co proxy. */
export default function ImageBanner({ block }: { block: ImageBannerBlock }) {
  return (
    <section className={styles.banner}>
      <div className={styles.cell}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.leftUrl}
          alt={block.leftAlt ?? ''}
          className={styles.img}
          style={{ objectPosition: 'top' }}
        />
      </div>
      <div className={styles.cell}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.rightUrl}
          alt={block.rightAlt ?? ''}
          className={styles.img}
          style={{ objectPosition: 'center' }}
        />
      </div>
    </section>
  )
}
