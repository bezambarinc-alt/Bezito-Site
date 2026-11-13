/**
 * Rewrite the transform segment in a Cloudinary upload URL.
 *
 * Input:  https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v123/file.png
 * Output: https://res.cloudinary.com/dlg2mou53/image/upload/<transforms>/v123/file.png
 *
 * Input:  https://res.cloudinary.com/dlg2mou53/image/upload/Jewelry%20Images/file.png
 * Output: https://res.cloudinary.com/dlg2mou53/image/upload/<transforms>/Jewelry%20Images/file.png
 *
 * Any existing transform segment(s) directly after /upload/ are REPLACED (never
 * doubled). The version segment (/v<digits>/) and the public_id path are kept
 * as-is. If there is no transform block, the transforms are inserted.
 * Non-Cloudinary URLs (no /upload/) are returned unchanged.
 */

// Known Cloudinary transformation parameter keys. A path segment counts as a
// transform block only if EVERY comma-separated component is `<key>_<value>`
// with one of these keys — so folders like "Jewelry Images" or "products" are
// never mistaken for transforms.
const TRANSFORM_KEYS = new Set([
  'a', 'ac', 'af', 'ar', 'b', 'bo', 'br', 'c', 'co', 'cs', 'd', 'dl', 'dn',
  'dpr', 'du', 'e', 'eo', 'f', 'fl', 'fn', 'fps', 'g', 'h', 'if', 'ki', 'l',
  'o', 'p', 'pg', 'q', 'r', 'so', 'sp', 't', 'u', 'vc', 'vs', 'w', 'x', 'y', 'z',
])

function isTransformSegment(seg: string): boolean {
  if (!seg) return false
  return seg.split(',').every(part => {
    const m = /^([a-z]{1,3})_[^/]+$/.exec(part)
    return m !== null && TRANSFORM_KEYS.has(m[1])
  })
}

export function cldUrl(url: string, transforms: string): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return url

  const head = url.slice(0, idx + marker.length)
  const segments = url.slice(idx + marker.length).split('/')

  // Drop leading transform segments (chained transforms are multiple segments).
  // Always keep at least the last segment (the file name).
  let i = 0
  while (i < segments.length - 1 && isTransformSegment(segments[i])) i++

  return `${head}${transforms}/${segments.slice(i).join('/')}`
}
