# bezambar.com Cutover Checklist

## Pre-Cutover (must be done before DNS flip)

- [ ] **PAT rotation** — rotate GitHub PAT to include `workflow` scope, update `.git/config` (currently plaintext token, blocks CI)
- [ ] **ci.yml** — push the CI pipeline file (blocked by PAT scope above)
- [ ] **Domain on Vercel** — add `bezambar.com` (apex + www) to the Vercel project, resolve apex/www conflict

## DNS Flip

- Point `bezambar.com` A record → Vercel
- Point `www.bezambar.com` CNAME → `cname.vercel-dns.com`
- Verify SSL provisioning before dropping old WPEngine traffic

## Immediately Post-Cutover (same session as DNS flip)

- [ ] **GA4** — add `G-92GPTNTY00` via `<Script>` in `app/layout.tsx`
- [ ] **Facebook Pixel** — add pixel `295592213952476` (custom audience, NOT the WooCommerce one `910720129435964`)
- [ ] **Google Search Console verification** — add 3× `google-site-verification` meta tags to `app/layout.tsx` metadata:
  - `6B00ZEERW59xG2W7AUJ-m73zIGF3KmoDGVWcObCK9Lg`
  - `ofEgZRIXlvyvcbQRIrjgbZZbBJ9R6RJbRCMOE9_b2yU`
  - `U4_vdQbk7Ym-z5Oo3ody-_YIC9RcNCykEd8vyEDq6MA`
- [ ] **Bing verification** — add `msvalidate.01: EA37A4F49A2AF9C2B2597B96B7B398F8` to metadata
- [ ] **Facebook publisher OG** — add `article:publisher: https://www.facebook.com/bezambarinc/` to OG metadata
- [ ] **Resubmit sitemap** in GSC — `https://bezambar.com/sitemap.xml`
- [ ] **Request indexing** on GSC for homepage + key landing pages

## Post-Cutover Backlog (non-blocking)

- [ ] Footer: add email address
- [ ] Footer: add `/complimentary-consultation` link
- [ ] Footer: add Catalogs link
- [ ] Add archive slugs to `sitemap.ts` (optional SEO uplift)
- [ ] Self-referencing canonical on `archive/[slug]/page.tsx`
- [ ] Klaviyo frontend script (if email capture forms are planned)
