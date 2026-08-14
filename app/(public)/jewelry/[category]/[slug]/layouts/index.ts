import type { ComponentType } from 'react'
import type { ProductLayoutProps } from './types'
import LayoutDefault from './LayoutDefault'
import LayoutDark from './LayoutDark'
import LayoutMulti from './LayoutMulti'

export type TemplateScope = 'product' | 'proposal' | 'showcase'

export interface TemplateEntry {
  name: string
  description: string
  component: ComponentType<ProductLayoutProps>
  status: 'active' | 'draft'
  /** Page types this template is valid for. A template ONLY appears in the
   *  admin UI and page dropdowns for the scopes listed here. */
  scope: TemplateScope[]
}

/**
 * Template registry — the source of truth for all available product page layouts.
 * Add new variants here after writing the TSX layout file.
 * The active template is tracked in admin_settings ('active_product_template').
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  // ── Product page layouts — /jewelry/[category]/[slug] only ──────────────
  default: {
    name: 'Default',
    description: 'Triptych — 55/45 hero split · specs left · on-hand photo right · three views black',
    component: LayoutDefault,
    status: 'active',
    scope: ['product'],
  },

  // ── Proposal + Showcase layouts — client-facing pages only ───────────────
  dark: {
    name: 'Editorial Dark',
    description: 'Single-item proposal — image hero · story copy · spec table · contact block.',
    component: LayoutDark,
    status: 'active',
    scope: ['proposal', 'showcase'],
  },
  multi: {
    name: 'Multi-Image',
    description: 'Multi-variation proposal — hero + 2-col image gallery. Use when showing one piece in multiple metals or angles.',
    component: LayoutMulti,
    status: 'active',
    scope: ['proposal', 'showcase'],
  },
  // Add new layout variants here, e.g.:
  // v2: {
  //   name: 'Stacked',
  //   description: 'Full-width hero video · specs below · editorial photo full-bleed',
  //   component: LayoutV2,
  //   status: 'draft',
  // },
}

export type TemplateId = keyof typeof TEMPLATES

export function getTemplateIds(): TemplateId[] {
  return Object.keys(TEMPLATES) as TemplateId[]
}

export function isValidTemplateId(id: string): id is TemplateId {
  return id in TEMPLATES
}

export { type ProductLayoutProps }
