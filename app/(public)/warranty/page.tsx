import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Warranty & Policies — Bez Ambar',
  description:
    'Bez Ambar lifetime warranty on craftsmanship and materials. Quality jewelry backed by our commitment to excellence since 1979.',
}

const UPDATED = '2026-07-07'

export default function WarrantyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Warranty &amp; Policies</h1>
        <p className={styles.meta}>Bez Ambar Inc. · Last updated: {UPDATED}</p>

        <section className={styles.section}>
          <h2>1. Lifetime Warranty</h2>
          <div className={styles.highlight}>
            <p>Every piece of Bez Ambar jewelry is protected by a comprehensive lifetime warranty on craftsmanship and materials.</p>
          </div>

          <h3>Coverage Period</h3>
          <ul>
            <li><strong>12 Months Full Coverage</strong> — All defects in materials and craftsmanship from the purchase date.</li>
            <li><strong>Ongoing Coverage</strong> — After the initial 12 months, warranty continues for the lifetime of the original owner with annual inspection at an authorized Bez Ambar service center.</li>
          </ul>

          <h3>What Is Covered</h3>
          <ul>
            <li>Defects in materials and craftsmanship</li>
            <li>Breakage of stones or prongs due to manufacturing defects</li>
            <li>Repairs and restoration to original condition</li>
          </ul>

          <h3>What Is Not Covered</h3>
          <ul>
            <li>Damage from accidents, misuse, or negligence</li>
            <li>Unauthorized repairs or modifications</li>
            <li>Normal wear and tear, including surface scratches and patina</li>
            <li>Loss or theft</li>
            <li>Damage from improper care or storage</li>
            <li>Chemical or environmental damage</li>
          </ul>

          <p>This warranty applies exclusively to the original purchaser and is non-transferable. Annual inspection at an authorized Bez Ambar service center is required to maintain coverage after the initial 12 months.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Security &amp; Privacy</h2>
          <p>Your privacy and security are paramount. All personal information you share with us is kept strictly confidential and never sold to third parties.</p>

          <h3>Secure Transactions</h3>
          <ul>
            <li>All transactions are protected with industry-standard SSL encryption</li>
            <li>Payment information is processed securely through trusted gateways</li>
            <li>We never store full payment card details on our servers</li>
          </ul>

          <h3>Data Protection</h3>
          <ul>
            <li>Personal information is used solely for consultation, order fulfillment, and customer service</li>
            <li>Your data is never shared with third parties without your explicit consent</li>
            <li>We maintain strict confidentiality of all client information</li>
          </ul>

          <p>For full details, see our <a href="/privacy-policy">Privacy Policy</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>3. Intellectual Property</h2>
          <p>All content on bezambar.com — including text, photography, video, jewelry designs, and proprietary cut names — is the exclusive property of Bez Ambar Inc. and is protected by copyright, trademark, and applicable intellectual property laws.</p>

          <h3>Proprietary Designs</h3>
          <ul>
            <li>The Blaze® cut and Elysian Cut™ are proprietary designs protected by intellectual property law</li>
            <li>Reproduction, distribution, or use without written consent is strictly prohibited</li>
            <li>You may view and print content for personal, non-commercial use only</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Contact</h2>
          <p>
            Questions about your warranty or our policies:<br />
            Bez Ambar Inc.<br />
            611 Wilshire Blvd, Los Angeles, CA 90017<br />
            <a href="mailto:bez@bezambar.com">bez@bezambar.com</a><br />
            <a href="tel:2136299191">(213) 629-9191</a>
          </p>
        </section>
      </div>
    </main>
  )
}
