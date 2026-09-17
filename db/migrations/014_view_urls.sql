-- Add three-view-angle columns to products cache.
-- Zoho CRM field mapping:
--   Visual_Top       → view_1_url
--   Visual_Concept   → view_2_url
--   Visual_Stone_Sketch → view_3_url
-- COALESCE in the sync upsert means manually-patched values survive re-sync.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS view_1_url TEXT,
  ADD COLUMN IF NOT EXISTS view_2_url TEXT,
  ADD COLUMN IF NOT EXISTS view_3_url TEXT;
