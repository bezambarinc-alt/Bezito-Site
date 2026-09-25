-- Migration 018: zoho_tokens — persist Zoho OAuth refresh tokens across deploys
--
-- The website previously stored ZOHO_REFRESH_TOKEN only as a Vercel env var.
-- That required a manual Vercel dashboard edit every time the token was rotated.
-- This table lets the /api/auth/zoho/callback route store the new refresh token
-- in Neon, and zoho-auth.ts reads from here first (falling back to env var).
--
-- Apply: node scripts/run-migration.js 018

CREATE TABLE IF NOT EXISTS zoho_tokens (
  id           TEXT PRIMARY KEY DEFAULT 'bezambar_site',
  refresh_token TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE zoho_tokens IS
  'Zoho OAuth refresh tokens written by /api/auth/zoho/callback. One row per app (default: bezambar_site).';
