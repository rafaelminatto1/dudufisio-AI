-- Migration: Fix SECURITY DEFINER views
-- Description: Convert views from SECURITY DEFINER to SECURITY INVOKER to prevent privilege escalation
-- Date: 2025-10-13

-- Drop and recreate views with SECURITY INVOKER
-- Note: View definitions will use the querying user's permissions, not the view creator's

-- ====================================
-- Body Points Analytics
-- ====================================
DROP VIEW IF EXISTS public.body_points_performance_stats;
CREATE VIEW public.body_points_performance_stats 
WITH (security_invoker=true) AS
SELECT 
    bp.patient_id,
    bp.body_region,
    COUNT(*) as total_points,
    AVG(bp.pain_level) as avg_pain_level,
    MAX(bp.created_at) as last_updated
FROM body_points bp
WHERE bp.deleted_at IS NULL
GROUP BY bp.patient_id, bp.body_region;

-- ====================================
-- Active Records Views
-- ====================================
DROP VIEW IF EXISTS public.active_exercises;
CREATE VIEW public.active_exercises 
WITH (security_invoker=true) AS
SELECT * FROM exercises 
WHERE is_active = true AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_patients;
CREATE VIEW public.active_patients 
WITH (security_invoker=true) AS
SELECT * FROM patients 
WHERE status = 'active' AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_clinical_documents;
CREATE VIEW public.active_clinical_documents 
WITH (security_invoker=true) AS
SELECT * FROM clinical_documents 
WHERE status != 'deleted' AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_exercise_protocols;
CREATE VIEW public.active_exercise_protocols 
WITH (security_invoker=true) AS
SELECT * FROM exercise_protocols 
WHERE is_active = true AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_appointments;
CREATE VIEW public.active_appointments 
WITH (security_invoker=true) AS
SELECT * FROM appointments 
WHERE status NOT IN ('cancelled', 'no_show') AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_clinics;
CREATE VIEW public.active_clinics 
WITH (security_invoker=true) AS
SELECT * FROM clinics 
WHERE is_active = true AND deleted_at IS NULL;

DROP VIEW IF EXISTS public.active_prescriptions;
CREATE VIEW public.active_prescriptions 
WITH (security_invoker=true) AS
SELECT * FROM patient_exercise_prescriptions 
WHERE status = 'active' AND deleted_at IS NULL;

-- ====================================
-- Dashboard Views
-- ====================================
DROP VIEW IF EXISTS public.automation_statistics;
CREATE VIEW public.automation_statistics 
WITH (security_invoker=true) AS
SELECT 
    ar.id as rule_id,
    ar.name as rule_name,
    COUNT(ae.id) as total_executions,
    COUNT(CASE WHEN ae.execution_status = 'success' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN ae.execution_status = 'failed' THEN 1 END) as failed_executions
FROM automation_rules ar
LEFT JOIN automation_executions ae ON ar.id = ae.rule_id
WHERE ar.is_active = true
GROUP BY ar.id, ar.name;

DROP VIEW IF EXISTS public.communication_dashboard;
CREATE VIEW public.communication_dashboard 
WITH (security_invoker=true) AS
SELECT 
    date_trunc('day', created_at) as date,
    channel,
    COUNT(*) as messages_sent,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as messages_delivered
FROM notifications
GROUP BY date_trunc('day', created_at), channel;

DROP VIEW IF EXISTS public.lead_conversion_metrics;
CREATE VIEW public.lead_conversion_metrics 
WITH (security_invoker=true) AS
SELECT 
    date_trunc('month', created_at) as month,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN converted_at IS NOT NULL THEN 1 END) as converted_leads,
    ROUND(
        (COUNT(CASE WHEN converted_at IS NOT NULL THEN 1 END)::numeric / 
        NULLIF(COUNT(*)::numeric, 0)) * 100, 
        2
    ) as conversion_rate
FROM leads
GROUP BY date_trunc('month', created_at);

-- ====================================
-- Grant permissions to authenticated users
-- ====================================
GRANT SELECT ON public.body_points_performance_stats TO authenticated;
GRANT SELECT ON public.active_exercises TO authenticated;
GRANT SELECT ON public.active_patients TO authenticated;
GRANT SELECT ON public.active_clinical_documents TO authenticated;
GRANT SELECT ON public.active_exercise_protocols TO authenticated;
GRANT SELECT ON public.active_appointments TO authenticated;
GRANT SELECT ON public.active_clinics TO authenticated;
GRANT SELECT ON public.active_prescriptions TO authenticated;
GRANT SELECT ON public.automation_statistics TO authenticated;
GRANT SELECT ON public.communication_dashboard TO authenticated;
GRANT SELECT ON public.lead_conversion_metrics TO authenticated;


