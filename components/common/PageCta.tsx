import Link from 'next/link'
import InquiryButton from './InquiryButton'
import styles from './PageCta.module.css'

interface Props {
  eyebrow?: string
  title: string
  body?: string
  href?: string
  ctaLabel?: string
  /** Open the InquiryDrawer instead of navigating. Preferred for luxury UX. */
  drawer?: boolean
  intent?: string
}

/**
 * PageCta — shared dark closing CTA section used on About, Elysian Cut,
 * The Story, and any content page that ends with a contact prompt.
 * Matches Astro .product-cta (dark bg, centered, ghost border button).
 * Pass drawer={true} to open the InquiryDrawer instead of navigating to /contact.
 */
export default function PageCta({
  eyebrow,
  title,
  body,
  href = '/contact',
  ctaLabel = 'Arrange a Consultation',
  drawer = false,
  intent = 'Private Consultation',
}: Props) {
  return (
    <section className={styles.cta}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}
      {drawer
        ? <InquiryButton className={styles.btn} intent={intent}>{ctaLabel}</InquiryButton>
        : <Link href={href} className={styles.btn}>{ctaLabel}</Link>
      }
    </section>
  )
}
