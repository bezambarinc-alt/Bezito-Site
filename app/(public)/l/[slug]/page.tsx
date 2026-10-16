import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import type { PageRow } from '@/types/pages'
import BlockRenderer, { hasInquireCta } from '@/components/blocks/BlockRenderer'
import ProdPill from '@/components/layout/ProdPill'

export const dynamic = 'force-dynamic'

type LandingRow = Pick<PageRow, 'slug' | 'title' | 'blocks'>

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [page] = await sql<LandingRow>(
    `SELECT slug, title, blocks FROM pages WHERE slug=$1 AND doc_type='landing' AND status='live'`,
    [slug],
  )
  if (!page) notFound()

  const blocks = Array.isArray(page.blocks) ? page.blocks : []

  return (
    <main>
      <BlockRenderer blocks={blocks} />
      {hasInquireCta(blocks) && <ProdPill title={page.title} />}
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [page] = await sql<{ title: string }>(
    `SELECT title FROM pages WHERE slug=$1 AND doc_type='landing'`,
    [slug],
  )
  return { title: page?.title ?? 'Bez Ambar' }
}
