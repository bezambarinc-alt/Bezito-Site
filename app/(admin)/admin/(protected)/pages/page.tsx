import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import PagesClient from './PagesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Client Pages — Admin' }

export default async function AdminPagesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [pages, clients] = await Promise.all([
    sql<{
      slug: string; title: string; doc_type: string; status: string;
      client_id: number | null; client_name: string | null; client_slug: string | null;
      customer_pin: string | null; pin_expires_at: string | null; updated_at: string;
    }>(
      `SELECT p.slug, p.title, p.doc_type, p.status,
              p.client_id, p.customer_pin, p.pin_expires_at, p.updated_at,
              c.name AS client_name, c.slug AS client_slug
       FROM pages p
       LEFT JOIN clients c ON c.id = p.client_id
       WHERE p.doc_type IN ('showcase','proposal')
       ORDER BY p.updated_at DESC`,
    ),
    sql<{ id: number; slug: string; name: string }>(
      `SELECT id, slug, name FROM clients WHERE active = true ORDER BY name`,
    ),
  ])

  return (
    <PagesClient
      pages={pages as Parameters<typeof PagesClient>[0]['pages']}
      clients={clients}
    />
  )
}
