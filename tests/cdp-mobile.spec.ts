import { test, expect, devices } from '@playwright/test'

// Use the iPhone 14 Pro descriptor for viewport/UA/touch, but drop
// defaultBrowserType so the chromium project isn't forced onto webkit
// (webkit is not installed in this environment).
const { defaultBrowserType, ...iphone14Pro } = devices['iPhone 14 Pro']
test.use(iphone14Pro)

const IGNORE_ORIGINS = [
  'vercel.live',
  'chrome-extension://',
  // CSP inline-style violations come from the curator.io nonce suppressing unsafe-inline
  // in proxy.ts (intentional, out of scope for this spec).
  'Applying inline style violates the following Content Security Policy',
  'Content Security Policy',
]

// Candidate category routes — try in order until one returns 200.
const CANDIDATES = ['/jewelry/rings', '/jewelry/bracelets', '/jewelry/earrings']

test('CDP mobile — CinematicCarousel UI/UX (iPhone 14 Pro)', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!IGNORE_ORIGINS.some((o) => text.includes(o))) consoleErrors.push(text)
    }
  })

  // ── Resolve a working category route ──────────────────────────────────────
  let usedPath = ''
  let status = 0
  for (const path of CANDIDATES) {
    const resp = await page.goto(path, { waitUntil: 'domcontentloaded' })
    status = resp?.status() ?? 0
    if (status === 200) { usedPath = path; break }
  }
  expect(status, `No candidate category route returned 200 (tried ${CANDIDATES.join(', ')})`).toBe(200)
  console.log(`[cdp-mobile] using route: ${usedPath}`)

  await page.waitForLoadState('networkidle').catch(() => {})

  // ── Assertion 1: no unexpected console errors ─────────────────────────────
  expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toHaveLength(0)

  // ── Assertion 2: at least 2 <video> elements in the DOM ───────────────────
  // Both desktop + mobile markup render; scope to the mobile stack so we test
  // the surface actually visible on this device.
  const mobileStack = page.locator('[class*="mobileStack"]')
  await expect(mobileStack).toHaveCount(1)
  const mobileVideos = mobileStack.locator('video')
  const videoCount = await mobileVideos.count()
  expect(videoCount, `Expected >=2 mobile <video> elements, found ${videoCount}`).toBeGreaterThanOrEqual(2)

  // ── Assertion 3: no video has preload="none" ──────────────────────────────
  const preloads = await mobileVideos.evaluateAll((vids) =>
    vids.map((v) => (v as HTMLVideoElement).preload),
  )
  console.log(`[cdp-mobile] mobile video preloads: ${JSON.stringify(preloads)}`)
  for (const p of preloads) {
    expect(['auto', 'metadata'], `preload was "${p}" (must be auto|metadata, never none)`).toContain(p)
  }

  // ── Assertion 4: first mobile video reaches readyState >= 2 within 8s ──────
  const firstVideo = mobileVideos.first()
  await firstVideo.evaluate(
    (v: HTMLVideoElement) =>
      new Promise<void>((resolve, reject) => {
        if (v.readyState >= 2) return resolve()
        const to = setTimeout(() => reject(new Error(`readyState stuck at ${v.readyState}`)), 8000)
        const check = () => {
          if (v.readyState >= 2) { clearTimeout(to); resolve() }
        }
        v.addEventListener('loadeddata', check)
        v.addEventListener('canplay', check)
        // Nudge loading in case autoplay was blocked in headless.
        v.load?.()
        check()
      }),
  )
  const rs = await firstVideo.evaluate((v: HTMLVideoElement) => v.readyState)
  console.log(`[cdp-mobile] first video readyState: ${rs}`)
  expect(rs).toBeGreaterThanOrEqual(2)

  // ── Assertion 5: no visible <h2> contains a raw pipe "|" ──────────────────
  const h2s = page.locator('h2')
  const h2Count = await h2s.count()
  for (let i = 0; i < h2Count; i++) {
    const h2 = h2s.nth(i)
    if (!(await h2.isVisible())) continue
    const txt = (await h2.textContent()) ?? ''
    expect(txt.includes('|'), `Visible <h2> contains raw pipe: "${txt}"`).toBe(false)
  }

  // ── Assertion 6: mobileTextTop caption zone has pointer-events: none ───────
  const textTop = page.locator('[class*="mobileTextTop"]').first()
  await expect(textTop).toHaveCount(1)
  const pe = await textTop.evaluate((el) => getComputedStyle(el).pointerEvents)
  console.log(`[cdp-mobile] mobileTextTop pointer-events: ${pe}`)
  expect(pe).toBe('none')

  // ── Assertion 7: safe-area / section renders with real height ─────────────
  // mobilePin should have a computed height using dvh/vh (>= 500px), and the
  // mobileStack (total × vh) should be much taller.
  const pinHeight = await page
    .locator('[class*="mobilePin"]')
    .first()
    .evaluate((el) => el.getBoundingClientRect().height)
  console.log(`[cdp-mobile] mobilePin height: ${pinHeight}px`)
  expect(pinHeight, `mobilePin height ${pinHeight}px too small — section not rendering`).toBeGreaterThanOrEqual(500)

  // ── Assertion 8: screenshot (before the strict height guard so it always
  //    captures, even when the guard below flags the CSP regression) ─────────
  await page.screenshot({ path: 'tests/screenshots/cdp-mobile.png', fullPage: false })

  // With N>1 slides the scroll-lock stack must be TALLER than its pin (it is
  // sized total × 100dvh) so there is scroll range to advance slides. If it
  // collapses to the pin height, scrollRange <= 0 and the carousel is stuck on
  // slide 0 — the mobile carousel is dead. Guard against that regression.
  const stackHeight = await mobileStack.evaluate((el) => el.getBoundingClientRect().height)
  const viewport = await page.evaluate(() => window.innerHeight)

  // Diagnostic: is the inline height *attribute* present but rejected by the
  // parser? A present attribute string with an empty parsed style.height is the
  // signature of the CSP style-src stripping the inline declaration (the same
  // CSP that the homepage spec filters as a console error). Applied via the
  // attribute path it collapses the stack; the CDOM property path bypasses CSP.
  const heightDiag = await mobileStack.evaluate((el) => ({
    attr: el.getAttribute('style'),
    parsed: (el as HTMLElement).style.height,
  }))
  console.log(
    `[cdp-mobile] mobileStack height: ${stackHeight}px · viewport: ${viewport}px · ` +
      `styleAttr=${JSON.stringify(heightDiag.attr)} parsedHeight=${JSON.stringify(heightDiag.parsed)}`,
  )
  const cspStripped = !!heightDiag.attr?.includes('height:') && heightDiag.parsed === ''
  expect(
    stackHeight,
    `mobileStack (${stackHeight}px) collapsed to ~pin height (${pinHeight}px). ` +
      `Scroll range = ${stackHeight - viewport}px → carousel cannot advance past slide 0. ` +
      (cspStripped
        ? `ROOT CAUSE: the inline style attribute (${heightDiag.attr}) is present but the ` +
          `parsed style.height is empty — CSP style-src is stripping the inline declaration. ` +
          `Fix in app source: allow inline styles / add nonce, or set the height via a CSS ` +
          `custom property / stylesheet rule instead of an inline style attribute.`
        : `The inline height calc(N * 100dvh) is not applying.`),
  ).toBeGreaterThan(pinHeight + viewport)
})
