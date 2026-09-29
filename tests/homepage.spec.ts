import { test, expect } from '@playwright/test'

const IGNORE_ORIGINS = [
  'vercel.live',
  'chrome-extension://',
  // CSP inline-style violations come from the curator.io nonce suppressing unsafe-inline
  // in proxy.ts (intentional, out of scope for this spec — proxy.ts is not touched here)
  "Applying inline style violates the following Content Security Policy",
]

test('homepage — no console errors, one h1, hero videos buffer', async ({ page }) => {
  const consoleErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      const ignore = IGNORE_ORIGINS.some((o) => text.includes(o))
      if (!ignore) consoleErrors.push(text)
    }
  })

  await page.goto('/', { waitUntil: 'networkidle' })

  // No unexpected console errors
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toHaveLength(0)

  // Exactly one h1
  const h1Count = await page.locator('h1').count()
  expect(h1Count).toBe(1)

  // Substring match — the build injects a hash segment into module class names
  // (ScrollWipeCarousel-module__<hash>__pin), so a literal selector never matches.
  const videos = page.locator('[class*="ScrollWipeCarousel-module"][class*="__pin"] video')
  await expect(videos).toHaveCount(2)

  // Slide 0 is the LCP hero: preload="auto", autoplays on entry, must buffer.
  await expect
    .poll(
      () => videos.nth(0).evaluate((v: HTMLVideoElement) => v.readyState),
      { timeout: 8_000, message: 'Hero video 0 did not reach readyState >= 2' },
    )
    .toBeGreaterThanOrEqual(2)

  // Slide 1 is deliberately deferred (fb3d89f) — preload="none", .load() only
  // once wipe progress passes 0.25. Asserting it buffers at rest would fight
  // that decision, so guard the decision itself: it must stay unloaded until
  // the user scrolls.
  await expect(videos.nth(1)).toHaveAttribute('preload', 'none')
  const readyState1 = await videos.nth(1).evaluate((v: HTMLVideoElement) => v.readyState)
  expect(readyState1, `Slide 1 buffered without scrolling (readyState ${readyState1})`).toBe(0)
})
