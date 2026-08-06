import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact & Consultation — Bez Ambar',
  description:
    'Schedule a private consultation, inquire about a bespoke piece, or visit our Los Angeles atelier at 611 Wilshire Blvd.',
  openGraph: {
    title: 'Contact · Bez Ambar',
    description: 'Reach the Los Angeles atelier — private appointments, commissions, and care.',
  },
}

export default function ContactPage() {
  return (
    <main className={styles.page}>

      {/* ── Masthead ── */}
      <header className={styles.masthead}>
        <p className={styles.mastheadEyebrow}>Los Angeles Atelier</p>
        <h1 className={styles.mastheadTitle}>Begin a Conversation</h1>
        <hr className={styles.mastheadRule} />
        <p className={styles.mastheadLede}>
          Every inquiry is handled personally. Whether you are beginning a commission,
          inquiring about a piece from the collection, or arranging a private visit — we
          welcome your message.
        </p>
      </header>

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>

        {/* Form column */}
        <section className={styles.formCol}>
          <p className={styles.formHeading}>Send a Message</p>
          <ContactForm />
        </section>

        {/* Sidebar */}
        <aside className={styles.sidebar}>

          <div className={styles.block}>
            <span className={styles.blockLabel}>Telephone</span>
            <p className={styles.blockValue}>
              <a href="tel:2136299191">(213) 629-9191</a>
            </p>
            <p className={styles.blockMeta}>Mon – Fri, 10 am – 6 pm PT</p>
          </div>

          <div className={styles.block}>
            <span className={styles.blockLabel}>Email</span>
            <p className={styles.blockValue}>
              <a href="mailto:bez@bezambar.com">bez@bezambar.com</a>
            </p>
          </div>

          <hr className={styles.divider} />

          <div className={styles.block}>
            <span className={styles.blockLabel}>Atelier</span>
            <p className={styles.blockValue}>
              611 Wilshire Blvd<br />
              Los Angeles, CA 90017
            </p>
            <p className={styles.blockMeta}>By appointment only</p>
          </div>

          <hr className={styles.divider} />

          <p className={styles.sideNote}>
            Every piece is made to specification. We invite you to visit our atelier to
            experience the work in person and discuss your vision with Bez directly.
          </p>
        </aside>
      </div>

      {/* ── Services strip ── */}
      <div className={styles.services}>
        <div className={styles.servicesInner}>
          <div>
            <p className={styles.serviceLabel}>Bespoke Design</p>
            <p className={styles.serviceText}>One-of-a-kind pieces designed with you</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Complimentary Shipping</p>
            <p className={styles.serviceText}>Fully insured FedEx Priority delivery</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Provenance Certificate</p>
            <p className={styles.serviceText}>Signed certificate with every piece</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>LA Atelier</p>
            <p className={styles.serviceText}>Visit us by appointment — 611 Wilshire Blvd</p>
          </div>
        </div>
      </div>

    </main>
  )
}
