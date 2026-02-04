-- Fix security definer view issue - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.datasets_public;

CREATE VIEW public.datasets_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  test_type,
  created_at,
  name,
  description,
  image_url,
  classification
FROM public.datasets;