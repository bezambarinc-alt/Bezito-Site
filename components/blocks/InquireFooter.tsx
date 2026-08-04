import type { InquireFooterBlock } from '@/types/blocks'
import styles from './InquireFooter.module.css'

/** Centered closing footer: brand line, piece line, phone(s), email. */
export default function InquireFooter({ block }: { block: InquireFooterBlock }) {
  return (
    <section className={styles.footer}>
      <p className={styles.brand}>BEZ AMBAR</p>
      <p className={styles.piece}>{block.pieceLine}</p>
      <div className={styles.contact}>
        {block.phone1 && <a href={`tel:${block.phone1}`}>{block.phone1}</a>}
        {block.phone2 && <a href={`tel:${block.phone2}`}>{block.phone2}</a>}
        {block.email && <a href={`mailto:${block.email}`}>{block.email}</a>}
      </div>
    </section>
  )
}
