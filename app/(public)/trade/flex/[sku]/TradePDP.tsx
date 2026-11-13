import { Suspense } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import type { TradeRelatedCard } from '@/lib/queries'
import TradePDPClient from './TradePDPClient'
import MetalSwitcher, { SelectedMetalValue } from './MetalSwitcher'
import type { MetalOption } from './MetalSwitcher'
import TradeCTA from './TradeCTA'
import TradeRelatedCarousel from './TradeRelatedCarousel'
import styles from './pdp.module.css'

interface Props {
  product: Product
  related?: TradeRelatedCard[]
}

/** Title shown in the H1 and used by generateMetadata. */
export function tradeDisplayTitle(product: Product): string {
  const collectionName = product.specs.collection ?? ''
  const title = [collectionName && `${collectionName}™`, product.productType]
    .filter(Boolean)
    .join(' ')
  return title || product.name
}

function buildDefaultGallery(product: Product): string[] {
  // Only images that actually exist (max 6) — no padding with repeats.
  return [
    product.specs.heroPosterUrl,
    product.view1Url,
    product.view2Url,
    product.view3Url,
  ]
    .filter((u): u is string => Boolean(u))
    .slice(0, 6)
}

function buildMetals(product: Product): MetalOption[] {
  const { metalImages, availableMetals } = product
  if (!availableMetals?.length || !metalImages) return []
  return availableMetals
    .map(label => {
      const key = label.toLowerCase().replace(/\s+/g, '_')
      const images = (metalImages as Record<string, MetalOption['images']>)[key] ?? {}
      return { key, label, images }
    })
    .filter(m => m.images.front || m.images.top || m.images.angled)
}

function parseOrientation(sku: string): string | null {
  if (sku.endsWith('E')) return 'East–West'
  if (sku.endsWith('N')) return 'North–South'
  return null
}

function fmt(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, '')
}

export default function TradePDP({ product, related }: Props) {
  const { sku, specs, stoneCount, stoneWeightEach } = product
  const { gemStone, collection, lede } = specs

  const collectionName = collection ?? ''
  const orientation = parseOrientation(sku)

  const defaultSlots = buildDefaultGallery(product)
  const metals = buildMetals(product)

  // Subline segments
  const sublineParts: string[] = []
  if (gemStone) sublineParts.push(`${gemStone} Diamonds`)
  if (orientation) sublineParts.push(orientation)
  if (stoneWeightEach) sublineParts.push(`${stoneWeightEach.toFixed(2)} ct each`)
  const subline = sublineParts.join(' · ')

  // Metal spec value. The selected metal comes from ?metal= which is read on the
  // client (this page is ISR-cached), so when there are switchable metals the
  // value is a client island; the server only renders the default as fallback.
  const defaultMetalLabel = metals[0]?.label ?? product.availableMetals?.[0] ?? specs.metal ?? null
  const metalValue: React.ReactNode = metals.length > 1
    ? (
      <Suspense fallback={defaultMetalLabel}>
        <SelectedMetalValue metals={metals} />
      </Suspense>
    )
    : defaultMetalLabel

  // Spec rows for details section
  const specRows: { label: string; value: React.ReactNode }[] = []
  if (defaultMetalLabel) specRows.push({ label: 'Metal', value: metalValue })
  if (stoneCount || gemStone) {
    const parts: string[] = []
    if (stoneCount) parts.push(String(stoneCount))
    if (gemStone) parts.push(`${gemStone} Diamonds`)
    if (stoneWeightEach) parts.push(`${stoneWeightEach.toFixed(2)} ct each`)
    if (parts.length) specRows.push({ label: 'Stones', value: parts.join(' · ') })
  }
  if (specs.caratWeight) specRows.push({ label: 'Carat weight', value: `${specs.caratWeight} ct tw` })
  if (specs.color)   specRows.push({ label: 'Color',   value: specs.color })
  if (specs.clarity) specRows.push({ label: 'Clarity', value: specs.clarity })
  specRows.push({ label: 'Origin', value: 'Made in Los Angeles' })
  specRows.push({ label: 'Reference', value: sku })

  const displayTitle = tradeDisplayTitle(product)

  return (
    <div className={styles.root}>
      <div className={styles.grid}>


        {/* ── Left: gallery ── */}
        <Suspense fallback={
          <div className={styles.galleryCol}>
            {/* Placeholder tiles: one per real image (no padding), at least one */}
            {Array.from({ length: Math.max(1, defaultSlots.length) }, (_, i) => (
              <div key={i} className={styles.galleryItem} />
            ))}
          </div>
        }>
          {/* Suspense boundary required: TradePDPClient calls useSearchParams on an ISR page */}
          <TradePDPClient
            metals={metals}
            defaultSlots={defaultSlots}
            displayName={displayTitle}
            ijewelUrl={product.ijewelUrl}
            heroIsIJewel={Boolean(product.ijewelUrl && product.interactiveIsHero)}
          />
        </Suspense>

        {/* ── Right: spec panel ── */}
        <div className={styles.specCol}>

          {/* 1. Back link */}
          {collectionName ? (
            <Link href="/trade/flex" className={styles.back}>
              ← {collectionName} Collection
            </Link>
          ) : (
            <Link href="/trade/flex" className={styles.back}>← Collection</Link>
          )}

          {/* 2. Title */}
          <h1 className={styles.title}>{displayTitle || product.name}</h1>

          {/* 3. Subline */}
          {subline && (
            <p className={styles.subline}>{subline}</p>
          )}

          {/* 4. Ref */}
          <p className={styles.ref}>Ref. {sku}</p>

          {/* 5. Metal switcher */}
          {metals.length > 1 && (
            <Suspense fallback={null}>
              <MetalSwitcher metals={metals} slug={product.slug} />
            </Suspense>
          )}

          {/* 6. CTA */}
          <TradeCTA sku={sku} title={displayTitle || product.name} />

          {/* 7. Details section */}
          <div className={styles.detailsSection}>
            <div className={styles.detailsSectionTop}>
              <span className={styles.detailsLabel}>Details</span>
            </div>
            {lede && <p className={styles.detailsDesc}>{lede}</p>}
            {specRows.length > 0 && (
              <dl className={styles.specList}>
                {specRows.map(({ label, value }) => (
                  <div key={label} className={styles.specRow}>
                    <dt className={styles.specRowLabel}>{label}</dt>
                    <dd className={styles.specRowValue}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

        </div>
      </div>
      {related && related.length > 0 && <TradeRelatedCarousel products={related} />}
    </div>
  )
}
