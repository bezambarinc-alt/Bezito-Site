-- Migration 016: leads.sku + leads.intent — paper-trail backfill
--
-- ⚠ THESE COLUMNS ALREADY EXIST IN PRODUCTION. They were added out-of-band,
-- by hand, with no migration file and no record of when or by whom. Production
-- code writes them on every submit:
--
--   app/api/lead/route.ts   INSERT INTO leads(page_slug, sku, intent, ...)
--   app/actions/inquiry.ts  INSERT INTO leads(page_slug, sku, intent, ...)
--   app/(admin)/admin/(protected)/leads/page.tsx  SELECT ... sku, intent ...
--   app/api/admin/leads/retry/route.ts            SELECT ... sku, intent ...
--
-- The result was that a database built from db/migrations/ alone had no sku and
-- no intent column, so the contact form threw on every submission. This
-- migration exists purely so migrations-from-scratch converges with production.
-- Running it against production is a safe no-op (ADD COLUMN IF NOT EXISTS).
--
-- Types below were read from the live database on 2026-09-17:
--   leads.sku    text, nullable, no default
--   leads.intent text, nullable, no default
--
-- Apply: node scripts/run-migration.js 016

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS sku    TEXT,
  ADD COLUMN IF NOT EXISTS intent TEXT;

COMMENT ON COLUMN leads.sku IS
  'Product SKU the inquiry originated from, when the form was rendered on a product page. NULL otherwise.';
COMMENT ON COLUMN leads.intent IS
  'Form intent, e.g. newsletter / repair / appraisal / custom. Routes the lead to Zoho CRM, Campaigns, or Desk. See app/api/lead/route.ts.';
