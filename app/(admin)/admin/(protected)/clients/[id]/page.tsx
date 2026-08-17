import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import ClientDetailClient from './ClientDetailClient'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Ctx) {
  const { id } = await params
  const [client] = await sql<{ name: string }>(
    `SELECT name FROM clients WHERE id = $1`, [parseInt(id, 10)],
  )
  return { title: client ? `${client.name} — Admin` : 'Client — Admin' }
}

export default async function ClientDetailPage({ params }: Ctx) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const clientId = parseInt(id, 10)
  if (isNaN(clientId)) notFound()

  const [[client], proposals, pages, requests] = await Promise.all([
    sql<{
      id: number; slug: string; name: string; contact_email: string;
      active: boolean; created_at: string;
    }>(
      `SELECT id, slug, name, contact_email, active, created_at
       FROM clients WHERE id = $1 LIMIT 1`,
      [clientId],
    ),
    sql<{
      slug: string; title: string; status: string; shared: boolean;
      template_id: string | null; updated_at: string;
    }>(
      `SELECT slug, title, status, shared, template_id, updated_at
       FROM pages WHERE client_id = $1 AND doc_type = 'proposal'
       ORDER BY updated_at DESC`,
      [clientId],
    ),
    sql<{
      slug: string; title: string; status: string;
      customer_pin: string | null; updated_at: string;
    }>(
      `SELECT slug, title, status, customer_pin, updated_at
       FROM pages WHERE client_id = $1 AND doc_type = 'showcase'
       ORDER BY updated_at DESC`,
      [clientId],
    ),
    sql<{
      id: number; product_sku: string | null; message: string;
      status: string; created_at: string;
    }>(
      `SELECT id, product_sku, message, status, created_at
       FROM page_requests WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId],
    ),
  ])

  if (!client) notFound()

  return (
    <ClientDetailClient
      client={client}
      proposals={proposals}
      pages={pages}
      requests={requests}
    />
  )
}
