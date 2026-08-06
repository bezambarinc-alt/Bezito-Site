import type { SpecAccordionBlock } from '@/types/blocks'
import styles from './SpecAccordion.module.css'

interface Props {
  block: SpecAccordionBlock
  /**
   * 'dark' (default) — white text on dark background (InquireCta, dark product panels)
   * 'light'          — ink text on white background (Astro .technical section)
   */
  variant?: 'dark' | 'light'
}

/** Native <details>/<summary> accordion — works without JavaScript. */
export default function SpecAccordion({ block, variant = 'dark' }: Props) {
  const itemClass = variant === 'light'
    ? `${styles.item} ${styles.itemLight}`
    : styles.item
  const summaryClass = variant === 'light'
    ? `${styles.summary} ${styles.summaryLight}`
    : styles.summary
  const bodyClass = variant === 'light'
    ? `${styles.body} ${styles.bodyLight}`
    : styles.body

  return (
    <div className={styles.accordion}>
      {block.title && <p className="ba-eyebrow">{block.title}</p>}
      {block.items.map((item, i) => (
        <details key={`${item.label}-${i}`} className={itemClass}>
          <summary className={summaryClass}>
            <span>{item.label}</span>
            <span className={styles.mark} aria-hidden />
          </summary>
          <div className={bodyClass}>{item.body}</div>
        </details>
      ))}
    </div>
  )
}
