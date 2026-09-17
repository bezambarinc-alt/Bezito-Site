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
    has_pin: boolean; pin_expires_at: string | null; updated_at: string;
  }>(
    // customer_pin is a bcrypt hash now, so there is nothing display-worthy to
    // select — only whether a code is set. The plaintext is shown once, in the
    // response to the POST that generates it.
    `SELECT slug, title, doc_type, status,
            customer_pin IS NOT NULL AS has_pin, pin_expires_at, updated_at
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
