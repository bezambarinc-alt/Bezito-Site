import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { TEMPLATES } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
import PagesClient from './PagesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Client Pages — Admin' }

export default async function AdminPagesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  // Build per-scope template lists — each doc_type only sees its valid templates
  const templatesByScope = {
    proposal: Object.entries(TEMPLATES)
      .filter(([, t]) => t.scope.includes('proposal'))
      .map(([id, t]) => ({ id, name: t.name })),
    showcase: Object.entries(TEMPLATES)
      .filter(([, t]) => t.scope.includes('showcase'))
      .map(([id, t]) => ({ id, name: t.name })),
  }

  const [pages, clients] = await Promise.all([
    sql<{
      slug: string; title: string; doc_type: string; status: string;
      client_id: number | null; client_name: string | null; client_slug: string | null;
      customer_pin: string | null; pin_expires_at: string | null;
      template_id: string | null; updated_at: string;
    }>(
      `SELECT p.slug, p.title, p.doc_type, p.status,
              p.client_id, p.customer_pin, p.pin_expires_at,
              p.template_id, p.updated_at,
              c.name AS client_name, c.slug AS client_slug
       FROM pages p
       LEFT JOIN clients c ON c.id = p.client_id
       WHERE p.doc_type IN ('showcase','proposal')
       ORDER BY p.updated_at DESC`,
    ),
    sql<{ id: number; slug: string; name: string }>(
      `SELECT id, slug, name FROM clients WHERE active = true ORDER BY name`,
    ),
  ])

  return (
    <PagesClient
      pages={pages as Parameters<typeof PagesClient>[0]['pages']}
      clients={clients}
      templatesByScope={templatesByScope}
    />
  )
}
