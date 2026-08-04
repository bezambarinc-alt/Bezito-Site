import type { EditorialBlock } from '@/types/blocks'
import styles from './Editorial.module.css'

/** Centered editorial passage: eyebrow, title, subtitle, body. */
export default function Editorial({ block }: { block: EditorialBlock }) {
  return (
    <section className={styles.editorial}>
      <div className={styles.inner}>
        {block.eyebrow && <p className="ba-eyebrow">{block.eyebrow}</p>}
        <h2 className={styles.title}>{block.title}</h2>
        {block.subtitle && <p className={styles.subtitle}>{block.subtitle}</p>}
        <p className={styles.body}>{block.body}</p>
      </div>
    </section>
  )
}
