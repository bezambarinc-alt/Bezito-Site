import 'server-only'
import { sql } from '@/lib/db'

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.pin.success'
  | 'auth.pin.failed'
  | 'auth.logout'
  | 'auth.whitelist.added'
  | 'auth.whitelist.removed'
  | 'admin.user.created'
  | 'admin.user.deleted'
  | 'admin.pin.changed'
  | 'auth.client.login.success'
  | 'auth.client.login.failed'
  | 'auth.client.logout'
  | 'admin.client.created'
  | 'admin.client.updated'
  | 'admin.client.deactivated'
  | 'admin.page.created'
  | 'admin.page.updated'
  | 'admin.page.archived'
  | 'admin.template.activated'
  | 'portal.pin.generated'
  | 'portal.pin.revoked'
  | 'portal.page_request.submitted'

export async function audit(
  action: AuditAction,
  actor: string,
  detail?: Record<string, unknown>,
) {
  try {
    await sql(
      `INSERT INTO audit_log (actor, action, detail) VALUES ($1, $2, $3)`,
      [actor, action, detail ? JSON.stringify(detail) : null],
    )
  } catch {
    // Audit failure must never break the primary flow — log silently
    console.error('[audit] failed to write:', action, actor)
  }
}
