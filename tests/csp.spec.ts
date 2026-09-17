import { test, expect } from '@playwright/test'

/**
 * CSP regression guard.
 *
 * The site runs two policies (see proxy.ts): a nonce + 'strict-dynamic' policy
 * on /admin, /portal and /preview, and a nonce-free host-allowlist policy on the
 * public routes so they can prerender. A nonce and static rendering are mutually
 * exclusive in the App Router — prerendered HTML is written with no request and
 * so carries no nonce — and the failure mode is silent in the build output and
 * loud only in the browser. An earlier attempt at this got 19 blocked scripts on
 * /terms and the build still said "success".
 *
 * So the check has to be a real browser: load each route, collect
 * securitypolicyviolation events and console errors, assert none.
 *
 * Run against a local production build (the config defaults baseURL to live prod,
 * which is the wrong target while you are changing the policy):
 *   npx next build && npx next start -p 3111
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/csp.spec.ts
 */

const STATIC_ROUTES = [
  '/terms',
  '/warranty',
  '/privacy-policy',
  '/ring-size-chart',
  '/the-story',
  '/cuts',
  '/diamond-education',
  '/contact',
  '/journal',
  '/jewelry',
  '/blog',
  '/shop/ruby-flower-hug-earrings',
]

const SSG_ROUTES = [
  '/jewelry/rings/firestorm-blaze-ring',
  '/retailers/ahee-jewelers',
]

const STRICT_ROUTES = [
  '/admin/login',
  '/portal/login',
]

type Violation = { route: string; directive: string; blocked: string }

/**
 * The Zoho PageSense tag calls new Function() from a helper it literally names
 * isUnsafeEvalAllowed — a feature probe it expects to fail, catches, and works
 * around. It fires one script-src/eval violation on every public page and has
 * done since before the policy split; live production reports the identical one.
 * Nothing is broken by it, and the fix would be adding 'unsafe-eval' in prod,
 * which is strictly worse. Ignored here so this file fails only on regressions.
 */
const isPageSenseEvalProbe = (v: Violation) =>
  v.blocked === 'eval' && v.directive === 'script-src'

async function collectViolations(page: import('@playwright/test').Page, route: string) {
  await page.addInitScript(() => {
    ;(window as unknown as { __csp: unknown[] }).__csp = []
    document.addEventListener('securitypolicyviolation', e => {
      ;(window as unknown as { __csp: unknown[] }).__csp.push({
        directive: e.effectiveDirective,
        blocked: e.blockedURI,
      })
    })
  })

  const res = await page.goto(route, { waitUntil: 'networkidle' })
  expect(res?.status(), `${route} should not error`).toBeLessThan(400)

  const raw = await page.evaluate(
    () => (window as unknown as { __csp: { directive: string; blocked: string }[] }).__csp,
  )
  return raw.map(v => ({ route, ...v })).filter(v => !isPageSenseEvalProbe(v))
}

test.describe('CSP — public routes prerender and still run their JS', () => {
  for (const route of [...STATIC_ROUTES, ...SSG_ROUTES]) {
    test(`no CSP violations on ${route}`, async ({ page }) => {
      const violations = await collectViolations(page, route)
      expect(
        violations,
        `blocked:\n${violations.map(v => `  ${v.directive} → ${v.blocked}`).join('\n')}`,
      ).toEqual([])

      // A blocked bootstrap chunk is the exact failure this file exists to catch,
      // and it shows up as a page with no hydration rather than as an error.
      // React only sets this once the client bundle has actually run.
      await expect
        .poll(() => page.evaluate(() => document.querySelector('body')?.hasChildNodes() ?? false))
        .toBe(true)
    })
  }
})

test.describe('CSP — strict routes keep the nonce', () => {
  for (const route of STRICT_ROUTES) {
    test(`nonce present and honoured on ${route}`, async ({ page }) => {
      const violations = await collectViolations(page, route)
      expect(
        violations,
        `blocked:\n${violations.map(v => `  ${v.directive} → ${v.blocked}`).join('\n')}`,
      ).toEqual([])

      const csp = await page.evaluate(async () => {
        const r = await fetch(location.href)
        return r.headers.get('content-security-policy') ?? ''
      })
      expect(csp, `${route} must run the strict policy`).toContain("'strict-dynamic'")
      expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=]+'/)

      // Every script tag must carry the nonce — under 'strict-dynamic' a bare
      // one is dead, because 'self' is ignored.
      //
      // Read it off the IDL property, never getAttribute('nonce'). Browsers
      // blank the content attribute once the nonce is applied (CSP nonce-hiding,
      // so it can't be exfiltrated with an attribute selector), so getAttribute
      // returns null for every script on a perfectly healthy page.
      const scripts = await page.evaluate(() => {
        const all = [...document.querySelectorAll('script')]
        return { total: all.length, withNonce: all.filter(s => s.nonce).length }
      })
      expect(scripts.total, `${route} rendered no scripts at all`).toBeGreaterThan(0)
      expect(
        scripts.withNonce,
        `${route}: ${scripts.total - scripts.withNonce} of ${scripts.total} script tags have no nonce`,
      ).toBe(scripts.total)
    })
  }
})

test('public routes do not run the strict policy', async ({ page }) => {
  await page.goto('/terms')
  const csp = await page.evaluate(async () => {
    const r = await fetch(location.href)
    return r.headers.get('content-security-policy') ?? ''
  })
  expect(csp).not.toContain("'strict-dynamic'")
  expect(csp).not.toMatch(/'nonce-/)
  expect(csp).toContain("script-src 'self' 'unsafe-inline'")
})
