-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view datasets" ON public.datasets;

-- Create policy for authenticated users to view datasets (safer than public)
CREATE POLICY "Authenticated users can view datasets" 
ON public.datasets 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Create a sanitized view for cases where limited public access is needed
-- This view excludes potentially sensitive metadata fields
CREATE OR REPLACE VIEW public.datasets_public AS
SELECT 
  id,
  name,
  description,
  test_type,
  image_url,
  classification,
  created_at
  -- metadata is intentionally excluded for public access
FROM public.datasets;

-- Grant select on the sanitized view to anon role if public access is ever needed
GRANT SELECT ON public.datasets_public TO anon;
GRANT SELECT ON public.datasets_public TO authenticated;