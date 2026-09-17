import './portal.css'

/**
 * Everything under /portal renders per-request.
 *
 * This is a CSP constraint before it is a data one. proxy.ts serves /portal the
 * strict nonce + 'strict-dynamic' policy, and a nonce only exists when there is
 * a request to mint it for. A prerendered page ships Next's bootstrap chunks
 * with no nonce attribute, 'strict-dynamic' makes the browser ignore 'self',
 * and every one of those chunks is blocked — a login form that never hydrates,
 * with a green build log.
 *
 * That is not hypothetical: /portal and /portal/login were prerendered in
 * production and served 14 script tags, 0 nonced, all blocked. Forcing the
 * group dynamic here — rather than per page — keeps STRICT_CSP in proxy.ts and
 * the render mode from drifting apart the next time a page is added. Nothing
 * under /portal is cacheable anyway; it is all session-gated.
 *
 * tests/csp.spec.ts fails if this is removed.
 */
export const dynamic = 'force-dynamic'

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
