import { redirect } from 'next/navigation'
import { getClientSession } from '@/lib/client-auth'
import { sql } from '@/lib/db'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Portal', robots: 'noindex' }

export default async function PortalDashboard() {
  const session = await getClientSession()
  if (!session) redirect('/portal/login')

  const pages = await sql<{
    slug: string; title: string; doc_type: string; status: string;
    customer_pin: string | null; pin_expires_at: string | null; updated_at: string;
  }>(
    `SELECT slug, title, doc_type, status, customer_pin, pin_expires_at, updated_at
     FROM pages
     WHERE client_id = $1
     ORDER BY doc_type DESC, updated_at DESC`,
    [session.clientId],
  )

  const [client] = await sql<{ name: string }>(
    `SELECT name FROM clients WHERE id = $1`,
    [session.clientId],
  )

  return (
    <DashboardClient
      pages={pages as Parameters<typeof DashboardClient>[0]['pages']}
      clientName={client?.name ?? session.sub}
    />
  )
}
