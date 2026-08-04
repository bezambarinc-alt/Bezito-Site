import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getAllProductParams } from '@/lib/queries'
import HeroVideo from '@/components/blocks/HeroVideo'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import InquireCta from '@/components/blocks/InquireCta'
import ProdPill from '@/components/layout/ProdPill'
import type { SpecItem } from '@/types/blocks'
import styles from './page.module.css'

// ISR — product pages are rebuilt from the Neon products cache at most hourly.
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  // Resilient at build time: if the DB is unreachable, fall back to on-demand ISR.
  try {
    return await getAllProductParams()
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Piece Not Found' }
  return {
    title: product.name,
    description: product.specs.lede ?? product.specs.subtitle ?? `${product.name} by Bez Ambar.`,
    openGraph: {
      title: `${product.name} · Bez Ambar`,
      description: product.specs.subtitle ?? product.name,
      images: product.specs.heroPosterUrl ? [{ url: product.specs.heroPosterUrl }] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const s = product.specs
  const heroVideo = s.heroVideoUrl ?? product.media.find((m) => m.type === 'video')?.url
  const heroPoster = s.heroPosterUrl ?? product.media.find((m) => m.type === 'video')?.poster
  const secondaryVideo = s.secondaryVideoUrl

  const specItems: SpecItem[] = [
    s.gemStone ? { label: 'Gem Stone', body: s.gemStone } : null,
    s.metal ? { label: 'Metal', body: s.metal } : null,
    s.caratWeight ? { label: 'Carat Weight', body: s.caratWeight } : null,
    { label: 'Made In', body: s.madeIn ?? 'Los Angeles' },
    { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
  ].filter((x): x is SpecItem => x !== null)

  return (
    <main>
      {heroVideo && (
        <HeroVideo
          block={{
            type: 'hero-video',
            videoUrl: heroVideo,
            posterUrl: heroPoster,
            refId: product.sku,
            refName: s.codeName,
          }}
        />
      )}

      <section className={styles.panel}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/jewelry">Jewelry</Link>
          <span aria-hidden>·</span>
          <Link href={`/jewelry/${category}`}>{category}</Link>
        </nav>
        <h1 className={styles.title}>{product.name}</h1>
        {s.subtitle && <p className={styles.subtitle}>{s.subtitle}</p>}
        {s.lede && <p className={styles.lede}>{s.lede}</p>}
      </section>

      {secondaryVideo && (
        <section className={styles.secondary}>
          <video autoPlay muted loop playsInline preload="none" poster={heroPoster}>
            <source src={secondaryVideo} type="video/mp4" />
          </video>
        </section>
      )}

      <section className={styles.specs}>
        <div className={styles.specsInner}>
          <SpecAccordion block={{ type: 'spec-accordion', title: 'Specifications', items: specItems }} />
        </div>
      </section>

      <InquireCta
        block={{
          type: 'inquire-cta',
          title: 'Request a Private Viewing',
          pieceTitle: product.name,
          sku: product.sku,
          btnLabel: 'Inquire About This Piece',
        }}
      />

      <ProdPill title={product.name} sku={product.sku} />
    </main>
  )
}
