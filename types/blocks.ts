/**
 * Block content model for client/[slug] pages and marketing sections.
 * Stored as JSONB in the `pages.blocks` column and validated by the
 * /api/pages write guard (including the gem-credit rule) before storage.
 */

export interface SpecItem {
  label: string
  body: string
}

export type HeroVideoBlock = {
  type: 'hero-video'
  videoUrl: string
  posterUrl?: string
  refId?: string
  refName?: string
  overlay?: {
    eyebrow?: string
    title?: string
    body?: string
    position?: 'bottom-left' | 'center'
  }
}

export type HeroSplitBlock = {
  type: 'hero-split'
  videoUrl: string
  posterUrl?: string
  refId?: string
  codeName?: string
  category?: string
  /** Sanitized HTML — allows <em>/<br> in the display title. */
  titleHtml: string
  copy: string
  specs?: SpecItem[]
  ctaLabel?: string
  ctaPhone?: string
}

export type ContentSplitBlock = {
  type: 'content-split'
  specs: SpecItem[]
  imageUrl: string
  imageObjectPosition?: string
}

export type EditorialBlock = {
  type: 'editorial'
  eyebrow?: string
  title: string
  subtitle?: string
  body: string
}

export type SegmentBlock = {
  type: 'segment'
  mediaUrl: string
  mediaType: 'video' | 'image'
  reverse?: boolean
  eyebrow?: string
  title: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export type ImageGridBlock = {
  type: 'image-grid'
  images: { url: string; label?: string }[]
  background?: 'black' | 'white'
}

export type SpecAccordionBlock = {
  type: 'spec-accordion'
  title?: string
  items: SpecItem[]
}

export type InquireCtaBlock = {
  type: 'inquire-cta'
  title?: string
  body?: string
  btnLabel?: string
  sku?: string
  pieceTitle?: string
}

export type InquireFooterBlock = {
  type: 'inquire-footer'
  pieceLine: string
  phone1?: string
  phone2?: string
  email?: string
}

export type PullQuoteBlock = {
  type: 'pull-quote'
  quote: string
  attribution?: string
  decorativeMark?: string
}

export type RichtextBlock = {
  type: 'richtext'
  /** Sanitized by the /api/pages write guard before storage. */
  html: string
}

export type Block =
  | HeroVideoBlock
  | HeroSplitBlock
  | ContentSplitBlock
  | EditorialBlock
  | SegmentBlock
  | ImageGridBlock
  | SpecAccordionBlock
  | InquireCtaBlock
  | InquireFooterBlock
  | PullQuoteBlock
  | RichtextBlock

export type BlockType = Block['type']
