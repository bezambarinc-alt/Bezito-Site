import Image from 'next/image'
import type { ContentSplitBlock } from '@/types/blocks'
import SpecAccordion from './SpecAccordion'
import styles from './ContentSplit.module.css'

/** Accordion specs left, on-hand photograph right (next/image). */
export default function ContentSplit({ block }: { block: ContentSplitBlock }) {
  return (
    <section className={styles.split}>
      <div className={styles.specs}>
        <SpecAccordion block={{ type: 'spec-accordion', items: block.specs }} />
      </div>
      <div className={styles.media}>
        <Image
          src={block.imageUrl}
          alt=""
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          className={styles.image}
          style={{ objectPosition: block.imageObjectPosition ?? 'center' }}
        />
      </div>
    </section>
  )
}
