import SpecAccordion from '@/components/blocks/SpecAccordion'
import ProdPill from '@/components/layout/ProdPill'
import type { SpecAccordionBlock } from '@/types/blocks'
import type { ProductLayoutProps } from './types'
import styles from '../page.module.css'

/**
 * Default — triptych layout
 * 1. Hero split    — 55% video left · 45% text right
 * 2. Content split — 55% specs left · 45% on-hand photo right
 * 3. Three Views   — black bg · 3-col · 440px per box
 * 4. ProdPill      — sticky inquiry CTA
 */
export default function LayoutDefault({
  product,
  heroVideo,
  heroPoster,
  onHandPhoto,
  categoryLabel,
  specItems,
  views,
}: ProductLayoutProps) {
  const accordionBlock: SpecAccordionBlock = { type: 'spec-accordion', title: '', items: specItems }

  return (
    <main data-page="pdp">
      {/* ── 1. Hero split ── */}
      <section className={styles.heroSplit}>
        <div className={styles.heroVideo}>
          {heroVideo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <video src={heroVideo} autoPlay muted loop playsInline preload="auto" poster={heroPoster ?? undefined} />
          ) : heroPoster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPoster} alt={product.name} />
          ) : null}
        </div>
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>{categoryLabel}</p>
          <h1 className={styles.heroTitle}>{product.name}</h1>
          <p className={styles.heroRefLine}>Ref. {product.sku}</p>
          {(product.specs.lede || product.specs.subtitle) && (
            <p className={styles.heroCopy}>{product.specs.lede ?? product.specs.subtitle}</p>
          )}
        </div>
      </section>

      {/* ── 2. Content split ── */}
      <section className={styles.contentSplit}>
        <div className={styles.contentLeft}>
          <p className={styles.contentEyebrow}>Technical Details</p>
          <SpecAccordion block={accordionBlock} variant="light" />
        </div>
        <div className={styles.contentRight}>
          {onHandPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.contentPhoto} src={onHandPhoto} alt={`${product.name} · On Hand`} loading="lazy" />
          )}
        </div>
      </section>

      {/* ── 3. Three Views ── */}
      <section className={styles.views}>
        <div className={styles.viewsGrid}>
          {views.map((v, i) => (
            <div key={i} className={styles.viewsItem}>
              <div className={styles.viewsImgWrap}>
                {v.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.viewsImg} src={v.url} alt={v.label} loading="lazy" />
                )}
              </div>
              <p className={styles.viewsLabel}>{v.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. ProdPill ── */}
      <ProdPill title={product.name} sku={product.sku} />
    </main>
  )
}
