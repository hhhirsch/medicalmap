-- Congress Directory Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS congresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  indication text NOT NULL,
  tier int NOT NULL CHECK (tier BETWEEN 1 AND 3),
  region text NOT NULL CHECK (region IN ('EU', 'NA', 'APAC', 'LATAM', 'MEA')),
  scope text NOT NULL CHECK (scope IN ('International', 'European', 'National', 'Regional')),
  country text,
  city text,
  start_date date,
  end_date date CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  typical_month int CHECK (typical_month IS NULL OR (typical_month BETWEEN 1 AND 12)),
  website_url text NOT NULL,
  tags jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_congresses_indication ON congresses(indication);
CREATE INDEX IF NOT EXISTS idx_congresses_tier ON congresses(tier);
CREATE INDEX IF NOT EXISTS idx_congresses_region ON congresses(region);
CREATE INDEX IF NOT EXISTS idx_congresses_country ON congresses(country);
CREATE INDEX IF NOT EXISTS idx_congresses_start_date ON congresses(start_date);
CREATE INDEX IF NOT EXISTS idx_congresses_tags ON congresses USING GIN(tags);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  consent_export boolean NOT NULL,
  consent_marketing boolean DEFAULT false,
  source jsonb
);

CREATE TABLE IF NOT EXISTS export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  filters jsonb NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('csv', 'xlsx')),
  created_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed'))
);
