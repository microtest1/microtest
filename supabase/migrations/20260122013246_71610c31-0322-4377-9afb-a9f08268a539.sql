-- Fix 1: Drop overly permissive healthworker policies on tests table
DROP POLICY IF EXISTS "Healthworkers can view all tests" ON public.tests;

-- Fix 2: Drop overly permissive healthworker policies on profiles table  
DROP POLICY IF EXISTS "Healthworkers can view all annotations" ON public.annotations;

-- Fix 3: Create more restrictive policy - healthworkers can only view tests they are assigned to
-- For now, we'll create a patient_assignments table to properly track which healthworkers can access which patients
CREATE TABLE IF NOT EXISTS public.patient_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    healthworker_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    assigned_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'active',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(healthworker_id, patient_id)
);

-- Enable RLS on patient_assignments
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;

-- Healthworkers can view their own assignments
CREATE POLICY "Healthworkers can view own assignments"
ON public.patient_assignments
FOR SELECT
USING (auth.uid() = healthworker_id);

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
ON public.patient_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if healthworker is assigned to patient
CREATE OR REPLACE FUNCTION public.is_assigned_to_patient(_healthworker_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_assignments
    WHERE healthworker_id = _healthworker_id
      AND patient_id = _patient_id
      AND status = 'active'
  )
$$;

-- New policy: Healthworkers can only view tests of assigned patients
CREATE POLICY "Healthworkers can view assigned patient tests"
ON public.tests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR is_assigned_to_patient(auth.uid(), user_id)
);

-- New policy: Healthworkers can only view annotations of assigned patients
CREATE POLICY "Healthworkers can view assigned patient annotations"
ON public.annotations
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR is_assigned_to_patient(auth.uid(), user_id)
);

-- Drop overly permissive profile policies for healthworkers
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create restricted profile view policy - healthworkers see only assigned patients
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND has_role(auth.uid(), 'admin'::app_role)
);

-- Healthworkers can view profiles of assigned patients only
CREATE POLICY "Healthworkers can view assigned patient profiles"
ON public.profiles
FOR SELECT
USING (
  is_assigned_to_patient(auth.uid(), user_id)
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_patient_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_patient_assignments_updated_at
BEFORE UPDATE ON public.patient_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_patient_assignments_updated_at();