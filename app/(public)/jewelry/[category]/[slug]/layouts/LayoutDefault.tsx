import Image from 'next/image'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import ProdPill from '@/components/layout/ProdPill'
import AtelierBanner from '@/components/common/AtelierBanner'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import type { SpecAccordionBlock } from '@/types/blocks'
import type { ProductLayoutProps } from './types'
import styles from '../page.module.css'
import { parseProductName } from '@/lib/product-name'

/**
 * Default PDP layout — 55% media left · 45% specs right · 2-col banner below
 *
 * DOM order = mobile visual order = tab order:
 *   media col → spec col → banner → [media banner] → atelier → pill
 *
 * Hero slot rules:
 *   - iJewel URL + interactiveIsHero=true  → iJewel viewer in hero
 *   - otherwise heroVideo                  → video in hero
 *   - otherwise heroPoster                 → image in hero
 *
 * Media banner (60vh, below heroBanner, above AtelierBanner):
 *   Appears only when BOTH ijewelUrl AND heroVideo are present.
 *   The non-hero medium fills this slot.
 *
 * Banner maps:
 *   - Left 55%  — onHandPhoto (editorial model photo)
 *   - Right 1fr — Concept sketch from views
 */
export default function LayoutDefault({
  product,
  heroVideo,
  heroPoster,
  onHandPhoto,
  category,
  categoryLabel,
  specItems,
  views,
  prevProduct,
  nextProduct,
  relatedProducts = [],
}: ProductLayoutProps) {
  const accordionBlock: SpecAccordionBlock = { type: 'spec-accordion', title: '', items: specItems }
  const displayName = parseProductName(product.name).title

  const { ijewelUrl, interactiveIsHero } = product

  // Hero slot: iJewel wins when it's the designated hero; otherwise video; otherwise poster
  const heroIsIJewel = Boolean(ijewelUrl && interactiveIsHero)
  const heroIsVideo  = !heroIsIJewel && Boolean(heroVideo)

  // Media banner appears when both are present; shows the non-hero medium
  const showMediaBanner = Boolean(ijewelUrl && heroVideo)
  const mediaBannerIsIJewel = showMediaBanner && !interactiveIsHero

  const conceptView = views.find(v => v.label === 'Concept')

  return (
    <main data-page="pdp" className={styles.pdpMain}>

      {/* ── 1. Left col: media ── */}
      <div className={styles.mediaLeft}>
        {heroIsIJewel ? (
          <IJewelViewer src={ijewelUrl!} title={displayName} />
        ) : heroIsVideo ? (
          <video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroPoster ?? undefined}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : heroPoster ? (
          <Image
            src={heroPoster}
            alt={displayName}
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        ) : null}
      </div>

      {/* ── 2. Right col: specs ── */}
      <div className={styles.specCol}>
        <p className={styles.heroEyebrow}>{categoryLabel}</p>
        <h1 className={styles.heroTitle}>{displayName}</h1>
        {product.specs.subtitle && (
          <p className={styles.heroSubtitle}>{product.specs.subtitle}</p>
        )}
        <p className={styles.heroRefLine}>Ref. {product.sku}</p>
        {product.specs.lede && (
          <p className={styles.heroCopy}>{product.specs.lede}</p>
        )}
        <div className={styles.specDetails}>
          <SpecAccordion block={accordionBlock} variant="light" />
        </div>
      </div>

      {/* ── 3. Banner: model (wide) left · concept sketch (thin) right ── */}
      {onHandPhoto && conceptView?.url && (
        <div className={styles.heroBanner}>
          <div className={styles.bannerCell}>
            <Image
              src={onHandPhoto}
              alt={`${displayName} · On Hand`}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
          <div className={styles.bannerCell}>
            <Image
              src={conceptView.url}
              alt="Concept Sketch"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        </div>
      )}

      {/* ── 4. Media banner: non-hero medium at 60vh (only when both exist) ── */}
      {showMediaBanner && (
        <div className={styles.mediaBanner}>
          {mediaBannerIsIJewel ? (
            <IJewelViewer src={ijewelUrl!} title={displayName} />
          ) : (
            <video
              src={heroVideo!}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroPoster ?? undefined}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>
      )}

      {/* ── 5. Related products carousel (disabled) ── */}
      {/* {relatedProducts.length > 0 && <RelatedCarousel products={relatedProducts} />} */}

      {/* ── 6. Atelier banner ── */}
      <AtelierBanner />

      {/* ── 7. ProdPill ── */}
      <ProdPill
        title={displayName}
        sku={product.sku}
        category={category}
        prevProduct={prevProduct}
        nextProduct={nextProduct}
      />
    </main>
  )
}
