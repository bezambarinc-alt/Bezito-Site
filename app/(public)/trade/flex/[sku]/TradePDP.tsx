import { Suspense } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import TradePDPClient from './TradePDPClient'
import MetalSwitcher from './MetalSwitcher'
import type { MetalOption } from './MetalSwitcher'
import TradeCTA from './TradeCTA'
import styles from './pdp.module.css'

interface Props {
  product: Product
  selectedMetal?: string
}

function buildDefaultGallery(product: Product): string[] {
  const fallback = product.specs.heroPosterUrl ?? ''
  const imgs = [
    product.specs.heroPosterUrl,
    product.view1Url,
    product.view2Url,
    product.view3Url,
  ].filter((u): u is string => Boolean(u))
  while (imgs.length < 6) imgs.push(fallback)
  return imgs.slice(0, 6)
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

export default function TradePDP({ product, selectedMetal }: Props) {
  const { sku, specs, productType, stoneCount, stoneWeightEach } = product
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

  // Resolve selected metal label (URL param → available metals → first)
  const selectedMetalLabel = (() => {
    if (!product.availableMetals?.length) return specs.metal ?? null
    if (selectedMetal) {
      const found = product.availableMetals.find(
        m => m.toLowerCase().replace(/\s+/g, '_') === selectedMetal
      )
      if (found) return found
    }
    return product.availableMetals[0] ?? null
  })()

  // Spec rows for details section
  const specRows: { label: string; value: string }[] = []
  if (selectedMetalLabel) specRows.push({ label: 'Metal', value: selectedMetalLabel })
  if (stoneCount || gemStone) {
    const parts: string[] = []
    if (stoneCount) parts.push(String(stoneCount))
    if (gemStone) parts.push(`${gemStone} Diamonds`)
    if (stoneWeightEach) parts.push(`${stoneWeightEach.toFixed(2)} ct each`)
    if (parts.length) specRows.push({ label: 'Stones', value: parts.join(' · ') })
  }
  if (specs.caratWeight) specRows.push({ label: 'Carat weight', value: `${specs.caratWeight} ct tw` })
  specRows.push({ label: 'Origin', value: 'Made in Los Angeles' })
  specRows.push({ label: 'Reference', value: sku })

  const displayTitle = [collectionName && `${collectionName}™`, productType]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Left: gallery ── */}
        <Suspense fallback={
          <div className={styles.galleryCol}>
            {defaultSlots.slice(0, 6).map((_, i) => (
              <div key={i} className={styles.galleryItem} />
            ))}
          </div>
        }>
          <TradePDPClient
            metals={metals}
            defaultSlots={defaultSlots}
            displayName={displayTitle || product.name}
            ijewelUrl={product.ijewelUrl}
            heroIsIJewel={Boolean(product.ijewelUrl && product.interactiveIsHero)}
            selectedMetalKey={selectedMetal ?? null}
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
          {displayTitle && (
            <h1 className={styles.title}>{displayTitle}</h1>
          )}

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
    </div>
  )
}
