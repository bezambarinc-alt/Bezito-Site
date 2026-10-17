import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import type { PageRow } from '@/types/pages'
import type { Product } from '@/types/products'
import type { SpecItem } from '@/types/blocks'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import LayoutDefault from '@/app/(public)/jewelry/[category]/[slug]/layouts/LayoutDefault'
import { checkPageGate } from '@/lib/auth'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type ClientRow = Pick<PageRow, 'slug' | 'title' | 'blocks' | 'status' | 'password'>

/** Data shape stored in blocks when doc_type='client' uses the product page layout. */
interface ProductLayoutData {
  type: 'product-layout'
  name: string
  sku?: string
  category?: string
  lede?: string
  subtitle?: string
  ijewelUrl?: string
  heroPosterUrl?: string
  specItems?: SpecItem[]
}

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pw?: string }>
}) {
  const { slug } = await params
  const { pw } = await searchParams

  const [page] = await sql<ClientRow>(
    `SELECT slug, title, blocks, status, password FROM pages WHERE slug=$1 AND status='live' AND doc_type='client'`,
    [slug],
  )
  if (!page) notFound()

  const blocks = Array.isArray(page.blocks) ? page.blocks : []

  // Password gate for private client pages.
  const { granted } = await checkPageGate(page.slug, page.password, pw)
  if (!granted) {
    return (
      <main className={styles.gate}>
        <div className={styles.gateInner}>
          <p className="ba-eyebrow">Private Presentation</p>
          <h1 className={styles.gateTitle}>{page.title}</h1>
          <p className={styles.gateBody}>Enter the access code provided by your Bez Ambar specialist.</p>
          <form method="GET" className={styles.gateForm}>
            <input name="pw" type="password" placeholder="Access code" aria-label="Access code" autoFocus />
            <button type="submit">Enter</button>
          </form>
        </div>
      </main>
    )
  }

  // If the first block is product-layout, render using the real product page template
  // so the client page matches the live product page with no CSS reinvention.
  const firstBlock = blocks[0] as ProductLayoutData | undefined
  if (firstBlock?.type === 'product-layout') {
    const d = firstBlock
    const category = d.category ?? 'jewelry'
    const product: Product = {
      sku: d.sku ?? slug,
      slug,
      name: d.name,
      featured: false,
      specs: {
        category,
        lede: d.lede,
        subtitle: d.subtitle,
        heroPosterUrl: d.heroPosterUrl,
      },
      ijewelUrl: d.ijewelUrl ?? null,
      interactiveIsHero: Boolean(d.ijewelUrl),
      media: [],
      relatedSkus: [],
      view1Url: null,
      view2Url: null,
      view3Url: null,
      zohoId: '',
      price: null,
      syncedAt: '',
    }
    return (
      <LayoutDefault
        product={product}
        heroVideo={undefined}
        heroPoster={d.heroPosterUrl}
        onHandPhoto={undefined}
        category={category}
        categoryLabel={d.category ?? ''}
        specItems={d.specItems ?? []}
        views={[]}
      />
    )
  }

  // Default: block-based rendering
  const NO_INQUIRY_TYPES = new Set(['inquire-cta', 'inquire-footer'])
  const renderable = blocks.filter((b: { type?: string }) => !NO_INQUIRY_TYPES.has(b.type ?? ''))
  return (
    <main>
      <BlockRenderer blocks={renderable} />
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [page] = await sql<{ title: string }>(`SELECT title FROM pages WHERE slug=$1 AND doc_type='client'`, [slug])
  return {
    title: page?.title ?? 'Client Page',
    robots: { index: false, follow: false },
  }
}
