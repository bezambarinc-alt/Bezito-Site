import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import type { PageRow } from '@/types/pages'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import { checkPageGate } from '@/lib/auth'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type ClientRow = Pick<PageRow, 'slug' | 'title' | 'blocks' | 'status' | 'password'>

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

  const NO_INQUIRY_TYPES = new Set(['inquire-cta', 'inquire-footer'])
  const blocks = (Array.isArray(page.blocks) ? page.blocks : [])
    .filter((b: { type?: string }) => !NO_INQUIRY_TYPES.has(b.type ?? ''))

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

  return (
    <main>
      <BlockRenderer blocks={blocks} />
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
