-- Add new columns to congresses table for Excel import data

ALTER TABLE congresses ADD COLUMN IF NOT EXISTS organizer       text;
ALTER TABLE congresses ADD COLUMN IF NOT EXISTS indication_detail text;
ALTER TABLE congresses ADD COLUMN IF NOT EXISTS location_text   text;
ALTER TABLE congresses ADD COLUMN IF NOT EXISTS deadlines_text  text;
ALTER TABLE congresses ADD COLUMN IF NOT EXISTS rationale       text;
ALTER TABLE congresses ADD COLUMN IF NOT EXISTS score           int;

-- Unique partial index on website_url to support idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_congresses_website_url
  ON congresses(website_url)
  WHERE website_url IS NOT NULL;
