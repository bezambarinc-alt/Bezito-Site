import { Suspense } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import { parseProductName } from '@/lib/product-name'
import TradePDPClient from './TradePDPClient'
import MetalSwitcher from './MetalSwitcher'
import type { MetalOption } from './MetalSwitcher'
import TradeCTA from './TradeCTA'
import styles from './pdp.module.css'

interface Props {
  product: Product
  selectedMetal?: string
}

const COLLECTION_DESC: Record<string, string> = {
  'Flex': 'The EXTENT bracelet sets each link with a single emerald-cut diamond — east-west or north-south — allowing the piece to drape the wrist as a continuous plane of light. Available from 10 to 100 points per link.',
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
      const images = (metalImages as Record<string, { front?: string; model?: string; top?: string; angled?: string; video?: string; closeup?: string }>)[key] ?? {}
      return { key, label, images }
    })
    .filter(m => m.images.front || m.images.top || m.images.angled)
}

function parseOrientation(sku: string): string | null {
  if (sku.endsWith('E')) return 'East–West'
  if (sku.endsWith('N')) return 'North–South'
  return null
}

export default function TradePDP({ product, selectedMetal }: Props) {
  const { specs, sku, ijewelUrl, interactiveIsHero } = product
  const heroIsIJewel = Boolean(ijewelUrl && interactiveIsHero)
  const { title: displayName, variant } = parseProductName(product.name)
  const defaultSlots = buildDefaultGallery(product)
  const metals = buildMetals(product)

  const orientation = parseOrientation(sku)
  const collectionName = specs.collection ?? 'Flex'
  const collectionDesc = COLLECTION_DESC[collectionName] ?? null
  const hasSpecs = !!(specs.gemStone || specs.caratWeight || specs.metal || orientation || specs.color || specs.clarity)

  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Left col: interactive 2-col gallery + lightbox ── */}
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
            displayName={displayName}
            ijewelUrl={ijewelUrl}
            heroIsIJewel={heroIsIJewel}
          />
        </Suspense>

        {/* ── Right col: specs (sticky) ── */}
        <div className={styles.specCol}>
          <Link href="/trade/flex" className={styles.back}>← Flex Collection</Link>

          <p className={styles.eyebrow}>{collectionName}</p>
          <h1 className={styles.title}>{displayName}</h1>
          {variant && <p className={styles.variant}>{variant}</p>}
          <p className={styles.ref}>Ref. {sku}</p>

          {collectionDesc && (
            <p className={styles.collectionDesc}>{collectionDesc}</p>
          )}
          {specs.lede && (
            <p className={styles.lede}>{specs.lede}</p>
          )}

          {/* Metal switcher — only shown when product has multiple metals */}
          {metals.length > 1 && (
            <Suspense fallback={null}>
              <MetalSwitcher metals={metals} slug={product.slug} />
            </Suspense>
          )}

          {hasSpecs && (
            <dl className={styles.specList}>
              {specs.gemStone && (
                <>
                  <dt>Stone</dt>
                  <dd>{specs.gemStone}</dd>
                </>
              )}
              {orientation && (
                <>
                  <dt>Orientation</dt>
                  <dd>{orientation}</dd>
                </>
              )}
              {specs.caratWeight && (
                <>
                  <dt>Total Carat Weight</dt>
                  <dd>{specs.caratWeight}ct</dd>
                </>
              )}
              {specs.color && (
                <>
                  <dt>Color</dt>
                  <dd>{specs.color}</dd>
                </>
              )}
              {specs.clarity && (
                <>
                  <dt>Clarity</dt>
                  <dd>{specs.clarity}</dd>
                </>
              )}
              {specs.metal && metals.length === 0 && (
                <>
                  <dt>Metal</dt>
                  <dd>{specs.metal}</dd>
                </>
              )}
              <dt>Made in</dt>
              <dd>Los Angeles</dd>
            </dl>
          )}

          <hr className={styles.divider} />

          <TradeCTA sku={sku} title={displayName} />
        </div>

      </div>
    </div>
  )
}
