import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminNav from './AdminNav'
import styles from './layout.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.wordmark}>Bez Ambar</p>
        <AdminNav />
        <div className={styles.userArea}>
          <span className={styles.userRole}>{session.sub}</span>
          <a className={styles.logout} href="/api/auth/logout">Sign out</a>
        </div>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
