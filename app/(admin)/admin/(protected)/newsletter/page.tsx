import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getZohoToken } from '@/lib/zoho-auth'
import { SendButton } from './CampaignActions'
import styles from './newsletter.module.css'
import adminStyles from '../admin.module.css'

export const dynamic = 'force-dynamic'

interface ZohoCampaign {
  campaign_id: string
  campaign_name: string
  status: string
  no_of_recipients?: number
  campaign_key?: string
  modified_time?: string
  scheduled_time?: string
}

interface ZohoListResponse {
  status: string
  campaigns?: ZohoCampaign[]
}

async function fetchCampaigns(token: string, status: string): Promise<ZohoCampaign[]> {
  try {
    const params = new URLSearchParams({ resfmt: 'JSON', status, fromindex: '1', range: '25' })
    const res = await fetch(`https://campaigns.zoho.com/api/v1.1/getcampaigns?${params}`, {
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    })
    const data = await res.json() as ZohoListResponse
    return data.campaigns ?? []
  } catch {
    return []
  }
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'draft')      return styles.badgeDraft
  if (s === 'sent')       return styles.badgeSent
  if (s === 'scheduled')  return styles.badgeScheduled
  if (s === 'inprogress') return styles.badgeProgress
  return styles.badgeDraft
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function NewsletterPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const token = await getZohoToken()
  const [drafts, sent, scheduled] = await Promise.all([
    fetchCampaigns(token, 'Draft'),
    fetchCampaigns(token, 'Sent'),
    fetchCampaigns(token, 'Scheduled'),
  ])

  const all = [
    ...drafts.map(c => ({ ...c, status: 'Draft' })),
    ...scheduled.map(c => ({ ...c, status: 'Scheduled' })),
    ...sent.map(c => ({ ...c, status: 'Sent' })),
  ]

  return (
    <div>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Campaigns</h1>
        <span className={adminStyles.syncLink}>
          {drafts.length} draft · {scheduled.length} scheduled · {sent.length} sent
        </span>
      </div>

      <div className={adminStyles.kpiGrid} style={{ marginBottom: '2rem' }}>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>{drafts.length}</div>
          <div className={adminStyles.kpiLabel}>Draft</div>
          <div className={adminStyles.kpiSub}>pending review / send</div>
        </div>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>{scheduled.length}</div>
          <div className={adminStyles.kpiLabel}>Scheduled</div>
          <div className={adminStyles.kpiSub}>queued for delivery</div>
        </div>
        <div className={adminStyles.kpiCard}>
          <div className={adminStyles.kpiValue}>{sent.length}</div>
          <div className={adminStyles.kpiLabel}>Sent</div>
          <div className={adminStyles.kpiSub}>last 25 completed</div>
        </div>
      </div>

      {all.length === 0 ? (
        <div className={styles.empty}>No campaigns found</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {all.map(c => (
                <tr key={c.campaign_id}>
                  <td>{c.campaign_name}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className={styles.dim}>{c.no_of_recipients ?? '—'}</td>
                  <td className={styles.dim}>
                    {fmtDate(c.scheduled_time || c.modified_time)}
                  </td>
                  <td>
                    {c.status === 'Draft' && c.campaign_key ? (
                      <SendButton campaignKey={c.campaign_key} />
                    ) : (
                      <span className={styles.dim}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '11px', color: 'var(--ink-muted)' }}>
        Note: Draft campaigns require content review in Zoho Campaigns UI before Send fires.
        Open Zoho Campaigns → find the draft → Review Content → then use Send here.
      </p>
    </div>
  )
}
