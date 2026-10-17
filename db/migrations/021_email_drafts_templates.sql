-- Allow email drafts to be promoted to reusable templates.
-- is_template=true + template_name = saved for future campaigns.
ALTER TABLE email_drafts
  ADD COLUMN IF NOT EXISTS is_template   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS template_name TEXT;

CREATE INDEX IF NOT EXISTS email_drafts_templates_idx ON email_drafts (is_template) WHERE is_template = TRUE;
