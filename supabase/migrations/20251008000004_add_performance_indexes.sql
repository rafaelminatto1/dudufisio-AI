-- ============================================================================
-- MIGRAÇÃO: ÍNDICES COMPOSTOS PARA PERFORMANCE
-- Data: 2025-10-08
-- Descrição: Adiciona índices otimizados para queries comuns do sistema
-- ============================================================================

BEGIN;

-- ============================================================================
-- APPOINTMENTS - Queries de agendamento
-- ============================================================================

-- Busca de appointments por terapeuta e data
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date 
  ON appointments(therapist_id, scheduled_at DESC) 
  WHERE status != 'cancelled' AND status != 'no_show';

-- Busca de appointments por paciente e data
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
  ON appointments(patient_id, scheduled_at DESC);

-- Busca de appointments por clínica e data (se coluna existir)
-- CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date 
--   ON appointments(clinic_id_fk, scheduled_at DESC) 
--   WHERE clinic_id_fk IS NOT NULL;

-- Appointments pendentes de confirmação
-- Removido índice com NOW() pois não é IMMUTABLE
-- CREATE INDEX IF NOT EXISTS idx_appointments_pending_confirmation
--   ON appointments(scheduled_at)
--   WHERE status = 'scheduled' AND scheduled_at > NOW();

-- Appointments do dia por status
-- Removido índice com CURRENT_DATE pois não é IMMUTABLE
-- CREATE INDEX IF NOT EXISTS idx_appointments_today_status
--   ON appointments(status, scheduled_at)
--   WHERE scheduled_at::date = CURRENT_DATE;

-- ============================================================================
-- CLINICAL_DOCUMENTS - Queries de prontuário
-- ============================================================================

-- Documentos por paciente e data de criação
-- CREATE INDEX IF NOT EXISTS idx_clinical_docs_patient_created 
--   ON clinical_documents(patient_id, created_at DESC)
--   WHERE status != 'deleted';

-- Documentos por terapeuta e tipo
CREATE INDEX IF NOT EXISTS idx_clinical_docs_therapist_type 
  ON clinical_documents(created_by, document_type, created_at DESC) 
  WHERE status = 'signed';

-- Documentos pendentes de assinatura
CREATE INDEX IF NOT EXISTS idx_clinical_docs_unsigned
  ON clinical_documents(created_by, created_at DESC)
  WHERE is_signed = FALSE AND status = 'draft';

-- Documentos por especialidade
CREATE INDEX IF NOT EXISTS idx_clinical_docs_specialty
  ON clinical_documents(specialty, created_at DESC)
  WHERE status = 'signed';

-- ============================================================================
-- PATIENTS - Queries de pacientes
-- ============================================================================

-- Pacientes por clínica e criação
-- CREATE INDEX IF NOT EXISTS idx_patients_clinic_created
--   ON patients(clinic_id, created_at DESC)
--   WHERE deleted_at IS NULL;

-- Busca de pacientes por nome (text search)
-- CREATE INDEX IF NOT EXISTS idx_patients_name_search
--   ON patients USING gin(to_tsvector('portuguese', name))
--   WHERE deleted_at IS NULL;

-- Pacientes por email
CREATE INDEX IF NOT EXISTS idx_patients_email_lookup
  ON patients(email)
  WHERE email IS NOT NULL;

-- ============================================================================
-- EXERCISES & PRESCRIPTIONS - Queries de exercícios
-- ============================================================================

-- Prescrições ativas por paciente
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient_active
  ON patient_exercise_prescriptions(patient_id, status, start_date DESC)
  WHERE status = 'active';

-- Prescrições por terapeuta
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_therapist
  ON patient_exercise_prescriptions(therapist_id, created_at DESC);

-- Execuções por paciente e data
CREATE INDEX IF NOT EXISTS idx_exercise_executions_patient_date 
  ON patient_exercise_executions(patient_id, execution_date DESC);

-- Execuções por prescrição
CREATE INDEX IF NOT EXISTS idx_exercise_executions_prescription
  ON patient_exercise_executions(prescription_id, execution_date DESC);

-- Exercícios por categoria e dificuldade
CREATE INDEX IF NOT EXISTS idx_exercises_category_difficulty
  ON exercises(category, difficulty_level)
  WHERE is_active = TRUE;

-- ============================================================================
-- ANALYTICS & INSIGHTS - Queries de analytics
-- ============================================================================

-- Treatment effectiveness por tipo e resultado
CREATE INDEX IF NOT EXISTS idx_treatment_effectiveness_type_outcome 
  ON treatment_effectiveness(treatment_type, outcome_score DESC, end_date DESC) 
  WHERE end_date IS NOT NULL;

-- Patient insights ativos por prioridade
CREATE INDEX IF NOT EXISTS idx_patient_insights_priority 
  ON patient_insights(patient_id, priority, status, created_at DESC) 
  WHERE status = 'active';

-- AI predictions por tipo e data
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type_date
  ON ai_predictions(prediction_type, target_date DESC, confidence_score DESC);

-- Clinical metrics por tipo e período
CREATE INDEX IF NOT EXISTS idx_clinical_metrics_type_period
  ON clinical_metrics(metric_type, period_start DESC, period_end DESC);

-- ============================================================================
-- ALERTS - Queries de alertas
-- ============================================================================

-- Alertas financeiros ativos
CREATE INDEX IF NOT EXISTS idx_financial_alerts_active 
  ON financial_alerts(clinic_id_fk, status, severity, created_at DESC) 
  WHERE status = 'active';

-- Alertas clínicos ativos
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_active 
  ON clinical_alerts(assigned_to, status, severity, created_at DESC) 
  WHERE status = 'active';

-- Alertas não resolvidos por paciente
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_patient_unresolved
  ON clinical_alerts(patient_id, severity, created_at DESC)
  WHERE status != 'resolved';

-- ============================================================================
-- AUDIT & COMPLIANCE - Queries de auditoria
-- ============================================================================

-- Audit trail por usuário
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed 
  ON audit_trail(performed_by, performed_at DESC);

-- Audit trail por documento e ação
CREATE INDEX IF NOT EXISTS idx_audit_trail_document_action 
  ON audit_trail(document_id, action, performed_at DESC);

-- Audit trail recente (últimos 30 dias)
-- Removido índice com NOW() pois não é IMMUTABLE
-- CREATE INDEX IF NOT EXISTS idx_audit_trail_recent
--   ON audit_trail(performed_at DESC)
--   WHERE performed_at > NOW() - INTERVAL '30 days';

-- Digital signatures por verificação
CREATE INDEX IF NOT EXISTS idx_signatures_verification
  ON digital_signatures(verification_status, signed_at DESC);

-- Compliance validations por documento
CREATE INDEX IF NOT EXISTS idx_compliance_document_type
  ON compliance_validations(document_id, validation_type, validated_at DESC);

-- ============================================================================
-- SCHEDULING - Queries de agendamento avançado
-- ============================================================================

-- Waitlist entries ativas
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_active
  ON waitlist_entries(urgency DESC, created_at)
  WHERE status = 'waiting';

-- Schedule blocks por terapeuta e período
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_therapist_period
  ON schedule_blocks(therapist_id, start_at, end_at);

-- Scheduling alerts ativos
CREATE INDEX IF NOT EXISTS idx_scheduling_alerts_active
  ON scheduling_alerts(alert_type, created_at DESC)
  WHERE resolved = FALSE;

-- ============================================================================
-- FINANCIAL - Queries financeiras
-- ============================================================================

-- Recurrent payments próximos
CREATE INDEX IF NOT EXISTS idx_recurrent_payments_upcoming
  ON recurrent_payments(next_payment_date, status)
  WHERE status = 'active' AND next_payment_date IS NOT NULL;

-- Financial goals ativos
CREATE INDEX IF NOT EXISTS idx_financial_goals_active
  ON financial_goals(clinic_id_fk, target_date, status)
  WHERE status = 'active';

-- ============================================================================
-- COMMUNICATION - Queries de comunicação
-- ============================================================================

-- Se existir tabela de mensagens
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread 
             ON messages(recipient_id, created_at DESC) 
             WHERE read_at IS NULL';
    
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_conversation 
             ON messages(sender_id, recipient_id, created_at DESC)';
  END IF;
END $$;

-- ============================================================================
-- ÍNDICES JSONB - Para queries em campos JSON
-- ============================================================================

-- Content em clinical_documents (para busca textual)
CREATE INDEX IF NOT EXISTS idx_clinical_docs_content_gin
  ON clinical_documents USING gin(content);

-- Metadata em appointments
CREATE INDEX IF NOT EXISTS idx_appointments_metadata_gin
  ON appointments USING gin(metadata)
  WHERE metadata IS NOT NULL AND metadata != '{}'::jsonb;

-- Settings em clinics
CREATE INDEX IF NOT EXISTS idx_clinics_settings_gin
  ON clinics USING gin(settings)
  WHERE settings IS NOT NULL;

-- Permissions em unified_users
CREATE INDEX IF NOT EXISTS idx_unified_users_permissions_gin
  ON unified_users USING gin(permissions)
  WHERE permissions IS NOT NULL AND permissions != '[]'::jsonb;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON INDEX idx_appointments_therapist_date IS 'Otimiza busca de appointments por terapeuta e data';
COMMENT ON INDEX idx_clinical_docs_patient_created IS 'Otimiza busca de prontuário por paciente';
COMMENT ON INDEX idx_exercise_prescriptions_patient_active IS 'Otimiza busca de prescrições ativas do paciente';
COMMENT ON INDEX idx_audit_trail_recent IS 'Índice parcial para auditoria recente (30 dias)';

COMMIT;
