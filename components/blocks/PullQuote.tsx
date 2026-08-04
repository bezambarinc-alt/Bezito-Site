import type { PullQuoteBlock } from '@/types/blocks'
import styles from './PullQuote.module.css'

/** Large decorative pull quote with optional attribution. */
export default function PullQuote({ block }: { block: PullQuoteBlock }) {
  return (
    <section className={styles.section}>
      <figure className={styles.figure}>
        <span className={styles.mark} aria-hidden>{block.decorativeMark ?? '“'}</span>
        <blockquote className={styles.quote}>{block.quote}</blockquote>
        {block.attribution && <figcaption className={styles.attr}>— {block.attribution}</figcaption>}
      </figure>
    </section>
  )
}
