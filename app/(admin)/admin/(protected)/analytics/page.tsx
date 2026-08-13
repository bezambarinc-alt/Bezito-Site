import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')
  return <AnalyticsClient />
}
