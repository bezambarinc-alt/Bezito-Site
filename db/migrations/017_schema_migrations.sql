-- Migration 017: schema_migrations — the applied-migration ledger
--
-- Until now nothing recorded which migrations had been applied to which
-- database. The only way to tell was to inspect columns and guess. That is how
-- 016's columns ended up in production with no migration file, and how two
-- files both ended up numbered 014.
--
-- From here on, scripts/run-migration.js inserts a row per applied file and
-- refuses to re-run anything already listed.
--
-- ONE-TIME BACKFILL: production already has migrations 002–015 applied. After
-- running this file against production, run the backfill INSERT documented in
-- db/README.md ("Backfilling the ledger") so the ledger starts out accurate.
-- Without it, run-migration.js would consider 002–015 unapplied. They are all
-- idempotent, so a re-run would not corrupt data — but 014's RENAME COLUMN is
-- NOT idempotent and would error. Do the backfill.
--
-- Apply: node scripts/run-migration.js 017

CREATE TABLE IF NOT EXISTS schema_migrations (
  id         TEXT PRIMARY KEY,                         -- migration filename, e.g. '009_client_portal.sql'
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_by TEXT NOT NULL DEFAULT current_user
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
  ON schema_migrations (applied_at DESC);

COMMENT ON TABLE schema_migrations IS
  'Ledger of applied db/migrations files. Written by scripts/run-migration.js. One row per filename.';
