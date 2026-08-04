import type { RichtextBlock } from '@/types/blocks'
import styles from './Richtext.module.css'

/**
 * Renders trusted rich text. This is the ONLY component permitted to use
 * dangerouslySetInnerHTML.
 * HTML is sanitized by the /api/pages write guard before storage.
 */
export default function Richtext({ block }: { block: RichtextBlock }) {
  return (
    <section className={styles.section}>
      <div
        className={styles.prose}
        // HTML is sanitized by the /api/pages write guard before storage
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    </section>
  )
}
