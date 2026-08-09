import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import styles from './BlogBody.module.css'

/**
 * BlogBody — renders a blog post's markdown body to styled HTML.
 *
 * Narrow, sanitized subset (headings, bold, italics, paragraphs, hr) mapped to
 * the site's editorial typography. rehype-sanitize is an allowlist guard so a
 * malformed/exotic post can never inject unsafe HTML.
 *
 * The FAQ pattern in the source (`**Question?**` paragraph → answer paragraph)
 * is styled via the bold + paragraph rules; FAQ JSON-LD is emitted separately
 * on the detail page for SEO.
 */
export default function BlogBody({ markdown }: { markdown: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
