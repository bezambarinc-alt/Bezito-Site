import type { Block } from '@/types/blocks'
import HeroVideo from './HeroVideo'
import HeroSplit from './HeroSplit'
import ContentSplit from './ContentSplit'
import Editorial from './Editorial'
import Segment from './Segment'
import ImageGrid from './ImageGrid'
import SpecAccordion from './SpecAccordion'
import InquireCta from './InquireCta'
import InquireFooter from './InquireFooter'
import PullQuote from './PullQuote'
import Richtext from './Richtext'

/** Renders an ordered list of content blocks. Unknown types are skipped. */
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </>
  )
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero-video':
      return <HeroVideo block={block} />
    case 'hero-split':
      return <HeroSplit block={block} />
    case 'content-split':
      return <ContentSplit block={block} />
    case 'editorial':
      return <Editorial block={block} />
    case 'segment':
      return <Segment block={block} />
    case 'image-grid':
      return <ImageGrid block={block} />
    case 'spec-accordion':
      return <SpecAccordion block={block} />
    case 'inquire-cta':
      return <InquireCta block={block} />
    case 'inquire-footer':
      return <InquireFooter block={block} />
    case 'pull-quote':
      return <PullQuote block={block} />
    case 'richtext':
      return <Richtext block={block} />
    default:
      return null
  }
}

/** True when the block list contains a piece-level inquire CTA (drives ProdPill). */
export function hasInquireCta(blocks: Block[]): boolean {
  return blocks.some((b) => b.type === 'inquire-cta')
}
