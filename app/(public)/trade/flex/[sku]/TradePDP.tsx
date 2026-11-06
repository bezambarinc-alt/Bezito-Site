import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/products'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import { parseProductName } from '@/lib/product-name'
import styles from './pdp.module.css'

interface Props { product: Product }

export default function TradePDP({ product }: Props) {
  const { specs, sku, ijewelUrl, interactiveIsHero } = product
  const heroIsIJewel = Boolean(ijewelUrl && interactiveIsHero)
  const heroImage    = specs.heroPosterUrl ?? null
  const { title: displayName, variant } = parseProductName(product.name)

  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Left col: media ── */}
        <div className={styles.mediaCol}>
          {heroIsIJewel ? (
            <IJewelViewer src={ijewelUrl!} title={displayName} />
          ) : heroImage ? (
            <Image
              src={heroImage}
              alt={displayName}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 55vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
          ) : (
            <div className={styles.noImage} />
          )}
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
