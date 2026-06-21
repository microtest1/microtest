ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS risk_level text,
  ADD COLUMN IF NOT EXISTS parasite_count integer,
  ADD COLUMN IF NOT EXISTS detected_regions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_issues jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.tests
  ADD CONSTRAINT tests_risk_level_check
  CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high'));