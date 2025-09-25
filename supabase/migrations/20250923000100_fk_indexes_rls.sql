-- Migration: Add missing FK indexes and minimal RLS policies (idempotent)
-- Date: 2025-09-23

-- =============================
-- 1) Indexes for Foreign Keys
-- =============================
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON public.appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled_by ON public.appointments(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON public.appointments(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_data_requests_patient_id ON public.data_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_processed_by ON public.data_requests(processed_by);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_id ON public.exercise_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_prescription_item_id ON public.exercise_logs(prescription_item_id);

CREATE INDEX IF NOT EXISTS idx_exercise_prescription_items_exercise_id ON public.exercise_prescription_items(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescription_items_prescription_id ON public.exercise_prescription_items(prescription_id);

CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient_id ON public.exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_therapist_id ON public.exercise_prescriptions(therapist_id);

CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment_id ON public.financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_invoice_id ON public.financial_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_insurance_claim_id ON public.financial_transactions(insurance_claim_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_by ON public.financial_transactions(created_by);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_insurance_provider_id ON public.insurance_claims(insurance_provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient_id ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submitted_by ON public.insurance_claims(submitted_by);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_appointment_id ON public.invoice_items(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_session_id ON public.invoice_items(session_id);

CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);

CREATE INDEX IF NOT EXISTS idx_messages_from_id ON public.messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON public.messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id ON public.messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON public.messages(parent_message_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON public.notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON public.notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_invoice_id ON public.notifications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON public.notifications(created_by);

CREATE INDEX IF NOT EXISTS idx_pain_point_history_pain_point_id ON public.pain_point_history(pain_point_id);
CREATE INDEX IF NOT EXISTS idx_pain_point_history_session_id ON public.pain_point_history(session_id);
CREATE INDEX IF NOT EXISTS idx_pain_point_history_recorded_by ON public.pain_point_history(recorded_by);

CREATE INDEX IF NOT EXISTS idx_pain_points_patient_id ON public.pain_points(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_points_created_by ON public.pain_points(created_by);

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient_id ON public.patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_recorded_by ON public.patient_consents(recorded_by);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);

CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_payment_plan_id ON public.payment_plan_installments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_transaction_id ON public.payment_plan_installments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_plans_patient_id ON public.payment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_invoice_id ON public.payment_plans(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_approved_by ON public.payment_plans(approved_by);

CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON public.sessions(created_by);

-- =====================================
-- 2) Minimal RLS policies for SELECT
--    Creates a permissive read policy for role authenticated
-- =====================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'data_requests',
    'exercise_logs',
    'exercise_prescription_items',
    'exercise_prescriptions',
    'insurance_claims',
    'insurance_providers',
    'invoice_items',
    'pain_point_history',
    'pain_points',
    'patient_consents',
    'payment_plan_installments',
    'payment_plans'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND policyname = 'authenticated_can_read'
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true);', 'authenticated_can_read', t);
    END IF;
  END LOOP;
END$$;




