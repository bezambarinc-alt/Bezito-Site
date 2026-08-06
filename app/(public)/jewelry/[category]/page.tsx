import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid'
import styles from './page.module.css'

// Touches the DB at request time — opt out of static generation.
export const dynamic = 'force-dynamic'

const CATEGORIES: Record<string, {
  title: string
  intro: string
  eyebrow: string
  videoUrl?: string
}> = {
  rings: {
    eyebrow: 'The Collection',
    title: 'Rings',
    intro: 'Engagement, cocktail, and eternity — each stone chiseled to catch the light.',
    videoUrl: 'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Rings/c0578_4k_v1_2160p_wwnfcz.mp4',
  },
  bracelets: {
    eyebrow: 'The Collection',
    title: 'Bracelets',
    intro: 'Articulated lines of brilliance for the wrist.',
    videoUrl: 'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4',
  },
  necklaces: {
    eyebrow: 'The Collection',
    title: 'Necklaces',
    intro: 'Statement and everyday, drawn from the atelier.',
  },
  earrings: {
    eyebrow: 'The Collection',
    title: 'Earrings',
    intro: 'Studs, drops, and hoops in signature Bez Ambar cuts.',
  },
  'wedding-bands': {
    eyebrow: 'The Collection',
    title: 'Wedding Bands',
    intro: 'Eternity bands and wedding rings — the Elysian Cut™ in continuous line.',
    videoUrl: 'https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4',
  },
  'engagement-rings': {
    eyebrow: 'The Collection',
    title: 'Engagement Rings',
    intro: 'Every engagement ring begins with the stone. We cut it here.',
  },
  pendants: {
    eyebrow: 'The Collection',
    title: 'Pendants',
    intro: 'Stone and metal, suspended — from the simplest to the exceptional.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category]
  const label = cat?.title ?? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `${label} — Bez Ambar`,
    description: cat?.intro ?? `${label} by Bez Ambar — Los Angeles atelier, since 1979.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = CATEGORIES[category] ?? {
    eyebrow: 'The Collection',
    title: category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    intro: 'From the Bez Ambar atelier.',
  }

  return (
    <>
      {/* ── Category hero — dark, with video if available ── */}
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
        <div className={styles.heroOverlay} />
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>{cat.eyebrow}</p>
          <h1 className={styles.heroTitle}>{cat.title}</h1>
          <p className={styles.heroIntro}>{cat.intro}</p>
        </div>
      </section>

      <main className={styles.main}>
        {/* Next.js Suspense streaming — shell renders immediately, grid streams in */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid category={category} />
        </Suspense>
      </main>
    </>
  )
}
