import type { CSSProperties } from 'react'
import Image from 'next/image'
import type { ImageGridBlock } from '@/types/blocks'
import styles from './ImageGrid.module.css'

/** 2–4 next/image tiles in a row with optional labels. */
export default function ImageGrid({ block }: { block: ImageGridBlock }) {
  const count = Math.min(Math.max(block.images.length, 1), 4)
  const light = block.background === 'white'
  return (
    <section
      className={`${styles.grid} ${light ? styles.light : ''}`}
      style={{ '--cols': count } as CSSProperties}
    >
      {block.images.map((img, i) => (
        <figure key={`${img.url}-${i}`} className={styles.tile}>
          <div className={styles.frame}>
            <Image
              src={img.url}
              alt={img.label ?? ''}
              fill
              sizes={`(max-width: 720px) 100vw, ${Math.round(100 / count)}vw`}
              className={styles.image}
            />
          </div>
          {img.label && <figcaption className={styles.label}>{img.label}</figcaption>}
        </figure>
      ))}
    </section>
  )
}
