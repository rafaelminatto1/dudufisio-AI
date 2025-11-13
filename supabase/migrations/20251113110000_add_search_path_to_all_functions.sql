-- Migration: Adicionar search_path a todas as funções restantes
-- Data: 2025-11-13
-- Descrição: Corrige vulnerabilidade de segurança em 47 funções adicionando SET search_path = public

-- ============================================================================
-- FUNÇÕES DE TIMESTAMP (9 funções)
-- ============================================================================

ALTER FUNCTION public.update_body_map_pain_regions_updated_at() SET search_path = public;
ALTER FUNCTION public.update_body_map_sessions_updated_at() SET search_path = public;
ALTER FUNCTION public.update_patient_messages_updated_at() SET search_path = public;
ALTER FUNCTION public.update_push_tokens_updated_at() SET search_path = public;
ALTER FUNCTION public.update_session_evolutions_updated_at() SET search_path = public;
ALTER FUNCTION public.update_teleconsultas_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_whatsapp_prefs_updated_at() SET search_path = public;

-- ============================================================================
-- FUNÇÕES DE NEGÓCIO (10 funções)
-- ============================================================================

ALTER FUNCTION public.check_and_create_low_stock_alert() SET search_path = public;
ALTER FUNCTION public.check_appointment_conflict(uuid, timestamp with time zone, timestamp with time zone, uuid) SET search_path = public;
ALTER FUNCTION public.create_payment(uuid, uuid, numeric, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.generate_order_number() SET search_path = public;
ALTER FUNCTION public.get_therapist_availability(uuid, date) SET search_path = public;
ALTER FUNCTION public.process_refund(uuid, numeric, text) SET search_path = public;
ALTER FUNCTION public.request_appointment(uuid, timestamp with time zone, text, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.respond_appointment_request(uuid, boolean, timestamp with time zone, text) SET search_path = public;
ALTER FUNCTION public.update_payment_status(uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.update_stock_after_movement() SET search_path = public;

-- ============================================================================
-- FUNÇÕES DE NOTIFICAÇÕES/MENSAGENS (8 funções)
-- ============================================================================

ALTER FUNCTION public.cleanup_old_notifications() SET search_path = public;
ALTER FUNCTION public.create_notification(uuid, text, text, text, jsonb, timestamp with time zone, text[]) SET search_path = public;
ALTER FUNCTION public.get_user_messages(text, integer) SET search_path = public;
ALTER FUNCTION public.mark_all_notifications_read(uuid) SET search_path = public;
ALTER FUNCTION public.mark_message_read(uuid) SET search_path = public;
ALTER FUNCTION public.mark_notification_read(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.send_patient_message(uuid, text, text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.update_whatsapp_message_status(text, text, timestamp with time zone) SET search_path = public;

-- ============================================================================
-- FUNÇÕES AUXILIARES (20 funções)
-- ============================================================================

ALTER FUNCTION public.cancel_teleconsulta(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.clean_old_push_tokens() SET search_path = public;
ALTER FUNCTION public.create_patient_access_code(uuid, uuid, integer) SET search_path = public;
ALTER FUNCTION public.create_teleconsulta(uuid, uuid, uuid, timestamp with time zone, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.end_teleconsulta(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.generate_access_code() SET search_path = public;
ALTER FUNCTION public.get_exercise_statistics() SET search_path = public;
ALTER FUNCTION public.get_financial_summary(date, date, uuid) SET search_path = public;
ALTER FUNCTION public.get_unread_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_teleconsultas(uuid, text, integer) SET search_path = public;
ALTER FUNCTION public.has_permission(uuid, text) SET search_path = public;
ALTER FUNCTION public.increment_material_download(uuid) SET search_path = public;
ALTER FUNCTION public.increment_template_usage(uuid) SET search_path = public;
ALTER FUNCTION public.soft_delete_user(uuid) SET search_path = public;
ALTER FUNCTION public.start_teleconsulta(uuid, uuid, text) SET search_path = public;
ALTER FUNCTION public.trigger_update_stats() SET search_path = public;
ALTER FUNCTION public.update_last_login() SET search_path = public;
ALTER FUNCTION public.update_patient_activity() SET search_path = public;
ALTER FUNCTION public.update_patient_stats(uuid) SET search_path = public;
ALTER FUNCTION public.validate_access_code(text) SET search_path = public;

-- ============================================================================
-- MENSAGEM DE CONCLUSÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Migração de search_path aplicada com sucesso!';
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Total de funções corrigidas: 47';
  RAISE NOTICE '  - Funções de timestamp: 9';
  RAISE NOTICE '  - Funções de negócio: 10';
  RAISE NOTICE '  - Funções de notificações: 8';
  RAISE NOTICE '  - Funções auxiliares: 20';
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Vulnerabilidade "Function Search Path Mutable" corrigida!';
  RAISE NOTICE '===================================================================';
END $$;
