-- Migration 023: add metal_images JSONB and available_metals text[] to products
-- These are populated by pim-sync from new Zoho CRM fields:
--   Platinum_Front_URL, Platinum_Top_URL, Platinum_Angled_URL
--   Rose_Gold_Front_URL, Rose_Gold_Top_URL, Rose_Gold_Angled_URL
--   Yellow_Gold_Front_URL, Yellow_Gold_Top_URL, Yellow_Gold_Angled_URL
--   Available_Metals (multiselectpicklist)

ALTER TABLE products ADD COLUMN IF NOT EXISTS metal_images JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_metals TEXT[];

-- Fold this migration into db/schema.sql as well (run after apply).
INSERT INTO schema_migrations (id) VALUES ('023_metal_images.sql') ON CONFLICT (id) DO NOTHING;
