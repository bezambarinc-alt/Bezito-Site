-- Migration 019: drop leads.page_slug FK -> pages(slug); keep plain TEXT
--
-- leads.page_slug was declared `TEXT REFERENCES pages(slug)`. In practice almost
-- every submission path sends a slug that is NOT a pages row:
--   • ContactForm   → "contact"            (hardcoded Next route, not a pages row)
--   • InquiryDrawer → pathname.slice(1)    (product/deep paths, not pages rows)
--   • ArchiveModal  → the archive piece slug (not a pages row)
--   • Newsletter    → "home"               (not a pages row)
--
-- To satisfy the FK, both writers ran a `SELECT slug FROM pages WHERE slug=$1`
-- guard before INSERT and stored NULL on a miss — so the source path was lost on
-- nearly every lead, and a path that forgot the guard threw on submit (the bug
-- fixed in c1d87a6). page_slug is an attribution/reporting field, not a
-- relational key: drop the FK and store the raw submitted path verbatim.
--
-- The guard is removed from app code in the same change (lib/leads.ts). Running
-- this against production is a safe no-op if the constraint is already gone.
--
-- Apply: node --env-file=.env.local scripts/run-migration.js 019

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_page_slug_fkey;

COMMENT ON COLUMN leads.page_slug IS
  'Raw site path the inquiry was submitted from (e.g. "contact", "jewelry/rings/c-0754"). Attribution only — NOT a FK to pages.slug.';
