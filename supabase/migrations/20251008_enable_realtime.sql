-- =====================================================
-- MIGRATION: Enable Realtime for New Modules
-- Data: 2025-10-08
-- Descrição: Habilita Realtime para tabelas dos novos módulos
-- =====================================================

-- Habilitar realtime para Risk Stratification
ALTER PUBLICATION supabase_realtime ADD TABLE risk_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE risk_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE risk_profiles;

-- Habilitar realtime para Sports Rehabilitation
ALTER PUBLICATION supabase_realtime ADD TABLE athlete_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE load_monitoring;
ALTER PUBLICATION supabase_realtime ADD TABLE rehab_progressions;
ALTER PUBLICATION supabase_realtime ADD TABLE sport_training_sessions;

-- Habilitar realtime para Family Portal
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE family_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE family_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE family_access_logs;

-- Habilitar realtime para Predictive Analytics
ALTER PUBLICATION supabase_realtime ADD TABLE ai_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE ml_models;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;

-- Habilitar realtime para Quality Assurance
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_audits;
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE quality_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_safety_events;

-- =====================================================
-- RLS Policies para Realtime (Broadcast e Presence)
-- =====================================================

-- Permitir authenticated users receberem broadcasts
CREATE POLICY "authenticated_can_receive_broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Permitir authenticated users enviarem broadcasts
CREATE POLICY "authenticated_can_send_broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON PUBLICATION supabase_realtime IS 'Publication for realtime features including new modules';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


