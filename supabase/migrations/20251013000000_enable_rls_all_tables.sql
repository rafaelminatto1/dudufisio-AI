-- Migration: Enable RLS on all public tables without RLS
-- Description: Enables Row Level Security on 44 tables to comply with security best practices
-- Date: 2025-10-13

-- ====================================
-- Sistema de Agendamento
-- ====================================
ALTER TABLE recurrence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Analytics e Métricas
-- ====================================
ALTER TABLE patient_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_segmentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_alerts ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Sistema de Exercícios
-- ====================================
ALTER TABLE exercise_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercise_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercise_executions ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Módulo Esportivo
-- ====================================
ALTER TABLE injury_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE functional_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rehab_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rom_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_rehab_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE sport_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_wellness ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Módulo de Risco
-- ====================================
ALTER TABLE risk_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alert_actions ENABLE ROW LEVEL SECURITY;

-- ====================================
-- Comentário de auditoria
-- ====================================
COMMENT ON TABLE recurrence_templates IS 'RLS enabled on 2025-10-13 - Security compliance';
COMMENT ON TABLE schedule_blocks IS 'RLS enabled on 2025-10-13 - Security compliance';


