import type { Metadata } from 'next'
import styles from '../../legal.module.css'

export const metadata: Metadata = {
  title: 'Do Not Sell My Personal Information — Bez Ambar',
  description:
    'California residents: exercise your CCPA rights. Bez Ambar does not sell personal information.',
}

export default function CcpaOptOutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Do Not Sell My Personal Information</h1>
        <p className={styles.meta}>California Consumer Privacy Act (CCPA) · Bez Ambar Inc.</p>

        <section className={styles.section}>
          <h2>Our Policy on Selling Data</h2>
          <p>
            Bez Ambar Inc. does not sell, rent, or trade your personal information to third parties.
            This page is provided as required under the California Consumer Privacy Act (CCPA) to
            give California residents a clear point of contact for privacy requests.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your CCPA Rights</h2>
          <p>As a California resident, you have the right to:</p>
          <ul>
            <li>Know what personal information we collect and how it is used</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of the sale of your personal information (we do not sell it)</li>
            <li>Non-discrimination for exercising your privacy rights</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Submit a Privacy Request</h2>
          <p>
            To submit a request to know, delete, or correct your personal information, contact us
            directly:
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:bez@bezambar.com?subject=Privacy%20Request">bez@bezambar.com</a>
            <br />
            <strong>Subject line:</strong> Privacy Request
            <br />
            <strong>Phone:</strong> <a href="tel:2136299191">(213) 629-9191</a>
          </p>
          <p>
            We will respond to verified requests within 45 days, as required by California law.
          </p>
        </section>

        <section className={styles.section}>
          <h2>More Information</h2>
          <p>
            For complete details on how we collect and use personal information, see our{' '}
            <a href="/privacy-policy">Privacy Policy</a>.
          </p>
        </section>
      </div>
    </main>
  )
}
