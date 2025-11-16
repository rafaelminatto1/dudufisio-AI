-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR POLICIES
-- =============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
        AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is therapist
CREATE OR REPLACE FUNCTION is_therapist()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'therapist'
        AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is receptionist
CREATE OR REPLACE FUNCTION is_receptionist()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'receptionist'
        AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is patient
CREATE OR REPLACE FUNCTION is_patient()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'patient'
        AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is staff (admin, therapist, or receptionist)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'therapist', 'receptionist')
        AND active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get patient ID for current user if they are a patient
CREATE OR REPLACE FUNCTION get_patient_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT p.id 
        FROM public.patients p
        JOIN public.users u ON p.user_id = u.id
        WHERE u.id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users: Read access
CREATE POLICY users_select_policy ON public.users
    FOR SELECT
    USING (
        is_admin() OR
        id = auth.uid() OR
        (is_staff() AND active = true)
    );

-- Users: Insert (admin only)
CREATE POLICY users_insert_policy ON public.users
    FOR INSERT
    WITH CHECK (is_admin());

-- Users: Update
CREATE POLICY users_update_policy ON public.users
    FOR UPDATE
    USING (
        is_admin() OR
        (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid()))
    )
    WITH CHECK (
        is_admin() OR
        (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid()))
    );

-- Users: Delete (admin only)
CREATE POLICY users_delete_policy ON public.users
    FOR DELETE
    USING (is_admin());

-- =============================================
-- PATIENTS TABLE POLICIES
-- =============================================

-- Patients: Read access
CREATE POLICY patients_select_policy ON public.patients
    FOR SELECT
    USING (
        is_staff() OR
        user_id = auth.uid() OR
        id = get_patient_id()
    );

-- Patients: Insert
CREATE POLICY patients_insert_policy ON public.patients
    FOR INSERT
    WITH CHECK (is_staff());

-- Patients: Update
CREATE POLICY patients_update_policy ON public.patients
    FOR UPDATE
    USING (
        is_admin() OR
        is_therapist() OR
        is_receptionist() OR
        (user_id = auth.uid() AND id = get_patient_id())
    )
    WITH CHECK (
        is_admin() OR
        is_therapist() OR
        is_receptionist() OR
        (user_id = auth.uid() AND id = get_patient_id())
    );

-- Patients: Delete (admin only)
CREATE POLICY patients_delete_policy ON public.patients
    FOR DELETE
    USING (is_admin());

-- =============================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================

-- Appointments: Read access
CREATE POLICY appointments_select_policy ON public.appointments
    FOR SELECT
    USING (
        is_staff() OR
        patient_id = get_patient_id() OR
        therapist_id = auth.uid()
    );

-- Appointments: Insert
CREATE POLICY appointments_insert_policy ON public.appointments
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist() OR
        (is_therapist() AND therapist_id = auth.uid())
    );

-- Appointments: Update
CREATE POLICY appointments_update_policy ON public.appointments
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist() OR
        therapist_id = auth.uid() OR
        (patient_id = get_patient_id() AND status = 'scheduled')
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist() OR
        therapist_id = auth.uid() OR
        (patient_id = get_patient_id() AND status IN ('scheduled', 'cancelled'))
    );

-- Appointments: Delete (admin only)
CREATE POLICY appointments_delete_policy ON public.appointments
    FOR DELETE
    USING (is_admin());

-- =============================================
-- SESSIONS TABLE POLICIES
-- =============================================

-- Sessions: Read access
CREATE POLICY sessions_select_policy ON public.sessions
    FOR SELECT
    USING (
        is_admin() OR
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = sessions.appointment_id
            AND (
                a.therapist_id = auth.uid() OR
                a.patient_id = get_patient_id()
            )
        )
    );

-- Sessions: Insert
CREATE POLICY sessions_insert_policy ON public.sessions
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_therapist() AND EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = appointment_id
            AND a.therapist_id = auth.uid()
        ))
    );

-- Sessions: Update
CREATE POLICY sessions_update_policy ON public.sessions
    FOR UPDATE
    USING (
        is_admin() OR
        (is_therapist() AND EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = sessions.appointment_id
            AND a.therapist_id = auth.uid()
        ))
    )
    WITH CHECK (
        is_admin() OR
        (is_therapist() AND EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = appointment_id
            AND a.therapist_id = auth.uid()
        ))
    );

-- Sessions: Delete (admin only)
CREATE POLICY sessions_delete_policy ON public.sessions
    FOR DELETE
    USING (is_admin());

-- =============================================
-- PAIN POINTS TABLE POLICIES
-- =============================================

-- Pain points: Read access
CREATE POLICY pain_points_select_policy ON public.pain_points
    FOR SELECT
    USING (
        is_staff() OR
        patient_id = get_patient_id()
    );

-- Pain points: Insert
CREATE POLICY pain_points_insert_policy ON public.pain_points
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_therapist() OR
        patient_id = get_patient_id()
    );

-- Pain points: Update
CREATE POLICY pain_points_update_policy ON public.pain_points
    FOR UPDATE
    USING (
        is_admin() OR
        is_therapist() OR
        patient_id = get_patient_id()
    )
    WITH CHECK (
        is_admin() OR
        is_therapist() OR
        patient_id = get_patient_id()
    );

-- Pain points: Delete
CREATE POLICY pain_points_delete_policy ON public.pain_points
    FOR DELETE
    USING (
        is_admin() OR
        is_therapist()
    );

-- =============================================
-- PAIN POINT HISTORY TABLE POLICIES
-- =============================================

-- Pain point history: Read access
CREATE POLICY pain_point_history_select_policy ON public.pain_point_history
    FOR SELECT
    USING (
        is_staff() OR
        EXISTS (
            SELECT 1 FROM public.pain_points pp
            WHERE pp.id = pain_point_history.pain_point_id
            AND pp.patient_id = get_patient_id()
        )
    );

-- Pain point history: Insert
CREATE POLICY pain_point_history_insert_policy ON public.pain_point_history
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_therapist()
    );

-- Pain point history: No update allowed (historical data)
-- Pain point history: No delete allowed (historical data)

-- =============================================
-- EXERCISES TABLE POLICIES
-- =============================================

-- Exercises: Read access (all authenticated users)
CREATE POLICY exercises_select_policy ON public.exercises
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        active = true
    );

-- Exercises: Insert (therapists and admin)
CREATE POLICY exercises_insert_policy ON public.exercises
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_therapist()
    );

-- Exercises: Update
CREATE POLICY exercises_update_policy ON public.exercises
    FOR UPDATE
    USING (
        is_admin() OR
        (is_therapist() AND created_by = auth.uid())
    )
    WITH CHECK (
        is_admin() OR
        (is_therapist() AND created_by = auth.uid())
    );

-- Exercises: Delete (admin only)
CREATE POLICY exercises_delete_policy ON public.exercises
    FOR DELETE
    USING (is_admin());

-- =============================================
-- EXERCISE PRESCRIPTIONS TABLE POLICIES
-- =============================================

-- Exercise prescriptions: Read access
CREATE POLICY exercise_prescriptions_select_policy ON public.exercise_prescriptions
    FOR SELECT
    USING (
        is_admin() OR
        therapist_id = auth.uid() OR
        patient_id = get_patient_id()
    );

-- Exercise prescriptions: Insert
CREATE POLICY exercise_prescriptions_insert_policy ON public.exercise_prescriptions
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        (is_therapist() AND therapist_id = auth.uid())
    );

-- Exercise prescriptions: Update
CREATE POLICY exercise_prescriptions_update_policy ON public.exercise_prescriptions
    FOR UPDATE
    USING (
        is_admin() OR
        therapist_id = auth.uid()
    )
    WITH CHECK (
        is_admin() OR
        therapist_id = auth.uid()
    );

-- Exercise prescriptions: Delete
CREATE POLICY exercise_prescriptions_delete_policy ON public.exercise_prescriptions
    FOR DELETE
    USING (
        is_admin() OR
        therapist_id = auth.uid()
    );

-- =============================================
-- EXERCISE PRESCRIPTION ITEMS TABLE POLICIES
-- =============================================

-- Exercise prescription items: Read access
CREATE POLICY exercise_prescription_items_select_policy ON public.exercise_prescription_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.exercise_prescriptions ep
            WHERE ep.id = exercise_prescription_items.prescription_id
            AND (
                is_admin() OR
                ep.therapist_id = auth.uid() OR
                ep.patient_id = get_patient_id()
            )
        )
    );

-- Exercise prescription items: Insert
CREATE POLICY exercise_prescription_items_insert_policy ON public.exercise_prescription_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exercise_prescriptions ep
            WHERE ep.id = prescription_id
            AND (
                is_admin() OR
                ep.therapist_id = auth.uid()
            )
        )
    );

-- Exercise prescription items: Update
CREATE POLICY exercise_prescription_items_update_policy ON public.exercise_prescription_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.exercise_prescriptions ep
            WHERE ep.id = exercise_prescription_items.prescription_id
            AND (
                is_admin() OR
                ep.therapist_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exercise_prescriptions ep
            WHERE ep.id = prescription_id
            AND (
                is_admin() OR
                ep.therapist_id = auth.uid()
            )
        )
    );

-- Exercise prescription items: Delete
CREATE POLICY exercise_prescription_items_delete_policy ON public.exercise_prescription_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.exercise_prescriptions ep
            WHERE ep.id = exercise_prescription_items.prescription_id
            AND (
                is_admin() OR
                ep.therapist_id = auth.uid()
            )
        )
    );

-- =============================================
-- EXERCISE LOGS TABLE POLICIES
-- =============================================

-- Exercise logs: Read access
CREATE POLICY exercise_logs_select_policy ON public.exercise_logs
    FOR SELECT
    USING (
        is_staff() OR
        patient_id = get_patient_id()
    );

-- Exercise logs: Insert
CREATE POLICY exercise_logs_insert_policy ON public.exercise_logs
    FOR INSERT
    WITH CHECK (
        is_staff() OR
        patient_id = get_patient_id()
    );

-- Exercise logs: Update (only by patient who created it)
CREATE POLICY exercise_logs_update_policy ON public.exercise_logs
    FOR UPDATE
    USING (
        patient_id = get_patient_id() AND
        created_at > NOW() - INTERVAL '24 hours'
    )
    WITH CHECK (
        patient_id = get_patient_id()
    );

-- Exercise logs: No delete allowed (historical data)

-- =============================================
-- FINANCIAL TRANSACTIONS TABLE POLICIES
-- =============================================

-- Financial transactions: Read access
CREATE POLICY financial_transactions_select_policy ON public.financial_transactions
    FOR SELECT
    USING (
        is_admin() OR
        is_receptionist() OR
        (is_therapist() AND EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = financial_transactions.appointment_id
            AND a.therapist_id = auth.uid()
        )) OR
        patient_id = get_patient_id()
    );

-- Financial transactions: Insert
CREATE POLICY financial_transactions_insert_policy ON public.financial_transactions
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Financial transactions: Update
CREATE POLICY financial_transactions_update_policy ON public.financial_transactions
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Financial transactions: Delete (admin only)
CREATE POLICY financial_transactions_delete_policy ON public.financial_transactions
    FOR DELETE
    USING (is_admin());

-- =============================================
-- INVOICES TABLE POLICIES
-- =============================================

-- Invoices: Read access
CREATE POLICY invoices_select_policy ON public.invoices
    FOR SELECT
    USING (
        is_admin() OR
        is_receptionist() OR
        patient_id = get_patient_id()
    );

-- Invoices: Insert
CREATE POLICY invoices_insert_policy ON public.invoices
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Invoices: Update
CREATE POLICY invoices_update_policy ON public.invoices
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Invoices: Delete (admin only)
CREATE POLICY invoices_delete_policy ON public.invoices
    FOR DELETE
    USING (is_admin());

-- =============================================
-- INVOICE ITEMS TABLE POLICIES
-- =============================================

-- Invoice items: Read access
CREATE POLICY invoice_items_select_policy ON public.invoice_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices i
            WHERE i.id = invoice_items.invoice_id
            AND (
                is_admin() OR
                is_receptionist() OR
                i.patient_id = get_patient_id()
            )
        )
    );

-- Invoice items: Insert
CREATE POLICY invoice_items_insert_policy ON public.invoice_items
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Invoice items: Update
CREATE POLICY invoice_items_update_policy ON public.invoice_items
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Invoice items: Delete
CREATE POLICY invoice_items_delete_policy ON public.invoice_items
    FOR DELETE
    USING (
        is_admin() OR
        is_receptionist()
    );

-- =============================================
-- INSURANCE PROVIDERS TABLE POLICIES
-- =============================================

-- Insurance providers: Read access (all staff)
CREATE POLICY insurance_providers_select_policy ON public.insurance_providers
    FOR SELECT
    USING (is_staff());

-- Insurance providers: Insert (admin only)
CREATE POLICY insurance_providers_insert_policy ON public.insurance_providers
    FOR INSERT
    WITH CHECK (is_admin());

-- Insurance providers: Update (admin only)
CREATE POLICY insurance_providers_update_policy ON public.insurance_providers
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Insurance providers: Delete (admin only)
CREATE POLICY insurance_providers_delete_policy ON public.insurance_providers
    FOR DELETE
    USING (is_admin());

-- =============================================
-- INSURANCE CLAIMS TABLE POLICIES
-- =============================================

-- Insurance claims: Read access
CREATE POLICY insurance_claims_select_policy ON public.insurance_claims
    FOR SELECT
    USING (
        is_admin() OR
        is_receptionist() OR
        patient_id = get_patient_id()
    );

-- Insurance claims: Insert
CREATE POLICY insurance_claims_insert_policy ON public.insurance_claims
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Insurance claims: Update
CREATE POLICY insurance_claims_update_policy ON public.insurance_claims
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Insurance claims: Delete (admin only)
CREATE POLICY insurance_claims_delete_policy ON public.insurance_claims
    FOR DELETE
    USING (is_admin());

-- =============================================
-- PAYMENT PLANS TABLE POLICIES
-- =============================================

-- Payment plans: Read access
CREATE POLICY payment_plans_select_policy ON public.payment_plans
    FOR SELECT
    USING (
        is_admin() OR
        is_receptionist() OR
        patient_id = get_patient_id()
    );

-- Payment plans: Insert
CREATE POLICY payment_plans_insert_policy ON public.payment_plans
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Payment plans: Update
CREATE POLICY payment_plans_update_policy ON public.payment_plans
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Payment plans: Delete (admin only)
CREATE POLICY payment_plans_delete_policy ON public.payment_plans
    FOR DELETE
    USING (is_admin());

-- =============================================
-- PAYMENT PLAN INSTALLMENTS TABLE POLICIES
-- =============================================

-- Payment plan installments: Read access
CREATE POLICY payment_plan_installments_select_policy ON public.payment_plan_installments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.payment_plans pp
            WHERE pp.id = payment_plan_installments.payment_plan_id
            AND (
                is_admin() OR
                is_receptionist() OR
                pp.patient_id = get_patient_id()
            )
        )
    );

-- Payment plan installments: Insert
CREATE POLICY payment_plan_installments_insert_policy ON public.payment_plan_installments
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Payment plan installments: Update
CREATE POLICY payment_plan_installments_update_policy ON public.payment_plan_installments
    FOR UPDATE
    USING (
        is_admin() OR
        is_receptionist()
    )
    WITH CHECK (
        is_admin() OR
        is_receptionist()
    );

-- Payment plan installments: Delete
CREATE POLICY payment_plan_installments_delete_policy ON public.payment_plan_installments
    FOR DELETE
    USING (
        is_admin() OR
        is_receptionist()
    );

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

-- Messages: Read access
CREATE POLICY messages_select_policy ON public.messages
    FOR SELECT
    USING (
        from_id = auth.uid() OR
        to_id = auth.uid()
    );

-- Messages: Insert
CREATE POLICY messages_insert_policy ON public.messages
    FOR INSERT
    WITH CHECK (
        from_id = auth.uid()
    );

-- Messages: Update (only status updates)
CREATE POLICY messages_update_policy ON public.messages
    FOR UPDATE
    USING (
        to_id = auth.uid()
    )
    WITH CHECK (
        to_id = auth.uid()
    );

-- Messages: No delete allowed

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Notifications: Read access
CREATE POLICY notifications_select_policy ON public.notifications
    FOR SELECT
    USING (
        is_staff() OR
        user_id = auth.uid() OR
        patient_id = get_patient_id()
    );

-- Notifications: Insert
CREATE POLICY notifications_insert_policy ON public.notifications
    FOR INSERT
    WITH CHECK (is_staff());

-- Notifications: Update
CREATE POLICY notifications_update_policy ON public.notifications
    FOR UPDATE
    USING (
        is_staff() OR
        (user_id = auth.uid() AND read = false)
    )
    WITH CHECK (
        is_staff() OR
        user_id = auth.uid()
    );

-- Notifications: Delete
CREATE POLICY notifications_delete_policy ON public.notifications
    FOR DELETE
    USING (
        is_admin() OR
        user_id = auth.uid()
    );

-- =============================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================

-- Audit logs: Read access (admin only)
CREATE POLICY audit_logs_select_policy ON public.audit_logs
    FOR SELECT
    USING (is_admin());

-- Audit logs: Insert (system only - via functions)
CREATE POLICY audit_logs_insert_policy ON public.audit_logs
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Audit logs: No update allowed
-- Audit logs: No delete allowed

-- =============================================
-- PATIENT CONSENTS TABLE POLICIES
-- =============================================

-- Patient consents: Read access
CREATE POLICY patient_consents_select_policy ON public.patient_consents
    FOR SELECT
    USING (
        is_staff() OR
        patient_id = get_patient_id()
    );

-- Patient consents: Insert
CREATE POLICY patient_consents_insert_policy ON public.patient_consents
    FOR INSERT
    WITH CHECK (
        is_staff() OR
        patient_id = get_patient_id()
    );

-- Patient consents: Update
CREATE POLICY patient_consents_update_policy ON public.patient_consents
    FOR UPDATE
    USING (
        is_admin() OR
        patient_id = get_patient_id()
    )
    WITH CHECK (
        is_admin() OR
        patient_id = get_patient_id()
    );

-- Patient consents: No delete allowed (legal requirement)

-- =============================================
-- DATA REQUESTS TABLE POLICIES
-- =============================================

-- Data requests: Read access
CREATE POLICY data_requests_select_policy ON public.data_requests
    FOR SELECT
    USING (
        is_admin() OR
        patient_id = get_patient_id()
    );

-- Data requests: Insert
CREATE POLICY data_requests_insert_policy ON public.data_requests
    FOR INSERT
    WITH CHECK (
        is_admin() OR
        patient_id = get_patient_id()
    );

-- Data requests: Update (admin only)
CREATE POLICY data_requests_update_policy ON public.data_requests
    FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

-- Data requests: No delete allowed (legal requirement)