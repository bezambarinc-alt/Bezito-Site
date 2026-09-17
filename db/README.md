# Database

Neon Postgres. Raw SQL, no ORM.

- `schema.sql` — the complete current schema. Source of truth for a fresh database.
- `migrations/NNN_description.sql` — incremental changes, applied in numeric order.

## Build a fresh database

```bash
# 1. schema.sql creates every table, index and function in one shot
psql $DATABASE_URL -f db/schema.sql

# 2. Seed the admin user + PIN (schema.sql does not carry credentials)
psql $DATABASE_URL -f db/migrations/002_admin_auth.sql

# 3. Mark everything as applied so the runner doesn't replay it
#    (see "Backfilling the ledger" below)
```

`schema.sql` is idempotent — every statement is `IF NOT EXISTS` or
`CREATE OR REPLACE`. Re-running it on a live database is a no-op.

Do **not** build a database by replaying `migrations/` from 002. There is no
`001`; the base tables (`pages`, `products`, `leads`, `generations`,
`audit_log`, `blog_posts`, `archive`) only exist in `schema.sql`.

## Migrations

Numbered `NNN_description.sql`, zero-padded, starting at `002`. One number per
file — never reuse one. `014` was duplicated once; `014_view_urls.sql` was
renumbered to `015`.

Write DDL idempotently (`ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`)
so re-application is harmless.

```bash
# Apply one migration
node --env-file=.env.local scripts/run-migration.js 016

# What's applied, what's pending
node --env-file=.env.local scripts/run-migration.js --status

# Apply everything pending, in order
node --env-file=.env.local scripts/run-migration.js --all
```

`--env-file` is required; this project has no `dotenv` dependency.

Each migration runs in a transaction alongside its `schema_migrations` INSERT.
A failure rolls back both — no half-applied DDL, no phantom ledger row.
Already-recorded migrations are skipped unless you pass `--force`.

`psql $DATABASE_URL -f db/migrations/NNN_name.sql` still works, but bypasses the
ledger. Prefer the runner.

## The rule

**Every migration that lands must also be folded into `schema.sql` in the same
commit.** `schema.sql` describes the database as it is *now*, not as it was at
`001`. Drift between the two is what caused the contact form to break on fresh
databases: `leads.sku` and `leads.intent` existed in production and in the
application code, but in neither `schema.sql` nor any migration.

## Backfilling the ledger

`schema_migrations` arrives with migration `017`. Production already has
`002`–`016` applied, so after running `017` against a database that predates the
ledger, run this **once** to tell the runner what is already there:

```sql
INSERT INTO schema_migrations (id, applied_at, applied_by) VALUES
  ('002_admin_auth.sql',                  '2026-08-12T11:07:00Z', 'backfill'),
  ('003_login_attempts.sql',              '2026-08-12T11:46:00Z', 'backfill'),
  ('004_login_attempts_cleanup.sql',      '2026-08-12T12:44:00Z', 'backfill'),
  ('005_whitelisted_ips.sql',             '2026-08-12T14:36:00Z', 'backfill'),
  ('006_page_views.sql',                  '2026-08-12T17:46:00Z', 'backfill'),
  ('007_analytics_rollup.sql',            '2026-08-12T18:40:00Z', 'backfill'),
  ('008_template_settings.sql',           '2026-08-12T21:00:00Z', 'backfill'),
  ('009_client_portal.sql',               '2026-08-13T20:16:00Z', 'backfill'),
  ('010_page_template.sql',               '2026-08-13T23:39:00Z', 'backfill'),
  ('011_proposal_shared.sql',             '2026-08-14T13:25:00Z', 'backfill'),
  ('012_idempotency.sql',                 '2026-08-17T22:32:00Z', 'backfill'),
  ('013_bezito_readonly.sql',             '2026-08-17T22:32:00Z', 'backfill'),
  ('014_rename_plytix_id_to_zoho_id.sql', '2026-08-31T13:49:00Z', 'backfill'),
  ('015_view_urls.sql',                   '2026-09-17T09:23:00Z', 'backfill'),
  ('016_leads_sku_intent.sql',            '2026-09-17T00:00:00Z', 'backfill')
ON CONFLICT (id) DO NOTHING;
```

Timestamps are the files' mtimes, not true application times — close enough for
ordering, not an audit trail.

`016` is listed because those columns are already live: they were added to
production by hand with no migration file, and `016` only backfills the paper
trail. `013` is listed because the `bezito_readonly` role exists; verify before
trusting it.

**`014` must be in the ledger before anyone runs `--all`.** It is a
`RENAME COLUMN` and is *not* idempotent — a second run errors out.
