-- Explicitly deny anonymous access to sensitive tables
-- This ensures unauthenticated users cannot access any protected data

-- Deny anonymous access to profiles (contains PII)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to subscriptions (contains payment data)
CREATE POLICY "Deny anonymous access to subscriptions"
ON public.subscriptions
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to tests (contains medical data)
CREATE POLICY "Deny anonymous access to tests"
ON public.tests
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to annotations (contains medical annotations)
CREATE POLICY "Deny anonymous access to annotations"
ON public.annotations
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to patient_assignments (contains patient-healthworker relationships)
CREATE POLICY "Deny anonymous access to patient_assignments"
ON public.patient_assignments
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to user_roles (contains authorization data)
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- For datasets_public view - this is intentionally public for reference data
-- but we should protect the underlying datasets table from anonymous writes
-- The view already inherits from datasets which has proper RLS