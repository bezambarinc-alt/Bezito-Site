import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/products'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import { parseProductName } from '@/lib/product-name'
import styles from './pdp.module.css'

interface Props { product: Product }

/** Build a 6-image gallery from available product visuals, padding with fallback. */
function buildGallery(product: Product): string[] {
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

export default function TradePDP({ product }: Props) {
  const { specs, sku, ijewelUrl, interactiveIsHero } = product
  const heroIsIJewel = Boolean(ijewelUrl && interactiveIsHero)
  const { title: displayName, variant } = parseProductName(product.name)
  const gallery = buildGallery(product)

  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Left col: gallery stack ── */}
        <div className={styles.galleryCol}>
          {heroIsIJewel && (
            <div className={styles.galleryItem}>
              <IJewelViewer src={ijewelUrl!} title={displayName} />
            </div>
          )}
          {gallery.map((src, i) => (
            <div key={i} className={styles.galleryItem}>
              <Image
                src={src}
                alt={`${displayName} · view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 860px) 100vw, 55vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
          ))}
        </div>

        {/* ── Right col: specs (sticky) ── */}
        <div className={styles.specCol}>
          <Link href="/trade/flex" className={styles.back}>← Flex Collection</Link>

          <p className={styles.eyebrow}>{specs.collection ?? 'Flex'}</p>
          <h1 className={styles.title}>{displayName}</h1>
          {variant && <p className={styles.variant}>{variant}</p>}
          <p className={styles.ref}>Ref. {sku}</p>

          {(specs.gemStone || specs.caratWeight || specs.metal) && (
            <dl className={styles.specList}>
              {specs.gemStone && (
                <>
                  <dt>Stone</dt>
                  <dd>{specs.gemStone}</dd>
                </>
              )}
              {specs.caratWeight && (
                <>
                  <dt>Total Carat Weight</dt>
                  <dd>{specs.caratWeight}ct</dd>
                </>
              )}
              {specs.metal && (
                <>
                  <dt>Metal</dt>
                  <dd>{specs.metal}</dd>
                </>
              )}
            </dl>
          )}

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
