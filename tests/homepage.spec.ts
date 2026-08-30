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

  // Both top-hero <video> elements reach readyState >= 2 within 8 seconds
  const videos = page.locator('.ScrollWipeCarousel-module__pin video')
  await expect(videos).toHaveCount(2)

  for (let i = 0; i < 2; i++) {
    await expect
      .poll(
        () => videos.nth(i).evaluate((v: HTMLVideoElement) => v.readyState),
        { timeout: 8_000, message: `Hero video ${i} did not reach readyState >= 2` },
      )
      .toBeGreaterThanOrEqual(2)
  }
})
