import Link from 'next/link'
import styles from './Footer.module.css'

/**
 * Multi-column footer. Server component — pure markup, no interactivity.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brandCol}>
          <div className={styles.wordmark}>BEZ AMBAR</div>
          <p className={styles.tagline}>Inventor of the Princess Cut</p>
          <p className={styles.meta}>Los Angeles · Est. 1979</p>
          <ul className={styles.social} aria-label="Social">
            <li><a href="https://instagram.com/bezambarinc" target="_blank" rel="noreferrer noopener">Instagram</a></li>
            <li><a href="https://www.pinterest.com/bezambar" target="_blank" rel="noreferrer noopener">Pinterest</a></li>
            <li><a href="https://www.youtube.com/@bezambar" target="_blank" rel="noreferrer noopener">YouTube</a></li>
          </ul>
        </div>

        <nav className={styles.col} aria-label="Shop">
          <h3 className={styles.colTitle}>Shop</h3>
          <ul>
            <li><Link href="/jewelry">All Jewelry</Link></li>
            <li><Link href="/jewelry/rings">Rings</Link></li>
            <li><Link href="/jewelry/bracelets">Bracelets</Link></li>
            <li><Link href="/jewelry/necklaces">Necklaces</Link></li>
            <li><Link href="/jewelry/earrings">Earrings</Link></li>
            <li><Link href="/archive">The Archive</Link></li>
          </ul>
        </nav>

        <nav className={styles.col} aria-label="Service">
          <h3 className={styles.colTitle}>Service</h3>
          <ul>
            <li><Link href="/contact">Private Appointment</Link></li>
            <li><Link href="/contact">Commission a Piece</Link></li>
            <li><Link href="/ring-size-chart">Ring Size Chart</Link></li>
            <li><Link href="/diamond-education">Diamond Education</Link></li>
            <li><Link href="/contact">Repair &amp; Care</Link></li>
          </ul>
        </nav>

        <nav className={styles.col} aria-label="Visit">
          <h3 className={styles.colTitle}>Visit</h3>
          <ul>
            <li><Link href="/about-bez-ambar">About Bez Ambar</Link></li>
            <li><Link href="/the-story">The Story</Link></li>
            <li><Link href="/elysian-cut">The Elysian Cut</Link></li>
            <li><Link href="/journal">Journal</Link></li>
            <li><Link href="/contact">Los Angeles Atelier</Link></li>
          </ul>
        </nav>
      </div>

      <div className={styles.legal}>
        <p>© {year} Bez Ambar, Inc. All rights reserved.</p>
        <ul className={styles.legalLinks}>
          <li><Link href="/contact">Privacy</Link></li>
          <li><Link href="/contact">Terms</Link></li>
          <li><Link href="/contact">Accessibility</Link></li>
        </ul>
      </div>
    </footer>
  )
}
