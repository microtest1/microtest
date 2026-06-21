
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

GRANT SELECT ON public.datasets TO authenticated;
GRANT ALL ON public.datasets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_assignments TO authenticated;
GRANT ALL ON public.patient_assignments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO authenticated;
GRANT ALL ON public.tests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.annotations TO authenticated;
GRANT ALL ON public.annotations TO service_role;
