import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid'
import { getCategoryMeta, getCategoryLabel } from '@/lib/data/categories'
import styles from './page.module.css'

// Touches the DB at request time — opt out of static generation.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryMeta(category)
  const label = getCategoryLabel(category)
  return {
    title: `${label} — Bez Ambar`,
    description: cat.intro,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = getCategoryMeta(category)

  return (
    <>
      {/* ── Category hero — dark, with optional video ── */}
      <section className={styles.hero}>
        {cat.videoUrl ? (
          <video
            className={styles.heroVideo}
            autoPlay muted loop playsInline preload="none"
            aria-hidden="true"
          >
            <source src={cat.videoUrl} type="video/mp4" />
          </video>
        ) : null}
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>{cat.eyebrow}</p>
          <h1 className={styles.heroTitle}>{cat.title}</h1>
          <p className={styles.heroIntro}>{cat.intro}</p>
        </div>
      </section>

      <div className={styles.productSection}>
        <main className={styles.main}>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid category={category} />
          </Suspense>
        </main>
      </div>
    </>
  )
}
