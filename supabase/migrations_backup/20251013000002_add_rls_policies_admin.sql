-- Migration: RLS Policies for Admin Role
-- Description: Create comprehensive RLS policies for admin users with full access
-- Date: 2025-10-13

-- ====================================
-- Helper function to check if user is admin
-- ====================================
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unified_users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ====================================
-- Sistema de Agendamento - Admin Policies
-- ====================================

-- recurrence_templates
CREATE POLICY "Admins: Full access to recurrence_templates"
  ON recurrence_templates FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- schedule_blocks
CREATE POLICY "Admins: Full access to schedule_blocks"
  ON schedule_blocks FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- waitlist_entries
CREATE POLICY "Admins: Full access to waitlist_entries"
  ON waitlist_entries FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- scheduling_alerts
CREATE POLICY "Admins: Full access to scheduling_alerts"
  ON scheduling_alerts FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ai_predictions
CREATE POLICY "Admins: Full access to ai_predictions"
  ON ai_predictions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ====================================
-- Analytics e Métricas - Admin Policies
-- ====================================

-- patient_insights
CREATE POLICY "Admins: Full access to patient_insights"
  ON patient_insights FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- treatment_effectiveness
CREATE POLICY "Admins: Full access to treatment_effectiveness"
  ON treatment_effectiveness FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- payment_methods
CREATE POLICY "Admins: Full access to payment_methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- financial_alerts
CREATE POLICY "Admins: Full access to financial_alerts"
  ON financial_alerts FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- recurrent_payments
CREATE POLICY "Admins: Full access to recurrent_payments"
  ON recurrent_payments FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- financial_goals
CREATE POLICY "Admins: Full access to financial_goals"
  ON financial_goals FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- cash_flow_predictions
CREATE POLICY "Admins: Full access to cash_flow_predictions"
  ON cash_flow_predictions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- clinical_metrics
CREATE POLICY "Admins: Full access to clinical_metrics"
  ON clinical_metrics FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- treatment_outcomes
CREATE POLICY "Admins: Full access to treatment_outcomes"
  ON treatment_outcomes FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- patient_segmentation
CREATE POLICY "Admins: Full access to patient_segmentation"
  ON patient_segmentation FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- clinical_alerts
CREATE POLICY "Admins: Full access to clinical_alerts"
  ON clinical_alerts FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ====================================
-- Sistema de Exercícios - Admin Policies
-- ====================================

-- exercise_protocols
CREATE POLICY "Admins: Full access to exercise_protocols"
  ON exercise_protocols FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- protocol_exercises
CREATE POLICY "Admins: Full access to protocol_exercises"
  ON protocol_exercises FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- patient_exercise_prescriptions
CREATE POLICY "Admins: Full access to patient_exercise_prescriptions"
  ON patient_exercise_prescriptions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- patient_exercise_executions
CREATE POLICY "Admins: Full access to patient_exercise_executions"
  ON patient_exercise_executions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ====================================
-- Módulo Esportivo - Admin Policies
-- ====================================

-- injury_history
CREATE POLICY "Admins: Full access to injury_history"
  ON injury_history FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- athlete_goals
CREATE POLICY "Admins: Full access to athlete_goals"
  ON athlete_goals FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- athlete_profiles (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to athlete_profiles"
  ON athlete_profiles FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- strength_tests
CREATE POLICY "Admins: Full access to strength_tests"
  ON strength_tests FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- functional_tests
CREATE POLICY "Admins: Full access to functional_tests"
  ON functional_tests FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- rehab_progressions
CREATE POLICY "Admins: Full access to rehab_progressions"
  ON rehab_progressions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- rom_assessments
CREATE POLICY "Admins: Full access to rom_assessments"
  ON rom_assessments FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- rom_movements
CREATE POLICY "Admins: Full access to rom_movements"
  ON rom_movements FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- load_monitoring
CREATE POLICY "Admins: Full access to load_monitoring"
  ON load_monitoring FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- psychological_assessments
CREATE POLICY "Admins: Full access to psychological_assessments"
  ON psychological_assessments FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- sport_benchmarks
CREATE POLICY "Admins: Full access to sport_benchmarks"
  ON sport_benchmarks FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- phase_goals
CREATE POLICY "Admins: Full access to phase_goals"
  ON phase_goals FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- completed_phases
CREATE POLICY "Admins: Full access to completed_phases"
  ON completed_phases FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- progression_criteria
CREATE POLICY "Admins: Full access to progression_criteria"
  ON progression_criteria FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- sports_rehab_protocols
CREATE POLICY "Admins: Full access to sports_rehab_protocols"
  ON sports_rehab_protocols FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- sport_training_sessions
CREATE POLICY "Admins: Full access to sport_training_sessions"
  ON sport_training_sessions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- session_exercises
CREATE POLICY "Admins: Full access to session_exercises"
  ON session_exercises FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- daily_wellness
CREATE POLICY "Admins: Full access to daily_wellness"
  ON daily_wellness FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- performance_metrics (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to performance_metrics"
  ON performance_metrics FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- return_to_sport_criteria (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to return_to_sport_criteria"
  ON return_to_sport_criteria FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ====================================
-- Módulo de Risco - Admin Policies
-- ====================================

-- risk_goals
CREATE POLICY "Admins: Full access to risk_goals"
  ON risk_goals FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_interventions
CREATE POLICY "Admins: Full access to risk_interventions"
  ON risk_interventions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_alert_actions
CREATE POLICY "Admins: Full access to risk_alert_actions"
  ON risk_alert_actions FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_alerts (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_alerts"
  ON risk_alerts FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_assessments (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_assessments"
  ON risk_assessments FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_factors (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_factors"
  ON risk_factors FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_intervention_plans (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_intervention_plans"
  ON risk_intervention_plans FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_profiles (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_profiles"
  ON risk_profiles FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- risk_recommendations (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to risk_recommendations"
  ON risk_recommendations FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ====================================
-- Family Portal - Admin Policies
-- ====================================

-- family_members (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to family_members"
  ON family_members FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- family_portal_access_log (já tem RLS, adicionar policy)
CREATE POLICY "Admins: Full access to family_portal_access_log"
  ON family_portal_access_log FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());


