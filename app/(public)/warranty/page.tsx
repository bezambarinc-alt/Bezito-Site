import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Warranty & Policies',
  description:
    'Bez Ambar limited warranty on craftsmanship and materials. Quality jewelry backed by our commitment to excellence since 1979.',
}

const UPDATED = '2026-07-07'

export default function WarrantyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Warranty &amp; Policies</h1>
        <p className={styles.meta}>Bez Ambar Inc. · Last updated: {UPDATED}</p>

        <section className={styles.section}>
          <h2>1. Certificate and Limited Warranty</h2>
          <div className={styles.highlight}>
            <p>You&rsquo;re getting a genuine, defect-free Bez Ambar original design, unless otherwise explicitly stated. If you find any material or workmanship defects in your Bez Ambar jewelry, we&rsquo;ve got you covered — we&rsquo;ll repair or replace it free of charge, as long as you adhere to the conditions of this warranty.</p>
          </div>

          <h3>Conditions of Coverage</h3>
          <ul>
            <li><strong>Warranty Registration</strong> — To activate this warranty, registration of your purchase on bezambar.com is mandatory. Unregistered jewelry will not be covered.</li>
            <li><strong>Authenticity Stamp</strong> — Authentic Bez Ambar jewelry bears our unique stamp. Unstamped items aren&rsquo;t covered. Return any unstamped pieces to us for immediate stamping to ensure warranty eligibility.</li>
            <li><strong>Warranty Period</strong> — This warranty is valid for a period of one year from the date of purchase.</li>
            <li><strong>Annual Inspections</strong> — Keep your warranty active with an annual inspection by Bez Ambar. It is your responsibility to maintain inspection records. Lack of a signed, dated inspection certificate from the past year will void your warranty.</li>
            <li><strong>Bez Ambar-Only Repairs</strong> — For warranty compliance, all repairs, resizing, or other modifications must be exclusively performed by Bez Ambar. Unauthorized work voids this warranty.</li>
          </ul>

          <h3>Exclusions</h3>
          <ul>
            <li>Damage due to regular or abnormal wear and tear</li>
            <li>Mishandling or negligence</li>
            <li>Unauthorized repairs or modifications</li>
          </ul>
          <p>The warranty can be reinstated if the necessary repairs are completed by Bez Ambar.</p>

          <h3>Claim Process</h3>
          <p>To make a warranty claim, <a href="/contact">contact us</a> with proof of purchase and any relevant documentation. Shipping fees and other potential costs may apply.</p>

          <h3>Certificate of Authenticity</h3>
          <p>Register your Bez Ambar creation on our website and we will send you a Certificate of Authenticity that validates your warranty. Each certificate outlines the details of your piece, signed personally by the designer — your assurance of genuine craftsmanship and a timeless heirloom to pass down through generations.</p>
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
            <li>The Blaze®, Divine Cut®, and Elysian Cut™ are proprietary designs protected by intellectual property law</li>
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
