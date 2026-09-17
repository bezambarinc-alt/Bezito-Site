import 'server-only'
import { headers } from 'next/headers'

/**
 * The current request's CSP nonce, for hand-written <script> tags.
 *
 * ⚠️ Strict routes only — /admin, /portal, /preview. proxy.ts mints a nonce for
 * those and for nothing else, so on a public route this returns '' and, worse,
 * the headers() call opts the whole public tree out of static rendering. Public
 * pages need no nonce: their CSP allows scripts by host. Next stamps its own
 * chunks automatically either way; this is only for tags we write ourselves.
 *
 * No callers today — every former one was on a public route.
 */
export async function getNonce(): Promise<string> {
  return (await headers()).get('x-nonce') ?? ''
}
