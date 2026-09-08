import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bez Ambar',
  description:
    'Bez Ambar Inc. data use and security policy. How we collect, use, and protect your personal information.',
}

const UPDATED = '2026-09-08'

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Bez Ambar Inc. — Data Use &amp; Security Policy · Last updated: {UPDATED}</p>

        <section className={styles.section}>
          <h2>Overview</h2>
          <p>
            The website located at bezambar.com (the "Site") is operated by Bez Ambar Inc. ("Bez Ambar," "we," "us," or "our").
            This Bez Ambar Data Use &amp; Security Policy ("Privacy Policy") covers information collected or submitted by you through the Site.
            By using or accessing the Site, you accept the terms of this Privacy Policy and the{' '}
            <a href="/terms">Terms of Service</a> of this website.
          </p>
          <p>
            Our goal is to provide you with relevant information about our jewelry and services.
            To do so, we (or third parties on our behalf) may collect personal information about you, as well as information about your interaction with the Site.
            Because we value your privacy, we have implemented policies and procedures to safeguard this information.
            As the Site develops, this policy may change — we encourage you to review it periodically.
          </p>
        </section>

        <section className={styles.section}>
          <h2>1. Who We Are</h2>
          <p>
            Bez Ambar Inc. operates bezambar.com. Our atelier is located at 611 Wilshire Blvd, Los Angeles, CA 90017.
            You can reach us at <a href="mailto:bez@bezambar.com">bez@bezambar.com</a> or{' '}
            <a href="tel:2136299191">(213) 629-9191</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us:</p>
          <ul>
            <li><strong>Contact and inquiry forms:</strong> name, email address, phone number, and message content</li>
            <li><strong>Consultation requests:</strong> scheduling information and design preferences you share with us</li>
            <li><strong>Special occasions:</strong> birthdays, anniversaries, or other meaningful dates you share so we can provide relevant service and offer timely reminders for special pieces</li>
            <li><strong>Communications:</strong> emails and messages you send us</li>
          </ul>
          <p>We also collect information automatically when you visit our site:</p>
          <ul>
            <li>Pages visited, time on site, and referring URLs (via first-party analytics)</li>
            <li>Device type, browser, and operating system</li>
            <li>IP address and approximate location</li>
            <li>Internet Service Provider (ISP) and clickstream data</li>
          </ul>
          <p>We only use this information to provide our goods or services to you and to improve your experience with our site.</p>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiries and consultation requests</li>
            <li>To provide customer service and follow up on orders or commissions</li>
            <li>To send you relevant communications about our collection (only with your consent)</li>
            <li>To provide personalized outreach around important dates you have shared with us</li>
            <li>To improve our website and understand how visitors engage with our content</li>
            <li>To customize your website experience and make our communications more relevant</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Sharing Your Information</h2>
          <p>We will not sell your personal information to any third parties. We may share your information with:</p>
          <ul>
            <li><strong>Service providers:</strong> email delivery, analytics, and payment processing — only as necessary to provide our services. All third parties who work on our behalf agree to safeguard your information and not use it to contact you independently.</li>
            <li><strong>Business transfers:</strong> in the event Bez Ambar Inc. is acquired or merges with another company, your information may transfer as part of that transaction. We will provide prominent notice on the Site if this occurs.</li>
            <li><strong>Legal requirements:</strong> if required by law, court order, subpoena, or to protect our rights. We will attempt to provide notice to you in such an event.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies for analytics and to improve site performance.
            We run first-party analytics only — page views, session counts, and referral sources are logged to our own systems and are not shared with advertising networks or data brokers.
            We do not use Google Analytics or third-party advertising pixels.
          </p>
          <p>
            A <code>ba_sid</code> session cookie (30-minute window) is set to count unique visits and correlate page views within a session. No personal information is stored in this cookie.
            You may manage your cookie preferences at any time using the consent banner or by adjusting your browser settings; the site remains fully functional without analytics cookies.
          </p>
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
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:bez@bezambar.com?subject=Privacy%20Request">bez@bezambar.com</a> with the subject line "Privacy Request,"
            or visit our <a href="/legal/ccpa-opt-out">CCPA Opt-Out page</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to fulfill the purposes described in this policy, or as required by law.
            Inquiry and contact data is typically retained for 3 years unless you request deletion.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Security</h2>
          <p>
            We handle your personal information with appropriate standards of information security.
            Our policies and procedures are designed to ensure the physical and electronic security of your personally identifiable information —
            including limiting the number of people with access to our systems, employing SSL encryption, secure hosting, and strong password policies.
            No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last updated" date at the top of this page reflects when changes were last made.
            Continued use of our site after updates constitutes acceptance of the revised policy.
          </p>
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
