import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import adminStyles from '../../admin.module.css'
import RequestsClient from './RequestsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Requests — Admin' }

export default async function RequestsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const requests = await sql<{
    id: number
    client_id: number
    client_name: string | null
    client_slug: string | null
    product_sku: string | null
    message: string
    status: string
    created_at: string
  }>(
    `SELECT r.id, r.client_id, r.product_sku, r.message, r.status, r.created_at,
            c.name AS client_name, c.slug AS client_slug
     FROM page_requests r
     LEFT JOIN clients c ON c.id = r.client_id
     ORDER BY
       CASE r.status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
       r.created_at DESC`,
  )

  const pending = requests.filter(r => r.status === 'pending').length

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Client Requests</h1>
        <span className={adminStyles.syncLink}>
          {pending > 0 ? `${pending} pending` : `${requests.length} total`}
        </span>
      </div>
      <RequestsClient requests={requests} />
    </div>
  )
}
