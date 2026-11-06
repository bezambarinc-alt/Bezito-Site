import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/products'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import { parseProductName } from '@/lib/product-name'
import styles from './pdp.module.css'

interface Props { product: Product }

const COLLECTION_DESC: Record<string, string> = {
  'Flex': 'The EXTENT bracelet sets each link with a single emerald-cut diamond — east-west or north-south — allowing the piece to drape the wrist as a continuous plane of light. Available from 10 to 100 points per link.',
}

function buildGallery(product: Product): string[] {
  return [
    product.specs.heroPosterUrl,
    product.view1Url,
    product.view2Url,
    product.view3Url,
  ].filter((u): u is string => Boolean(u))
}

function parseOrientation(sku: string): string | null {
  if (sku.endsWith('E')) return 'East–West'
  if (sku.endsWith('N')) return 'North–South'
  return null
}

export default function TradePDP({ product }: Props) {
  const { specs, sku, ijewelUrl, interactiveIsHero } = product
  const heroIsIJewel = Boolean(ijewelUrl && interactiveIsHero)
  const { title: displayName, variant } = parseProductName(product.name)
  const gallery = buildGallery(product)

  // Flat gallery slots — always padded to 4 (fills a 2×2 grid), placeholders for missing images
  const slots: (string | null)[] = [...gallery]
  while (slots.length < 4) slots.push(null)

  const orientation = parseOrientation(sku)
  const collectionName = specs.collection ?? 'Flex'
  const collectionDesc = COLLECTION_DESC[collectionName] ?? null
  const hasSpecs = !!(specs.gemStone || specs.caratWeight || specs.metal || orientation || specs.color || specs.clarity)

  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Left col: 2×2 gallery, all slots 4:5 ── */}
        <div className={styles.galleryCol}>
          {heroIsIJewel && (
            <div className={styles.galleryItem}>
              <IJewelViewer src={ijewelUrl!} title={displayName} />
            </div>
          )}
          {slots.map((src, i) => (
            <div key={i} className={styles.galleryItem}>
              {src && (
                <Image
                  src={src}
                  alt={`${displayName} · view ${i + 1}`}
                  fill
                  priority={i === 0 && !heroIsIJewel}
                  sizes="(max-width: 860px) 50vw, 27.5vw"
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                />
              )}
            </div>
          ))}
        </div>

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
              {specs.metal && (
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

          <a
            href={`mailto:bez@bezambar.com?subject=Trade Pricing: ${sku}`}
            className={styles.cta}
          >
            Request Trade Pricing
          </a>
        </div>

      </div>
    </div>
  )
}
