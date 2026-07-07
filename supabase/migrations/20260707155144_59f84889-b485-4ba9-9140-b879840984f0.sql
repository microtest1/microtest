
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS wbc_count integer,
  ADD COLUMN IF NOT EXISTS wbc_assumption integer NOT NULL DEFAULT 8000,
  ADD COLUMN IF NOT EXISTS parasite_density_per_ul numeric,
  ADD COLUMN IF NOT EXISTS counting_method text,
  ADD COLUMN IF NOT EXISTS image_quality_score integer,
  ADD COLUMN IF NOT EXISTS counting_status text,
  ADD COLUMN IF NOT EXISTS counting_notes text;
