-- Security & Performance fixes per Supabase advisors

-- 1) Ensure view runs with invoker privileges (not definer)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER VIEW public.body_points_performance_stats SET (security_invoker = on)';
  EXCEPTION WHEN others THEN
    -- Some Postgres versions may not support security_invoker; ignore
    NULL;
  END;
END$$;

-- 2) Restrict materialized view access to authenticated only
REVOKE ALL ON MATERIALIZED VIEW public.body_points_analytics FROM PUBLIC;
REVOKE ALL ON MATERIALIZED VIEW public.body_points_analytics FROM anon;
GRANT SELECT ON MATERIALIZED VIEW public.body_points_analytics TO authenticated;

-- 3) Set immutable search_path on functions
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT n.nspname as schema, p.proname as name, pg_catalog.pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE (n.nspname = 'public')
      AND (p.proname IN (
        'update_updated_at_column',
        'refresh_body_points_analytics',
        'validate_body_point_data',
        'get_pain_evolution',
        'get_region_pain_distribution',
        'soft_delete_body_point',
        'restore_body_point',
        'calculate_age',
        'generate_invoice_number',
        'check_appointment_conflict',
        'update_invoice_status',
        'update_payment_plan_status',
        'get_calendar_stats',
        'cleanup_old_calendar_jobs',
        'get_queue_stats'
      ))
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp', rec.schema, rec.name, rec.args);
  END LOOP;
END$$;

-- 4) Update body_points policies to use (select auth.uid())
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='body_points' AND policyname='body_points_patient_access'
  ) THEN
    DROP POLICY body_points_patient_access ON public.body_points;
  END IF;
  CREATE POLICY body_points_patient_access ON public.body_points
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = body_points.patient_id
          AND (p.created_by = (select auth.uid()) OR p.user_id = (select auth.uid()))
      )
    );

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='body_points' AND policyname='body_points_admin_access'
  ) THEN
    DROP POLICY body_points_admin_access ON public.body_points;
  END IF;
  CREATE POLICY body_points_admin_access ON public.body_points
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = (select auth.uid()) AND u.role = 'admin'
      )
    );
END$$;


