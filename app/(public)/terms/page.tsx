import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = {
  title: 'Terms of Service — Bez Ambar',
  description:
    'Terms and conditions governing use of bezambar.com and all services offered by Bez Ambar Inc.',
}

const UPDATED = '2026-09-08'

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.meta}>Bez Ambar Inc. · Last updated: {UPDATED}</p>

        <section className={styles.section}>
          <p>
            Please read the following Terms and Conditions carefully before using this website.
            All users of this site agree that access to and use of bezambar.com (the "Site") are subject to the following terms and conditions and other applicable law.
            If you do not agree to these terms, please do not use the Site.
          </p>
        </section>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Site, you agree to be bound by these Terms of Service and our{' '}
            <a href="/privacy-policy">Privacy Policy</a>. These terms apply to all visitors and users of the Site.
            These terms and conditions are applicable to you upon your accessing the Site and may be terminated by Bez Ambar Inc.
            without notice at any time, for any reason.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. About Bez Ambar</h2>
          <p>
            Bez Ambar Inc. is a fine jewelry design house based in Los Angeles, California.
            Our atelier is located at 611 Wilshire Blvd, Los Angeles, CA 90017.
            All consultations are by appointment.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Copyright</h2>
          <p>
            The entire content included in this Site — including but not limited to text, graphics, photography, jewelry designs, and code — is copyrighted as a collective work under United States and other copyright laws, and is the property of Bez Ambar Inc. Copyright © 2003–2026 Bez Ambar Inc. All rights reserved.
          </p>
          <p>
            Permission is granted to electronically copy and print portions of this Site for the sole purpose of placing an inquiry with Bez Ambar Inc. or purchasing Bez Ambar products.
            You may display and print portions of the material from different areas of the Site solely for your own non-commercial use.
            Any other use — including reproduction, distribution, display, or transmission of the content of this Site — is strictly prohibited without prior written authorization from Bez Ambar Inc.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Trademarks</h2>
          <p>
            All trademarks, service marks, and trade names of Bez Ambar Inc. used on the Site — including but not limited to Bez Ambar®, Blaze®, and Elysian Cut™ — are trademarks or registered trademarks of Bez Ambar Inc.
            These marks may not be used in connection with any product or service without the prior written consent of Bez Ambar Inc.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Use of the Site</h2>
          <p>You agree to use the Site only for lawful purposes. You may not:</p>
          <ul>
            <li>Use the Site in any way that violates applicable laws or regulations</li>
            <li>Reproduce, duplicate, copy, or exploit any portion of the Site without express written permission</li>
            <li>Harass, threaten, or impersonate others — including Bez Ambar employees, representatives, or other visitors</li>
            <li>Upload or transmit any content that is libelous, defamatory, obscene, abusive, illegal, or otherwise objectionable</li>
            <li>Transmit unsolicited advertising or promotional material</li>
            <li>Attempt to gain unauthorized access to any part of the Site or its systems</li>
            <li>Introduce viruses, malware, or any other harmful code</li>
            <li>Upload commercial content or solicit others to join external commercial services</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Product Information and Typographical Errors</h2>
          <p>
            We make every effort to ensure product descriptions and specifications are accurate.
            In the event that a Bez Ambar product is mistakenly listed at an incorrect price or with an inaccurate description,
            Bez Ambar Inc. reserves the right to refuse or cancel any orders placed for that product, whether or not the order has been confirmed.
            If your payment has already been processed and your order is cancelled, Bez Ambar Inc. will issue a full refund.
          </p>
          <p>
            All prices are shown in US Dollars and are subject to change. Final pricing for custom and bespoke pieces is confirmed in writing at time of commission.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Consultations and Orders</h2>
          <p>
            All consultations are conducted by appointment at our Los Angeles atelier or via video call.
            Inquiries submitted through the Site do not constitute a binding order or agreement.
            A formal agreement is established only when both parties have signed a written commission or purchase contract.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Warranty</h2>
          <p>
            Our lifetime warranty terms are detailed in full on our <a href="/warranty">Warranty page</a>.
            The warranty applies to the original purchaser only and is subject to the conditions described therein.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The Site and all materials and products on this Site are provided "as is" and without warranties of any kind, whether express or implied.
            To the fullest extent permissible under applicable law, Bez Ambar Inc. disclaims all warranties — express or implied — including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            Bez Ambar Inc. does not represent or warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
          <p>Some states do not permit limitations or exclusions on warranties, so the above limitations may not apply to you.</p>
        </section>

        <section className={styles.section}>
          <h2>10. Limitation of Liability</h2>
          <p>
            Bez Ambar Inc. shall not be liable for any special, indirect, incidental, consequential, or punitive damages that result from the use of, or the inability to use, the materials on this Site or the performance of any products — even if Bez Ambar Inc. has been advised of the possibility of such damages.
          </p>
          <p>Applicable law may not allow the limitation or exclusion of liability for incidental or consequential damages, so the above limitation or exclusion may not apply to you.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites for your convenience.
            Bez Ambar Inc. has no control over the content of those sites and accepts no responsibility for them or for any loss or damage arising from their use.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Notice</h2>
          <p>
            Bez Ambar Inc. may deliver notice to you by means of email, a general notice on the Site, or by other reliable method to the address you have provided to Bez Ambar Inc.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Governing Law</h2>
          <p>
            Your use of this Site shall be governed in all respects by the laws of the State of California, U.S.A., without regard to choice of law provisions, and not by the 1980 U.N. Convention on contracts for the international sale of goods.
            You agree that jurisdiction over and venue in any legal proceeding directly or indirectly arising out of or relating to this Site shall be in the state or federal courts located in Los Angeles County, California.
            Any cause of action or claim you may have with respect to the Site must be commenced within one (1) year after the claim or cause of action arises.
          </p>
          <p>
            Bez Ambar Inc.'s failure to insist upon or enforce strict performance of any provision of these Terms shall not be construed as a waiver of any provision or right.
            Neither the course of conduct between the parties nor trade practice shall act to modify any of these terms.
            Bez Ambar Inc. may assign its rights and duties under this Agreement to any party at any time without notice to you.
          </p>
        </section>

        <section className={styles.section}>
          <h2>14. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. The "Last updated" date at the top of this page will reflect any changes.
            Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.
            Provisions relating to Copyright, Trademarks, Disclaimers, Limitation of Liability, and Governing Law shall survive any termination of these Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>15. Contact</h2>
          <p>
            Questions about these Terms:<br />
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
