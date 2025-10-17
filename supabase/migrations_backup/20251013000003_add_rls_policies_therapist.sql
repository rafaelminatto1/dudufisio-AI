-- Migration: RLS Policies for Therapist Role
-- Description: Create RLS policies for therapists with clinic-scoped access
-- Date: 2025-10-13

-- ====================================
-- Helper function to check if user is therapist
-- ====================================
CREATE OR REPLACE FUNCTION auth.is_therapist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unified_users
    WHERE id = auth.uid()
    AND role IN ('therapist', 'admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ====================================
-- Helper function to get user's clinic_id
-- ====================================
CREATE OR REPLACE FUNCTION auth.user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinic_id FROM unified_users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ====================================
-- Sistema de Agendamento - Therapist Policies
-- ====================================

-- recurrence_templates
CREATE POLICY "Therapists: View/Edit clinic recurrence_templates"
  ON recurrence_templates FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- schedule_blocks
CREATE POLICY "Therapists: View/Edit clinic schedule_blocks"
  ON schedule_blocks FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- waitlist_entries
CREATE POLICY "Therapists: View/Edit clinic waitlist_entries"
  ON waitlist_entries FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- scheduling_alerts
CREATE POLICY "Therapists: View scheduling_alerts"
  ON scheduling_alerts FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

-- ai_predictions
CREATE POLICY "Therapists: View clinic ai_predictions"
  ON ai_predictions FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- ====================================
-- Analytics e Métricas - Therapist Policies
-- ====================================

-- patient_insights
CREATE POLICY "Therapists: View patient_insights"
  ON patient_insights FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

-- treatment_effectiveness
CREATE POLICY "Therapists: View/Edit treatment_effectiveness"
  ON treatment_effectiveness FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (therapist_id = auth.uid() OR therapist_id IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (therapist_id = auth.uid() OR therapist_id IS NULL)
  );

-- payment_methods
CREATE POLICY "Therapists: View clinic payment_methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- financial_alerts
CREATE POLICY "Therapists: View clinic financial_alerts"
  ON financial_alerts FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- recurrent_payments
CREATE POLICY "Therapists: View clinic recurrent_payments"
  ON recurrent_payments FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- financial_goals
CREATE POLICY "Therapists: View/Create clinic financial_goals"
  ON financial_goals FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- cash_flow_predictions
CREATE POLICY "Therapists: View clinic cash_flow_predictions"
  ON cash_flow_predictions FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR clinic_id_fk IS NULL)
  );

-- clinical_metrics
CREATE POLICY "Therapists: View clinic clinical_metrics"
  ON clinical_metrics FOR SELECT
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (clinic_id_fk = auth.user_clinic_id() OR therapist_id = auth.uid() OR clinic_id_fk IS NULL)
  );

-- treatment_outcomes
CREATE POLICY "Therapists: View/Create treatment_outcomes"
  ON treatment_outcomes FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

-- patient_segmentation
CREATE POLICY "Therapists: View patient_segmentation"
  ON patient_segmentation FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

-- clinical_alerts
CREATE POLICY "Therapists: View/Update clinical_alerts"
  ON clinical_alerts FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (assigned_to = auth.uid() OR assigned_to IS NULL)
  )
  WITH CHECK (auth.is_therapist());

-- ====================================
-- Sistema de Exercícios - Therapist Policies
-- ====================================

-- exercise_protocols
CREATE POLICY "Therapists: Full access to exercise_protocols"
  ON exercise_protocols FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

-- protocol_exercises
CREATE POLICY "Therapists: Full access to protocol_exercises"
  ON protocol_exercises FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

-- patient_exercise_prescriptions
CREATE POLICY "Therapists: Full access to patient_exercise_prescriptions"
  ON patient_exercise_prescriptions FOR ALL
  TO authenticated
  USING (
    auth.is_therapist() AND 
    (therapist_id = auth.uid() OR therapist_id IS NULL)
  )
  WITH CHECK (
    auth.is_therapist() AND 
    (therapist_id = auth.uid() OR therapist_id IS NULL)
  );

-- patient_exercise_executions
CREATE POLICY "Therapists: View patient_exercise_executions"
  ON patient_exercise_executions FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

-- ====================================
-- Módulo Esportivo - Therapist Policies
-- ====================================

-- athlete_profiles
CREATE POLICY "Therapists: View/Edit athlete_profiles"
  ON athlete_profiles FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

-- injury_history, athlete_goals, tests, etc
CREATE POLICY "Therapists: Full access to injury_history"
  ON injury_history FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to athlete_goals"
  ON athlete_goals FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to strength_tests"
  ON strength_tests FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to functional_tests"
  ON functional_tests FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to rehab_progressions"
  ON rehab_progressions FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to rom_assessments"
  ON rom_assessments FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to rom_movements"
  ON rom_movements FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to load_monitoring"
  ON load_monitoring FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to psychological_assessments"
  ON psychological_assessments FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: View sport_benchmarks"
  ON sport_benchmarks FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

CREATE POLICY "Therapists: Full access to phase_goals"
  ON phase_goals FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to completed_phases"
  ON completed_phases FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to progression_criteria"
  ON progression_criteria FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: View sports_rehab_protocols"
  ON sports_rehab_protocols FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

CREATE POLICY "Therapists: Full access to sport_training_sessions"
  ON sport_training_sessions FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to session_exercises"
  ON session_exercises FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to daily_wellness"
  ON daily_wellness FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to performance_metrics"
  ON performance_metrics FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to return_to_sport_criteria"
  ON return_to_sport_criteria FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

-- ====================================
-- Módulo de Risco - Therapist Policies
-- ====================================

CREATE POLICY "Therapists: Full access to risk_assessments"
  ON risk_assessments FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_factors"
  ON risk_factors FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_recommendations"
  ON risk_recommendations FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_profiles"
  ON risk_profiles FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_alerts"
  ON risk_alerts FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_intervention_plans"
  ON risk_intervention_plans FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_goals"
  ON risk_goals FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: Full access to risk_interventions"
  ON risk_interventions FOR ALL
  TO authenticated
  USING (auth.is_therapist())
  WITH CHECK (auth.is_therapist());

CREATE POLICY "Therapists: View risk_alert_actions"
  ON risk_alert_actions FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

-- ====================================
-- Family Portal - Therapist Policies
-- ====================================

CREATE POLICY "Therapists: View family_members"
  ON family_members FOR SELECT
  TO authenticated
  USING (auth.is_therapist());

CREATE POLICY "Therapists: View family_portal_access_log"
  ON family_portal_access_log FOR SELECT
  TO authenticated
  USING (auth.is_therapist());


