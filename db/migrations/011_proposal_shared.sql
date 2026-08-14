-- Migration 011: proposal shared-link flag
-- Adds a 'shared' column to pages.
-- When shared=false (default): proposal requires client portal auth to view.
-- When shared=true: anyone with the link can view (Google-Drive-style "anyone with link").
-- Only relevant for doc_type='proposal'. Showcase pages use the PIN system instead.

ALTER TABLE pages ADD COLUMN IF NOT EXISTS shared BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN pages.shared IS
  'Proposal sharing mode. false (default) = only the assigned client can view (portal auth required). '
  'true = anyone with the link can view. Has no effect on showcase pages (they use customer_pin).';
