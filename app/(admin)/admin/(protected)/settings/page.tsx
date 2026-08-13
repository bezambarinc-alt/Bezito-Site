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

export interface WhitelistEntry {
  id: number
  ip_address: string
  label: string | null
  expires_at: string
  created_at: string
  expired: boolean
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [users, whitelist] = await Promise.all([
    sql<AdminUser>(
      `SELECT id, email, role, created_at FROM admin_users ORDER BY created_at ASC`,
    ),
    sql<WhitelistEntry>(
      `SELECT id, ip_address, label, expires_at::text, created_at::text,
              (expires_at <= now()) AS expired
       FROM whitelisted_ips ORDER BY expires_at DESC`,
    ),
  ])

  return <SettingsClient users={users} whitelist={whitelist} currentUser={session.sub as string} />
}
