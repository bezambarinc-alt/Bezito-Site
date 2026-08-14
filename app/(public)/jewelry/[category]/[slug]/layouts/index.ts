import type { ComponentType } from 'react'
import type { ProductLayoutProps } from './types'
import LayoutDefault from './LayoutDefault'
import LayoutDark from './LayoutDark'
import LayoutMulti from './LayoutMulti'

export interface TemplateEntry {
  name: string
  description: string
  component: ComponentType<ProductLayoutProps>
  status: 'active' | 'draft'
}

/**
 * Template registry — the source of truth for all available product page layouts.
 * Add new variants here after writing the TSX layout file.
 * The active template is tracked in admin_settings ('active_product_template').
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  default: {
    name: 'Default',
    description: 'Triptych — 55/45 hero split · specs left · on-hand photo right · three views black',
    component: LayoutDefault,
    status: 'active',
  },
  dark: {
    name: 'Editorial Dark',
    description: 'Dark editorial — image hero · story copy · spec table · contact block. Best for custom commissions and client proposals.',
    component: LayoutDark,
    status: 'active',
  },
  multi: {
    name: 'Multi-Image',
    description: 'Dark gallery — hero + 2-col image grid with lightbox. Best for presenting one piece in multiple metals, angles, or variations.',
    component: LayoutMulti,
    status: 'active',
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
