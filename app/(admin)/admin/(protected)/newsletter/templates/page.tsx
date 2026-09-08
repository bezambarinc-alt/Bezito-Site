import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import styles from '../newsletter.module.css'
import adminStyles from '../../admin.module.css'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bezambar.com'

const EMAIL_TEMPLATES = [
  {
    slug: 'newsletter-welcome',
    name: 'Newsletter Welcome',
    description: 'Sent to new newsletter subscribers. Dark atelier header, personalized greeting, CTA to collection.',
  },
]

export default async function NewsletterTemplatesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Email Templates</h1>
        <span className={adminStyles.syncLink}>served from codebase · fetched by Zoho at campaign creation</span>
      </div>

      <div className={styles.templateGrid}>
        {EMAIL_TEMPLATES.map(t => {
          const url = `${BASE_URL}/api/email-template/${t.slug}`
          return (
            <div key={t.slug} className={styles.templateCard}>
              <div className={styles.templateName}>{t.name}</div>
              <div className={styles.dim} style={{ fontSize: 12 }}>{t.description}</div>
              <div className={styles.templateUrl}>{url}</div>
              <a
                href={`/api/email-template/${t.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.templatePreviewLink}
              >
                Preview →
              </a>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-muted)' }}>
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '0.5rem' }}>How to use a template in a campaign</strong>
        Copy the URL above → Zoho Campaigns → Create Campaign → Advanced → Content URL → paste.
        Zoho fetches the HTML at campaign-creation time and injects merge tags, tracking pixel, and unsubscribe link automatically.
      </div>
    </div>
  )
}
