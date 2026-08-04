import type { HeroSplitBlock } from '@/types/blocks'
import SpecAccordion from './SpecAccordion'
import styles from './HeroSplit.module.css'

/** 55/45 split: full-bleed video left with ref overlay, editorial + specs + CTA right. */
export default function HeroSplit({ block }: { block: HeroSplitBlock }) {
  return (
    <section className={styles.split}>
      <div className={styles.media}>
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={block.posterUrl}
        >
          <source src={block.videoUrl} type="video/mp4" />
        </video>
        {block.refId && <p className={styles.ref}>Ref. {block.refId}</p>}
      </div>

      <div className={styles.panel}>
        {block.category && <p className="ba-eyebrow">{block.category}</p>}
        {block.codeName && <p className={styles.code}>{block.codeName}</p>}
        {/*
          titleHtml intentionally rendered as text — raw HTML injection is
          restricted to Richtext.tsx per the project security rules.
        */}
        <h2 className={styles.title}>{block.titleHtml}</h2>
        <p className={styles.copy}>{block.copy}</p>

        {block.specs && block.specs.length > 0 && <SpecAccordion block={{ type: 'spec-accordion', items: block.specs }} />}

        {block.ctaLabel && block.ctaPhone && (
          <a className={styles.cta} href={`tel:${block.ctaPhone}`}>
            {block.ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
