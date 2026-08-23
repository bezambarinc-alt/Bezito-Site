/**
 * dropbox-fetch.mjs
 *
 * Resilient Dropbox → local file downloader.
 *
 * Two-layer protection against the recurring "Dropbox returns login HTML
 * instead of the actual file" failure:
 *
 *   A. Auto-retry with backoff — if the first download comes back as HTML,
 *      wait RETRY_DELAY_MS and try once more before giving up. Catches
 *      transient Dropbox rate-limit / cookie blips.
 *
 *   B. HEAD check before downloading — issues a HEAD request first.
 *      If Dropbox tries to redirect to a login page the final URL after
 *      following redirects will be on dropbox.com/login, so we detect it
 *      before pulling 190 KB of HTML.
 *
 * Usage (CLI):
 *   node dropbox-fetch.mjs <dropbox-url> <dest-path>
 *   exits 0 on success, 1 on failure (error printed to stderr)
 *
 * Usage (ESM import):
 *   import { fetchDropbox } from './dropbox-fetch.mjs'
 *   const localPath = await fetchDropbox(url, destPath)   // throws on failure
 */

import { createWriteStream, existsSync, unlinkSync, statSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { resolve } from 'node:path'

const RETRY_DELAY_MS = 3_000
const MAX_HTML_BYTES = 50_000   // files < this size that look like HTML are rejected
const LOGIN_PATTERNS  = [
  /dropbox\.com\/login/i,
  /<title>Log in to Dropbox/i,
  /name="login_email"/i,
]

/** Normalise a Dropbox share URL so it forces a direct download. */
function toDirectUrl(url) {
  // Replace dl=0 with dl=1, or add dl=1 if absent
  const u = new URL(url)
  u.searchParams.set('dl', '1')
  return u.toString()
}

/** Return true if the buffer/string looks like a Dropbox login page. */
function looksLikeLoginPage(data) {
  const sample = typeof data === 'string' ? data : data.toString('utf8').slice(0, 4096)
  return LOGIN_PATTERNS.some(p => p.test(sample))
}

/**
 * Option B — HEAD check.
 * Follows redirects and inspects the final URL + content-type.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
async function headCheck(directUrl) {
  try {
    const res = await fetch(directUrl, { method: 'HEAD', redirect: 'follow' })
    const finalUrl = res.url ?? directUrl
    if (/dropbox\.com\/login/i.test(finalUrl)) {
      return { ok: false, reason: `HEAD redirected to login page (${finalUrl})` }
    }
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('text/html')) {
      return { ok: false, reason: `HEAD returned text/html (content-type: ${ct})` }
    }
    return { ok: true }
  } catch (err) {
    // HEAD failed (network error etc.) — let the actual download try anyway
    return { ok: true, reason: `HEAD failed (${err.message}), proceeding` }
  }
}

/**
 * Download directUrl → destPath.
 * Returns true if the saved file looks valid, false if it looks like HTML.
 */
async function download(directUrl, destPath) {
  const res = await fetch(directUrl, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status} from Dropbox`)

  // Stream to disk
  const dest = createWriteStream(destPath)
  await pipeline(Readable.fromWeb(res.body), dest)

  const size = statSync(destPath).size
  if (size < MAX_HTML_BYTES) {
    // Small file — read it and check for login markers
    const { readFileSync } = await import('node:fs')
    const head = readFileSync(destPath, 'utf8').slice(0, 4096)
    if (looksLikeLoginPage(head)) {
      unlinkSync(destPath)
      return false
    }
  }
  return true
}

/**
 * Main export — fetch a Dropbox URL to a local path.
 * @param {string} url      Dropbox share URL (dl=0 or dl=1)
 * @param {string} destPath Local file path to write to
 * @returns {Promise<string>} Resolved absolute path on success
 * @throws {Error} If file cannot be fetched after retry
 */
export async function fetchDropbox(url, destPath) {
  const directUrl = toDirectUrl(url)
  const absPath = resolve(destPath)

  // Option B — HEAD check first
  const head = await headCheck(directUrl)
  if (!head.ok) {
    // Give Dropbox one chance to recover before giving up
    console.error(`[dropbox-fetch] HEAD check failed: ${head.reason} — waiting ${RETRY_DELAY_MS}ms before retry`)
    await new Promise(r => setTimeout(r, RETRY_DELAY_MS))

    const head2 = await headCheck(directUrl)
    if (!head2.ok) {
      throw new Error(
        `Dropbox link requires login and cannot be downloaded automatically.\n` +
        `URL: ${url}\n` +
        `Reason: ${head2.reason}\n` +
        `→ Please re-share the file with "Anyone with the link" access and send the new URL.`
      )
    }
  }

  // Option A — download with auto-retry on HTML response
  const ok = await download(directUrl, absPath)
  if (ok) return absPath

  console.error(`[dropbox-fetch] Download returned HTML — retrying in ${RETRY_DELAY_MS}ms`)
  await new Promise(r => setTimeout(r, RETRY_DELAY_MS))

  const ok2 = await download(directUrl, absPath)
  if (ok2) return absPath

  throw new Error(
    `Dropbox link returned a login page after retry.\n` +
    `URL: ${url}\n` +
    `→ Please re-share with "Anyone with the link" access and send the new URL.`
  )
}

// ── CLI mode ──────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('dropbox-fetch.mjs')) {
  const [,, url, dest] = process.argv
  if (!url || !dest) {
    console.error('Usage: node dropbox-fetch.mjs <dropbox-url> <dest-path>')
    process.exit(1)
  }
  try {
    const path = await fetchDropbox(url, dest)
    console.log(path)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
