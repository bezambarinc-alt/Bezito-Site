import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import type { PageRow } from '@/types/pages'
import BlockRenderer from '@/components/blocks/BlockRenderer'

export const dynamic = 'force-dynamic'

type ClientRow = Pick<PageRow, 'slug' | 'title' | 'blocks' | 'status'>

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [page] = await sql<ClientRow>(
    `SELECT slug, title, blocks, status FROM pages WHERE slug=$1 AND status='live' AND doc_type='client'`,
    [slug],
  )
  if (!page) notFound()

  const blocks = Array.isArray(page.blocks) ? page.blocks : []

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
  const [page] = await sql<{ title: string; blocks: unknown[] }>(`SELECT title, blocks FROM pages WHERE slug=$1 AND doc_type='client'`, [slug])
  const blocks = Array.isArray(page?.blocks) ? (page.blocks as Array<Record<string, unknown>>) : []
  const heroBlock = blocks.find((b) => b.type === 'hero-split')
  const ogImage = heroBlock?.posterUrl as string | undefined
  return {
    title: page?.title ?? 'Client Page',
    robots: { index: false, follow: false },
    ...(ogImage && {
      openGraph: { images: [{ url: ogImage, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', images: [ogImage] },
    }),
  }
}
