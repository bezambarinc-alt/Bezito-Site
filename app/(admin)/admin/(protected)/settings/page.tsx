import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export interface AdminUser {
  id: number
  email: string
  role: string
  created_at: string
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const users = await sql<AdminUser>(
    `SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC`,
  )

  return <SettingsClient users={users} currentUser={session.sub as string} />
}
