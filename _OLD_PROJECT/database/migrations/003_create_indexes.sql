-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- =============================================
-- USERS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(active);

-- =============================================
-- PATIENTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);

-- Full text search index for patient names
CREATE INDEX IF NOT EXISTS idx_patients_full_name_trgm ON public.patients 
    USING gin(full_name gin_trgm_ops);

-- =============================================
-- APPOINTMENTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON public.appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_room ON public.appointments(room) WHERE room IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date ON public.appointments(therapist_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON public.appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(appointment_date, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON public.appointments(appointment_date, status) 
    WHERE status IN ('scheduled', 'confirmed');

-- Index for conflict checking
CREATE INDEX IF NOT EXISTS idx_appointments_conflict_check ON public.appointments(
    therapist_id, 
    appointment_date, 
    start_time, 
    end_time
) WHERE status NOT IN ('cancelled', 'no_show');

-- =============================================
-- SESSIONS TABLE INDEXES
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_appointment_id ON public.sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);

-- =============================================
-- PAIN POINTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pain_points_patient_id ON public.pain_points(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_points_body_region ON public.pain_points(body_region);
CREATE INDEX IF NOT EXISTS idx_pain_points_status ON public.pain_points(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pain_points_start_date ON public.pain_points(start_date);
CREATE INDEX IF NOT EXISTS idx_pain_points_patient_active ON public.pain_points(patient_id) 
    WHERE status = 'active' AND end_date IS NULL;

-- =============================================
-- PAIN POINT HISTORY TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pain_point_history_pain_point_id ON public.pain_point_history(pain_point_id);
CREATE INDEX IF NOT EXISTS idx_pain_point_history_session_id ON public.pain_point_history(session_id);
CREATE INDEX IF NOT EXISTS idx_pain_point_history_recorded_at ON public.pain_point_history(recorded_at DESC);

-- =============================================
-- EXERCISES TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_exercises_name ON public.exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON public.exercises(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);

-- Full text search for exercise names and descriptions
CREATE INDEX IF NOT EXISTS idx_exercises_search ON public.exercises 
    USING gin(to_tsvector('portuguese', name || ' ' || description));

-- GIN index for array columns
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON public.exercises USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_exercises_target_muscles ON public.exercises USING gin(target_muscles);

-- =============================================
-- EXERCISE PRESCRIPTIONS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient_id ON public.exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_therapist_id ON public.exercise_prescriptions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_status ON public.exercise_prescriptions(status) 
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_dates ON public.exercise_prescriptions(start_date, end_date);

-- =============================================
-- EXERCISE PRESCRIPTION ITEMS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_exercise_prescription_items_prescription_id ON public.exercise_prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescription_items_exercise_id ON public.exercise_prescription_items(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescription_items_order ON public.exercise_prescription_items(prescription_id, order_index);

-- =============================================
-- EXERCISE LOGS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_exercise_logs_prescription_item_id ON public.exercise_logs(prescription_item_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_id ON public.exercise_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_date ON public.exercise_logs(date_performed DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_date ON public.exercise_logs(patient_id, date_performed DESC);

-- =============================================
-- FINANCIAL TRANSACTIONS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment_id ON public.financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_invoice_id ON public.financial_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_payment_date ON public.financial_transactions(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference ON public.financial_transactions(reference_number) 
    WHERE reference_number IS NOT NULL;

-- =============================================
-- INVOICES TABLE INDEXES
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid ON public.invoices(patient_id, due_date) 
    WHERE status IN ('sent', 'partially_paid', 'overdue');

-- =============================================
-- INVOICE ITEMS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_appointment_id ON public.invoice_items(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_session_id ON public.invoice_items(session_id);

-- =============================================
-- INSURANCE PROVIDERS TABLE INDEXES
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_insurance_providers_code ON public.insurance_providers(code);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_name ON public.insurance_providers(name);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON public.insurance_providers(active) WHERE active = true;

-- =============================================
-- INSURANCE CLAIMS TABLE INDEXES
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_insurance_claims_number ON public.insurance_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient_id ON public.insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_provider_id ON public.insurance_claims(insurance_provider_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_service_date ON public.insurance_claims(service_date);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submission_date ON public.insurance_claims(submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_pending ON public.insurance_claims(insurance_provider_id, status) 
    WHERE status IN ('submitted', 'in_review');

-- =============================================
-- PAYMENT PLANS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_payment_plans_patient_id ON public.payment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_invoice_id ON public.payment_plans(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON public.payment_plans(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payment_plans_start_date ON public.payment_plans(start_date);

-- =============================================
-- PAYMENT PLAN INSTALLMENTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_plan_id ON public.payment_plan_installments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_due_date ON public.payment_plan_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_status ON public.payment_plan_installments(status);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_pending ON public.payment_plan_installments(payment_plan_id, due_date) 
    WHERE status = 'pending';

-- =============================================
-- MESSAGES TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_messages_from_id ON public.messages(from_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_id ON public.messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id ON public.messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(to_id, status) WHERE status != 'read';

-- =============================================
-- NOTIFICATIONS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON public.notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for) 
    WHERE status = 'pending' AND scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

-- =============================================
-- AUDIT LOGS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================
-- PATIENT CONSENTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_patient_consents_patient_id ON public.patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_consent_date ON public.patient_consents(consent_date DESC);

-- =============================================
-- DATA REQUESTS TABLE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_data_requests_patient_id ON public.data_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON public.data_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_data_requests_requested_at ON public.data_requests(requested_at DESC);

-- =============================================
-- ENABLE TRIGRAM EXTENSION FOR FUZZY SEARCH
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- STATISTICS FOR QUERY OPTIMIZATION
-- =============================================

-- Update statistics for frequently queried columns
ALTER TABLE public.appointments ALTER COLUMN appointment_date SET STATISTICS 1000;
ALTER TABLE public.appointments ALTER COLUMN therapist_id SET STATISTICS 1000;
ALTER TABLE public.appointments ALTER COLUMN patient_id SET STATISTICS 1000;
ALTER TABLE public.appointments ALTER COLUMN status SET STATISTICS 500;

ALTER TABLE public.patients ALTER COLUMN status SET STATISTICS 500;
ALTER TABLE public.patients ALTER COLUMN created_at SET STATISTICS 500;

ALTER TABLE public.financial_transactions ALTER COLUMN patient_id SET STATISTICS 1000;
ALTER TABLE public.financial_transactions ALTER COLUMN status SET STATISTICS 500;

-- =============================================
-- ANALYZE TABLES TO UPDATE STATISTICS
-- =============================================
ANALYZE public.users;
ANALYZE public.patients;
ANALYZE public.appointments;
ANALYZE public.sessions;
ANALYZE public.pain_points;
ANALYZE public.pain_point_history;
ANALYZE public.exercises;
ANALYZE public.exercise_prescriptions;
ANALYZE public.exercise_prescription_items;
ANALYZE public.exercise_logs;
ANALYZE public.financial_transactions;
ANALYZE public.invoices;
ANALYZE public.invoice_items;
ANALYZE public.insurance_providers;
ANALYZE public.insurance_claims;
ANALYZE public.payment_plans;
ANALYZE public.payment_plan_installments;
ANALYZE public.messages;
ANALYZE public.notifications;
ANALYZE public.audit_logs;
ANALYZE public.patient_consents;
ANALYZE public.data_requests;