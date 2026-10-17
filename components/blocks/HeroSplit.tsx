import type { HeroSplitBlock } from '@/types/blocks'
import SpecAccordion from './SpecAccordion'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import pdpStyles from '@/app/(public)/jewelry/[category]/[slug]/page.module.css'
import styles from './HeroSplit.module.css'

/** 55/45 split: media left (video or iJewel viewer), editorial + specs + CTA right. */
export default function HeroSplit({ block }: { block: HeroSplitBlock }) {
  return (
    <section className={styles.split}>
      <div className={styles.media}>
        {block.ijewelUrl ? (
          <IJewelViewer src={block.ijewelUrl} title={block.titleHtml} />
        ) : (
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
        )}
        {block.refId && <p className={styles.ref}>Ref. {block.refId}</p>}
      </div>

      <div className={styles.panel}>
        {block.category && <p className={pdpStyles.heroEyebrow}>{block.category}</p>}
        {block.codeName && <p className={styles.code}>{block.codeName}</p>}
        {/*
          titleHtml intentionally rendered as text — raw HTML injection is
          restricted to Richtext.tsx per the project security rules.
        */}
        <h2 className={pdpStyles.heroTitle}>{block.titleHtml}</h2>
        <p className={`${pdpStyles.heroCopy} ${styles.copy}`}>{block.copy}</p>

        {block.specs && block.specs.length > 0 && <SpecAccordion block={{ type: 'spec-accordion', items: block.specs }} variant="light" />}

        {block.ctaLabel && block.ctaPhone && (
          <a className={styles.cta} href={`tel:${block.ctaPhone}`}>
            {block.ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
