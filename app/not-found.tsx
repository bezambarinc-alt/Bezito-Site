import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Page Not Found — Bez Ambar',
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.glyph} aria-hidden>404</span>
        <h1 className={styles.title}>The piece has moved.</h1>
        <p className={styles.body}>
          What you&rsquo;re looking for may have been renamed, archived,
          or never existed at this address.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>Return Home</Link>
          <Link href="/jewelry/rings" className={styles.ghost}>View the Collection</Link>
        </div>
      </div>
    </main>
  )
}
