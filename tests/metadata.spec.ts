import { test, expect } from '@playwright/test'

/**
 * The brand belongs in exactly one place: the `title.template` in app/layout.tsx.
 *
 * Every page used to hardcode its own "— Bez Ambar" suffix on top of that
 * template, so production shipped titles like "The Story — Bez Ambar · Bez
 * Ambar" and "FIRESTORM — Bez Ambar · Bez Ambar" on every indexed page. The
 * build is green either way — nothing type-checks a string — so this is the
 * only thing that catches it.
 *
 * A page that genuinely needs its own full title uses `title: { absolute }`,
 * which bypasses the template rather than stacking on it. Those are listed in
 * ABSOLUTE below and asserted to carry the brand exactly once, not zero times.
 *
 *   npx next build && npx next start -p 3111
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3111 npx playwright test tests/metadata.spec.ts
 */

// Templated routes: page supplies the leaf, layout appends " · Bez Ambar".
const TEMPLATED = [
  '/the-story',
  '/blog',
  '/contact',
  '/jewelry',
  '/jewelry/rings',
  '/cuts',
  '/terms',
  '/warranty',
  '/privacy-policy',
  '/ring-size-chart',
  '/diamond-education',
  '/elysian-cut',
  '/archive',
  '/journal',
  '/legal/ccpa-opt-out',
  '/shop/ruby-flower-hug-earrings',
  '/jewelry/rings/firestorm-blaze-ring',
]

// Routes that opt out of the template with `absolute`.
const ABSOLUTE = ['/', '/about-bez-ambar', '/retailers/ahee-jewelers']

const titleOf = async (page: import('@playwright/test').Page, path: string) => {
  const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
  expect(res?.status(), `${path} did not load`).toBeLessThan(400)
  return await page.title()
}

const brandCount = (title: string) => title.split('Bez Ambar').length - 1

for (const path of [...TEMPLATED, ...ABSOLUTE]) {
  test(`title names the brand exactly once on ${path}`, async ({ page }) => {
    const title = await titleOf(page, path)
    expect(title, `${path} → ${title}`).not.toBe('')
    expect(brandCount(title), `${path} → "${title}"`).toBe(1)
  })
}

test('templated routes end in the suffix the layout owns', async ({ page }) => {
  for (const path of TEMPLATED) {
    const title = await titleOf(page, path)
    expect(title, `${path} → "${title}"`).toMatch(/ · Bez Ambar$/)
    // The leaf itself must be brand-free — that is the doubling this guards.
    expect(title.replace(/ · Bez Ambar$/, '')).not.toContain('Bez Ambar')
  }
})

test('404 title is templated, not doubled', async ({ page }) => {
  const res = await page.goto('/this-route-does-not-exist', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(404)
  expect(await page.title()).toBe('Page Not Found · Bez Ambar')
})
