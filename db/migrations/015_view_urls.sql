-- Migration 015: three view-angle columns on the products cache
--
-- Renumbered from 014 → 015 on 2026-09-17. Two files both claimed 014; this one
-- lost the coin toss because 014_rename_plytix_id_to_zoho_id.sql names its own
-- number inside the file and was applied to production first. Nothing outside
-- db/ referenced this filename.
--
-- Zoho CRM field mapping:
--   Visual_Top          → view_1_url
--   Visual_Concept      → view_2_url
--   Visual_Stone_Sketch → view_3_url
-- COALESCE in the sync upsert means manually-patched values survive re-sync.
--
-- Apply: node scripts/run-migration.js 015

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS view_1_url TEXT,
  ADD COLUMN IF NOT EXISTS view_2_url TEXT,
  ADD COLUMN IF NOT EXISTS view_3_url TEXT;
