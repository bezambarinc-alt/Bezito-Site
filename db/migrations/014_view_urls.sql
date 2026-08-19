-- Add three-view-angle columns to products cache.
-- Plytix attribute slugs (confirmed 2026-08-19):
--   visual_top       → view_1_url
--   visual_concept   → view_2_url
--   visual_stone_sketch → view_3_url
-- COALESCE in the sync upsert means manually-patched values survive re-sync.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS view_1_url TEXT,
  ADD COLUMN IF NOT EXISTS view_2_url TEXT,
  ADD COLUMN IF NOT EXISTS view_3_url TEXT;
