-- Migration: RLS Policies for Patient Role
-- Description: Create RLS policies for patients with restricted access to their own data
-- Date: 2025-10-13

-- ====================================
-- Helper function to check if user is patient
-- ====================================
CREATE OR REPLACE FUNCTION auth.is_patient()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unified_users
    WHERE id = auth.uid()
    AND role = 'patient'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ====================================
-- Helper function to get patient_id from user
-- ====================================
CREATE OR REPLACE FUNCTION auth.user_patient_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM patients
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- ====================================
-- Sistema de Agendamento - Patient Policies
-- ====================================

-- waitlist_entries
CREATE POLICY "Patients: View own waitlist_entries"
  ON waitlist_entries FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- scheduling_alerts (patients don't see these)
-- No policy needed - admins and therapists only

-- ====================================
-- Analytics e Métricas - Patient Policies
-- ====================================

-- patient_insights
CREATE POLICY "Patients: View own insights"
  ON patient_insights FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- treatment_effectiveness
CREATE POLICY "Patients: View own treatment_effectiveness"
  ON treatment_effectiveness FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- patient_segmentation
CREATE POLICY "Patients: View own segmentation"
  ON patient_segmentation FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- clinical_alerts
CREATE POLICY "Patients: View own clinical_alerts"
  ON clinical_alerts FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- treatment_outcomes
CREATE POLICY "Patients: View own treatment_outcomes"
  ON treatment_outcomes FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- ====================================
-- Sistema de Exercícios - Patient Policies
-- ====================================

-- exercise_protocols (read-only for reference)
CREATE POLICY "Patients: View exercise_protocols"
  ON exercise_protocols FOR SELECT
  TO authenticated
  USING (auth.is_patient() AND is_active = true);

-- protocol_exercises (read-only for reference)
CREATE POLICY "Patients: View protocol_exercises"
  ON protocol_exercises FOR SELECT
  TO authenticated
  USING (auth.is_patient());

-- patient_exercise_prescriptions
CREATE POLICY "Patients: View own prescriptions"
  ON patient_exercise_prescriptions FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- patient_exercise_executions
CREATE POLICY "Patients: View/Create own executions"
  ON patient_exercise_executions FOR ALL
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  )
  WITH CHECK (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- ====================================
-- Módulo Esportivo - Patient Policies
-- ====================================

-- athlete_profiles
CREATE POLICY "Patients: View/Update own athlete_profile"
  ON athlete_profiles FOR ALL
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  )
  WITH CHECK (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

-- injury_history
CREATE POLICY "Patients: View own injury_history"
  ON injury_history FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = injury_history.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- athlete_goals
CREATE POLICY "Patients: View own athlete_goals"
  ON athlete_goals FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = athlete_goals.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- strength_tests, functional_tests, etc (view only)
CREATE POLICY "Patients: View own strength_tests"
  ON strength_tests FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM return_to_sport_criteria rtsc
      JOIN athlete_profiles ap ON ap.patient_id = auth.user_patient_id()
      WHERE rtsc.id = strength_tests.rts_criteria_id
    )
  );

CREATE POLICY "Patients: View own functional_tests"
  ON functional_tests FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM return_to_sport_criteria rtsc
      JOIN athlete_profiles ap ON ap.patient_id = auth.user_patient_id()
      WHERE rtsc.id = functional_tests.rts_criteria_id
    )
  );

-- rehab_progressions
CREATE POLICY "Patients: View own rehab_progressions"
  ON rehab_progressions FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = rehab_progressions.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- rom_assessments, rom_movements
CREATE POLICY "Patients: View own rom_assessments"
  ON rom_assessments FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM return_to_sport_criteria rtsc
      JOIN athlete_profiles ap ON ap.patient_id = auth.user_patient_id()
      WHERE rtsc.id = rom_assessments.rts_criteria_id
    )
  );

CREATE POLICY "Patients: View own rom_movements"
  ON rom_movements FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM rom_assessments ra
      WHERE ra.id = rom_movements.rom_assessment_id
    )
  );

-- load_monitoring
CREATE POLICY "Patients: View own load_monitoring"
  ON load_monitoring FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = load_monitoring.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- psychological_assessments
CREATE POLICY "Patients: View own psychological_assessments"
  ON psychological_assessments FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM return_to_sport_criteria rtsc
      JOIN athlete_profiles ap ON ap.patient_id = auth.user_patient_id()
      WHERE rtsc.id = psychological_assessments.rts_criteria_id
    )
  );

-- sport_benchmarks (public reference data)
CREATE POLICY "Patients: View sport_benchmarks"
  ON sport_benchmarks FOR SELECT
  TO authenticated
  USING (auth.is_patient());

-- phase_goals, completed_phases, progression_criteria
CREATE POLICY "Patients: View own phase_goals"
  ON phase_goals FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM rehab_progressions rp
      JOIN athlete_profiles ap ON ap.id = rp.athlete_id
      WHERE rp.id = phase_goals.progression_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

CREATE POLICY "Patients: View own completed_phases"
  ON completed_phases FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM rehab_progressions rp
      JOIN athlete_profiles ap ON ap.id = rp.athlete_id
      WHERE rp.id = completed_phases.progression_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

CREATE POLICY "Patients: View own progression_criteria"
  ON progression_criteria FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM rehab_progressions rp
      JOIN athlete_profiles ap ON ap.id = rp.athlete_id
      WHERE rp.id = progression_criteria.progression_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- sports_rehab_protocols (reference data)
CREATE POLICY "Patients: View sports_rehab_protocols"
  ON sports_rehab_protocols FOR SELECT
  TO authenticated
  USING (auth.is_patient() AND is_active = true);

-- sport_training_sessions
CREATE POLICY "Patients: View own sport_training_sessions"
  ON sport_training_sessions FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = sport_training_sessions.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- session_exercises
CREATE POLICY "Patients: View own session_exercises"
  ON session_exercises FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM sport_training_sessions sts
      JOIN athlete_profiles ap ON ap.id = sts.athlete_id
      WHERE sts.id = session_exercises.session_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- daily_wellness
CREATE POLICY "Patients: View/Create own daily_wellness"
  ON daily_wellness FOR ALL
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = daily_wellness.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  )
  WITH CHECK (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = daily_wellness.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- performance_metrics
CREATE POLICY "Patients: View own performance_metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = performance_metrics.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- return_to_sport_criteria
CREATE POLICY "Patients: View own return_to_sport_criteria"
  ON return_to_sport_criteria FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM athlete_profiles ap
      WHERE ap.id = return_to_sport_criteria.athlete_id
      AND ap.patient_id = auth.user_patient_id()
    )
  );

-- ====================================
-- Módulo de Risco - Patient Policies
-- ====================================

CREATE POLICY "Patients: View own risk_assessments"
  ON risk_assessments FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

CREATE POLICY "Patients: View own risk_factors"
  ON risk_factors FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM risk_assessments ra
      WHERE ra.id = risk_factors.assessment_id
      AND ra.patient_id = auth.user_patient_id()
    )
  );

CREATE POLICY "Patients: View own risk_recommendations"
  ON risk_recommendations FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM risk_assessments ra
      WHERE ra.id = risk_recommendations.assessment_id
      AND ra.patient_id = auth.user_patient_id()
    )
  );

CREATE POLICY "Patients: View own risk_profiles"
  ON risk_profiles FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

CREATE POLICY "Patients: View own risk_alerts"
  ON risk_alerts FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

CREATE POLICY "Patients: View own risk_intervention_plans"
  ON risk_intervention_plans FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

CREATE POLICY "Patients: View own risk_goals"
  ON risk_goals FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM risk_intervention_plans rip
      WHERE rip.id = risk_goals.plan_id
      AND rip.patient_id = auth.user_patient_id()
    )
  );

CREATE POLICY "Patients: View own risk_interventions"
  ON risk_interventions FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM risk_intervention_plans rip
      WHERE rip.id = risk_interventions.plan_id
      AND rip.patient_id = auth.user_patient_id()
    )
  );

-- ====================================
-- Family Portal - Patient Policies
-- ====================================

CREATE POLICY "Patients: View own family_members"
  ON family_members FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    patient_id = auth.user_patient_id()
  );

CREATE POLICY "Patients: View own family_portal_access_log"
  ON family_portal_access_log FOR SELECT
  TO authenticated
  USING (
    auth.is_patient() AND 
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.id = family_portal_access_log.family_member_id
      AND fm.patient_id = auth.user_patient_id()
    )
  );


