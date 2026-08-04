import type { SpecAccordionBlock } from '@/types/blocks'
import styles from './SpecAccordion.module.css'

/** Native <details>/<summary> accordion — works without JavaScript. */
export default function SpecAccordion({ block }: { block: SpecAccordionBlock }) {
  return (
    <div className={styles.accordion}>
      {block.title && <p className="ba-eyebrow">{block.title}</p>}
      {block.items.map((item, i) => (
        <details key={`${item.label}-${i}`} className={styles.item}>
          <summary className={styles.summary}>
            <span>{item.label}</span>
            <span className={styles.mark} aria-hidden />
          </summary>
          <div className={styles.body}>{item.body}</div>
        </details>
      ))}
    </div>
  )
}
