-- Migration: Fix Function Search Paths
-- Description: Add search_path to 30+ functions to prevent SQL injection vulnerabilities
-- Date: 2025-10-13

-- ====================================
-- Document Management Functions
-- ====================================
ALTER FUNCTION public.increment_document_version() SET search_path = public, extensions;
ALTER FUNCTION public.generate_document_hash(jsonb) SET search_path = public, extensions;
ALTER FUNCTION public.validate_document_integrity(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.get_document_version_history(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.audit_clinical_documents() SET search_path = public, extensions;

-- ====================================
-- User Management Functions
-- ====================================
ALTER FUNCTION public.handle_new_user() SET search_path = public, extensions, auth;
ALTER FUNCTION public.update_unified_users_updated_at() SET search_path = public, extensions;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;

-- ====================================
-- Inventory Management Functions
-- ====================================
ALTER FUNCTION public.update_supply_stock() SET search_path = public, extensions;
ALTER FUNCTION public.generate_order_number() SET search_path = public, extensions;
ALTER FUNCTION public.consume_supplies_for_task(uuid, uuid, integer) SET search_path = public, extensions;
ALTER FUNCTION public.update_task_total_cost() SET search_path = public, extensions;
ALTER FUNCTION public.calculate_task_total_cost(uuid) SET search_path = public, extensions;

-- ====================================
-- Alert System Functions
-- ====================================
ALTER FUNCTION public.check_low_stock_alerts() SET search_path = public, extensions;
ALTER FUNCTION public.check_expiration_alerts() SET search_path = public, extensions;
ALTER FUNCTION public.check_overdue_orders() SET search_path = public, extensions;
ALTER FUNCTION public.run_alert_checks() SET search_path = public, extensions;
ALTER FUNCTION public.create_notifications_for_alert(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.trigger_create_alert_notifications() SET search_path = public, extensions;

-- ====================================
-- Audit and Compliance Functions
-- ====================================
ALTER FUNCTION public.generic_audit_trigger() SET search_path = public, extensions;
ALTER FUNCTION public.log_access_denied(text, text, uuid, text) SET search_path = public, extensions, auth;
ALTER FUNCTION public.get_record_audit_history(text, uuid) SET search_path = public, extensions;
ALTER FUNCTION public.generate_lgpd_compliance_report(uuid) SET search_path = public, extensions;

-- ====================================
-- Soft Delete Functions
-- ====================================
ALTER FUNCTION public.soft_delete_record(text, uuid) SET search_path = public, extensions;
ALTER FUNCTION public.restore_deleted_record(text, uuid) SET search_path = public, extensions;
ALTER FUNCTION public.list_deleted_records(text) SET search_path = public, extensions;
ALTER FUNCTION public.cleanup_old_soft_deleted_records(integer) SET search_path = public, extensions;
ALTER FUNCTION public.prevent_hard_delete_critical_data() SET search_path = public, extensions;

-- ====================================
-- Body Points Functions
-- ====================================
ALTER FUNCTION public.refresh_body_points_analytics() SET search_path = public, extensions;
ALTER FUNCTION public.validate_body_point_data() SET search_path = public, extensions;
ALTER FUNCTION public.soft_delete_body_point(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.restore_body_point(uuid) SET search_path = public, extensions;

-- ====================================
-- Calendar Integration Functions
-- ====================================
ALTER FUNCTION public.get_calendar_stats() SET search_path = public, extensions;
ALTER FUNCTION public.cleanup_old_calendar_jobs(integer) SET search_path = public, extensions;
ALTER FUNCTION public.get_queue_stats() SET search_path = public, extensions;

-- ====================================
-- Communication Functions
-- ====================================
ALTER FUNCTION public.get_communication_metrics(date, date) SET search_path = public, extensions;
ALTER FUNCTION public.get_automation_stats() SET search_path = public, extensions;
ALTER FUNCTION public.update_automation_rule_execution_count() SET search_path = public, extensions;
ALTER FUNCTION public.cleanup_old_communication_data(integer) SET search_path = public, extensions;

-- ====================================
-- CRM and Lead Management Functions
-- ====================================
ALTER FUNCTION public.calculate_lead_score(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.convert_lead_to_patient(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.update_lead_score_on_interaction() SET search_path = public, extensions;
ALTER FUNCTION public.process_automation_rules(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.apply_message_template(uuid, jsonb) SET search_path = public, extensions;
ALTER FUNCTION public.schedule_followup(uuid, timestamp with time zone, text, text) SET search_path = public, extensions;
ALTER FUNCTION public.get_pending_followups() SET search_path = public, extensions;

-- ====================================
-- Clinical Functions
-- ====================================
ALTER FUNCTION public.validate_no_insurance_policy() SET search_path = public, extensions;
ALTER FUNCTION public.calculate_age(date) SET search_path = public, extensions;
ALTER FUNCTION public.generate_invoice_number() SET search_path = public, extensions;
ALTER FUNCTION public.check_appointment_conflict(uuid, date, time, time) SET search_path = public, extensions;
ALTER FUNCTION public.update_invoice_status() SET search_path = public, extensions;
ALTER FUNCTION public.update_payment_plan_status() SET search_path = public, extensions;
ALTER FUNCTION public.get_pain_evolution(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.get_region_pain_distribution(uuid) SET search_path = public, extensions;

-- ====================================
-- Comments for audit trail
-- ====================================
COMMENT ON FUNCTION public.increment_document_version IS 'search_path fixed on 2025-10-13 - Security compliance';
COMMENT ON FUNCTION public.handle_new_user IS 'search_path fixed on 2025-10-13 - Security compliance';


