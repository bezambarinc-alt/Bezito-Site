/**
 * Page type — mirrors the Neon `pages` table (see db/schema.sql table 1).
 * Marketing / client pages Bezito publishes, rendered by app/client/[slug].
 */

import type { Block } from './blocks'

export type PageStatus = 'draft' | 'live' | 'archived'

/** Row shape as stored in Neon. `blocks` is JSONB. */
export interface PageRow {
  id: number
  slug: string
  tenant: string
  title: string
  blocks: Block[]
  status: PageStatus
  password: string | null
  created_at: string
  updated_at: string
}

/** Trimmed shape typically selected for rendering a live page. */
export interface Page {
  slug: string
  title: string
  blocks: Block[]
  status: PageStatus
  password: string | null
}

/** Row shape for admin listing (GET /api/pages). */
export interface PageListItem {
  slug: string
  title: string
  status: PageStatus
  updated_at: string
}
