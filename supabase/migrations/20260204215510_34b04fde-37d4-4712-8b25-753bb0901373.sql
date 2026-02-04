-- Step 1: Drop the view that depends on test_type
DROP VIEW IF EXISTS public.datasets_public;

-- Step 2: Remove pregnancy_weeks column from tests table
ALTER TABLE public.tests DROP COLUMN IF EXISTS pregnancy_weeks;

-- Step 3: Update any remaining pregnancy test references
UPDATE public.tests SET test_type = 'malaria' WHERE test_type = 'pregnancy';
UPDATE public.datasets SET test_type = 'malaria' WHERE test_type = 'pregnancy';

-- Step 4: Create new enum type with only malaria
CREATE TYPE public.test_type_new AS ENUM ('malaria');

-- Step 5: Update the tests table to use the new enum
ALTER TABLE public.tests 
  ALTER COLUMN test_type TYPE public.test_type_new 
  USING test_type::text::public.test_type_new;

-- Step 6: Update the datasets table to use the new enum  
ALTER TABLE public.datasets
  ALTER COLUMN test_type TYPE public.test_type_new
  USING test_type::text::public.test_type_new;

-- Step 7: Drop the old enum and rename new one
DROP TYPE public.test_type;
ALTER TYPE public.test_type_new RENAME TO test_type;

-- Step 8: Recreate the datasets_public view
CREATE VIEW public.datasets_public AS
SELECT 
  id,
  test_type,
  created_at,
  name,
  description,
  image_url,
  classification
FROM public.datasets;

-- Step 9: Add new malaria-specific columns to tests table for enhanced analysis
ALTER TABLE public.tests 
  ADD COLUMN IF NOT EXISTS parasite_species TEXT,
  ADD COLUMN IF NOT EXISTS parasite_density TEXT CHECK (parasite_density IN ('low', 'medium', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS parasite_stage TEXT,
  ADD COLUMN IF NOT EXISTS image_quality TEXT CHECK (image_quality IN ('excellent', 'good', 'fair', 'poor'));

-- Step 10: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tests_parasite_density ON public.tests(parasite_density);
CREATE INDEX IF NOT EXISTS idx_tests_parasite_species ON public.tests(parasite_species);