import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import AdminNav from './AdminNav'
import styles from './layout.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  async function logout() {
    'use server'
    ;(await cookies()).delete('session')
    redirect('/admin/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.wordmark}>Bez Ambar</p>
        <AdminNav />
        <div className={styles.userArea}>
          <span className={styles.userRole}>{session.sub as string}</span>
          <form action={logout} style={{ margin: 0 }}>
            <button type="submit" className={styles.logout}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
