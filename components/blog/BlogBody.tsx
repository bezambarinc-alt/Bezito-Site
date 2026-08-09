import styles from './BlogBody.module.css'

/**
 * BlogBody — renders a blog post's HTML body to styled prose.
 *
 * Bodies are stored as clean, semantic HTML (migrated from the Astro build):
 * only <p> <em> <strong> <h2> <h3> <hr> <a> <figure> <img> <video> <source>.
 * We sanitize server-side with a tight tag/attr allowlist, then inject.
 *
 * (Earlier this ran through ReactMarkdown, which treated the HTML as literal
 * text and produced an empty prose block — that bug is fixed here.)
 *
 * The FAQ pattern (**Q?** bold para → answer) is preserved by the <strong>
 * rule; FAQ JSON-LD is emitted separately on the detail page for SEO.
 */

const ALLOWED_TAGS = new Set([
  'p', 'em', 'strong', 'b', 'i', 'h2', 'h3', 'h4', 'hr', 'br',
  'a', 'ul', 'ol', 'li', 'blockquote',
  'figure', 'figcaption', 'img', 'video', 'source',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'loading', 'width', 'height']),
  video: new Set(['src', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'playsinline', 'width', 'height']),
  source: new Set(['src', 'type']),
  h2: new Set(['id']),
  h3: new Set(['id']),
  h4: new Set(['id']),
}

function sanitizeHtml(html: string): string {
  // Strip script/style/iframe/object/embed blocks entirely (content + tags).
  let out = html.replace(
    /<(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  )
  out = out.replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '')

  // Walk every tag; drop disallowed tags (keep inner text), filter attrs,
  // and neutralize javascript:/on* handlers.
  out = out.replace(/<(\/?)([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
    (_m, close: string, tagRaw: string, attrRaw: string) => {
      const tag = tagRaw.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return '' // drop tag, keep surrounding text
      if (close) return `</${tag}>`

      const allowed = ALLOWED_ATTRS[tag]
      if (!allowed) return `<${tag}>`

      const attrs: string[] = []
      const attrRe = /([a-zA-Z0-9:_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
      let a: RegExpExecArray | null
      while ((a = attrRe.exec(attrRaw))) {
        const name = a[1].toLowerCase()
        if (!allowed.has(name)) continue
        const val = a[2] ?? a[3] ?? a[4] ?? ''
        if (/^\s*javascript:/i.test(val)) continue
        if (/^on/i.test(name)) continue
        attrs.push(val ? `${name}="${val.replace(/"/g, '&quot;')}"` : name)
      }
      return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`
    })

  return out
}

export default function BlogBody({ markdown }: { markdown: string }) {
  const clean = sanitizeHtml(markdown)
  return (
    <div
      className={styles.prose}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
