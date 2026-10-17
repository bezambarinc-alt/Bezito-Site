import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/newsletter/templates
 * Lists all approved email templates (email_drafts WHERE is_template=true).
 * Used to browse saved templates before creating a new campaign.
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await sql<{
    id: string
    template_name: string
    campaign_key: string | null
    created_at: string
  }>(
    `SELECT id, template_name, campaign_key, created_at
     FROM email_drafts
     WHERE is_template = TRUE
     ORDER BY created_at DESC`,
  )

  return NextResponse.json({ templates })
}
