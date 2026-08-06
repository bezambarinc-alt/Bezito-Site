import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bez Ambar',
  description:
    'Bez Ambar Inc. privacy policy. How we collect, use, and protect your personal information.',
}

const UPDATED = '2026-07-06'

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Bez Ambar Inc. · Last updated: {UPDATED}</p>

        <section className={styles.section}>
          <h2>1. Who We Are</h2>
          <p>Bez Ambar Inc. ("Bez Ambar," "we," "us," or "our") operates bezambar.com. Our registered business address is 611 Wilshire Blvd, Los Angeles, CA 90017. You can reach us at <a href="mailto:bez@bezambar.com">bez@bezambar.com</a> or <a href="tel:2136299191">(213) 629-9191</a>.</p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us:</p>
          <ul>
            <li><strong>Contact and inquiry forms:</strong> name, email address, phone number, and message content</li>
            <li><strong>Consultation requests:</strong> scheduling information and design preferences you share with us</li>
            <li><strong>Communications:</strong> emails and messages you send us</li>
          </ul>
          <p>We also collect information automatically when you visit our site:</p>
          <ul>
            <li>Pages visited, time on site, and referring URLs (via analytics tools)</li>
            <li>Device type, browser, and operating system</li>
            <li>IP address and approximate location</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiries and consultation requests</li>
            <li>To provide customer service and follow up on orders or pieces</li>
            <li>To send you relevant communications about our collection (only with your consent)</li>
            <li>To improve our website and understand how visitors engage with our content</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share it with:</p>
          <ul>
            <li><strong>Service providers:</strong> email delivery, analytics, and payment processing — only as necessary to provide our services</li>
            <li><strong>Legal requirements:</strong> if required by law or to protect our rights</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies for analytics and to improve site performance. We use Google Analytics and may use advertising pixels to understand how our marketing performs. You can opt out of analytics tracking via your browser settings or the Google Analytics opt-out browser add-on.</p>
          <p>A cookie consent notice will appear on your first visit. You may withdraw consent at any time by clearing your browser cookies.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Your Rights (California / CCPA)</h2>
          <p>If you are a California resident, you have the right to:</p>
          <ul>
            <li>Know what personal information we collect and how we use it</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of the sale of your personal information (we do not sell it)</li>
            <li>Non-discrimination for exercising your privacy rights</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:bez@bezambar.com">bez@bezambar.com</a> with the subject line "Privacy Request."</p>
        </section>

        <section className={styles.section}>
          <h2>7. Data Retention</h2>
          <p>We retain your information for as long as necessary to fulfill the purposes described in this policy, or as required by law. Inquiry and contact data is typically retained for 3 years unless you request deletion.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Security</h2>
          <p>We use industry-standard measures to protect your information, including SSL encryption and secure hosting. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className={styles.section}>
          <h2>9. Changes to This Policy</h2>
          <p>We may update this policy from time to time. The "Last updated" date at the top of this page reflects when changes were last made. Continued use of our site after updates constitutes acceptance of the revised policy.</p>
        </section>

        <section className={styles.section}>
          <h2>10. Contact Us</h2>
          <p>
            For any privacy questions or to exercise your rights:<br />
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
