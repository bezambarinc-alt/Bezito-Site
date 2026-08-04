import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Page {
  slug: string
  title: string
  blocks: unknown[]
  status: string
  password: string | null
}

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [page] = await sql<Page>(
    `SELECT slug, title, blocks, status, password FROM pages WHERE slug=$1 AND status='live'`,
    [slug],
  )
  if (!page) notFound()

  return (
    <main style={{ padding: '2rem', fontFamily: 'Georgia, serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>{page.title}</h1>
      {/* Block renderer goes here — placeholder for now */}
      <pre style={{ fontSize: '0.8rem', opacity: 0.5 }}>{JSON.stringify(page.blocks, null, 2)}</pre>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [page] = await sql<{ title: string }>(`SELECT title FROM pages WHERE slug=$1`, [slug])
  return { title: page?.title ?? 'Bez Ambar' }
}
