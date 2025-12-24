-- Drop the existing view and recreate with security_invoker = true
DROP VIEW IF EXISTS public.datasets_public;

-- Recreate the view with security_invoker = true (not security definer)
CREATE VIEW public.datasets_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  description,
  test_type,
  image_url,
  classification,
  created_at
FROM public.datasets;

-- Re-grant permissions
GRANT SELECT ON public.datasets_public TO anon;
GRANT SELECT ON public.datasets_public TO authenticated;