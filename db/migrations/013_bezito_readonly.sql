-- 013: Read-only Postgres role for Bezito agent direct DB access
-- Allows Bezito scripts to query Neon directly (bypassing HTTP API) for read-only lookups.
--
-- SETUP STEPS (run once in Neon console or as DB superuser):
-- 1. Generate a strong random password (32+ chars) — do NOT use a weak one
-- 2. Replace 'REPLACE_WITH_STRONG_PASSWORD' below with that password
-- 3. Run this file: psql $DATABASE_URL -f db/migrations/013_bezito_readonly.sql
-- 4. Add BEZITO_NEON_READONLY_URL to .env.local:
--    BEZITO_NEON_READONLY_URL=postgres://bezito_readonly:YOURPASSWORD@HOST/DB?sslmode=require
--
-- Apply: psql $DATABASE_URL -f db/migrations/013_bezito_readonly.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bezito_readonly') THEN
    CREATE ROLE bezito_readonly WITH LOGIN PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
  END IF;
END $$;

GRANT CONNECT ON DATABASE neondb TO bezito_readonly;
GRANT USAGE ON SCHEMA public TO bezito_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bezito_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bezito_readonly;
