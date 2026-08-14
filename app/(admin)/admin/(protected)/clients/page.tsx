import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import ClientsClient from './ClientsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Clients — Admin' }

export default async function ClientsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const clients = await sql<{
    id: number; slug: string; name: string; contact_email: string;
    active: boolean; page_count: number; created_at: string;
  }>(
    `SELECT c.id, c.slug, c.name, c.contact_email, c.active, c.created_at,
            COUNT(p.id)::int AS page_count
     FROM clients c
     LEFT JOIN pages p ON p.client_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
  )

  return <ClientsClient initial={clients} />
}
