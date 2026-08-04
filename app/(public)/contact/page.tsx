import type { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach the Bez Ambar atelier in Los Angeles — private appointments, commissions, and care.',
  openGraph: { title: 'Contact · Bez Ambar', description: 'Reach the Los Angeles atelier.' },
}

const SERVICES = [
  'Private Appointments',
  'Bespoke Commissions',
  'Repair & Restoration',
  'Ring Resizing',
  'Cleaning & Care',
  'Virtual Consultations',
]

export default function ContactPage() {
  return (
    <main className={styles.wrap}>
      <div className={styles.grid}>
        <section className={styles.formCol}>
          <p className="ba-eyebrow">By Appointment</p>
          <h1 className={styles.title}>Contact the Atelier</h1>
          <p className={styles.intro}>
            Every Bez Ambar piece is presented privately. Share a few details and a specialist will be in touch.
          </p>
          <ContactForm />
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Los Angeles Atelier</h2>
            <address className={styles.address}>
              550 South Hill Street<br />
              Los Angeles, California 90013
            </address>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Direct</h2>
            <p><a href="tel:+13102743333">+1 (310) 274-3333</a></p>
            <p><a href="mailto:atelier@bezambar.com">atelier@bezambar.com</a></p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Services</h2>
            <ul className={styles.services}>
              {SERVICES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Hours</h2>
            <p className={styles.hours}>Monday – Friday · 10am – 6pm PT<br />Saturday by appointment</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
