/**
 * Rewrite the transform segment in a Cloudinary upload URL.
 *
 * Input:  https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v.../file.png
 * Output: https://res.cloudinary.com/dlg2mou53/image/upload/<transforms>/v.../file.png
 *
 * Matches the segment(s) between /upload/ and the first /v<digits>/ or the
 * first path component that isn't a Cloudinary transform token.
 */
export function cldUrl(url: string, transforms: string): string {
  // Replace everything between /upload/ and the version (/v followed by digits)
  // or just the existing transform block (comma/colon/dot/underscore/letters).
  return url.replace(
    /\/upload\/(?:[a-z_A-Z,.:0-9]+\/)(?=v\d|[^v])/,
    `/upload/${transforms}/`,
  )
}
