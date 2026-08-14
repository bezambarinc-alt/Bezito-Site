-- 010: Per-page template selection for client showcase/proposal pages
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'default';
