-- =============================================
-- ENABLE ROW LEVEL SECURITY
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
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
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

-- Function to check if user is therapist
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

-- Function to check if user is receptionist
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

-- Function to check if user is patient
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

-- Function to check if user is staff (admin, therapist, or receptionist)
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

-- Function to get user's patient_id
CREATE OR REPLACE FUNCTION get_user_patient_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.patients
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = auth.uid());

-- Staff can view all users
CREATE POLICY "Staff can view all users" ON public.users
    FOR SELECT USING (is_staff());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Admin can update any user
CREATE POLICY "Admin can update any user" ON public.users
    FOR UPDATE USING (is_admin());

-- Admin can insert new users
CREATE POLICY "Admin can insert users" ON public.users
    FOR INSERT WITH CHECK (is_admin());

-- =============================================
-- PATIENTS TABLE POLICIES
-- =============================================

-- Staff can view all patients
CREATE POLICY "Staff can view all patients" ON public.patients
    FOR SELECT USING (is_staff());

-- Patients can view their own record
CREATE POLICY "Patients can view own record" ON public.patients
    FOR SELECT USING (user_id = auth.uid());

-- Staff can create patients
CREATE POLICY "Staff can create patients" ON public.patients
    FOR INSERT WITH CHECK (is_staff());

-- Staff can update patients
CREATE POLICY "Staff can update patients" ON public.patients
    FOR UPDATE USING (is_staff());

-- Patients can update some of their own info
CREATE POLICY "Patients can update own basic info" ON public.patients
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (
        -- Patients can only update certain fields
        user_id = auth.uid()
    );

-- =============================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================

-- Staff can view all appointments
CREATE POLICY "Staff can view all appointments" ON public.appointments
    FOR SELECT USING (is_staff());

-- Therapists can view their own appointments
CREATE POLICY "Therapists can view own appointments" ON public.appointments
    FOR SELECT USING (therapist_id = auth.uid());

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Staff can create appointments
CREATE POLICY "Staff can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (is_staff());

-- Staff can update appointments
CREATE POLICY "Staff can update appointments" ON public.appointments
    FOR UPDATE USING (is_staff());

-- Therapists can update their own appointments
CREATE POLICY "Therapists can update own appointments" ON public.appointments
    FOR UPDATE USING (therapist_id = auth.uid());

-- =============================================
-- SESSIONS TABLE POLICIES
-- =============================================

-- Staff can view all sessions
CREATE POLICY "Staff can view all sessions" ON public.sessions
    FOR SELECT USING (is_staff());

-- Therapists can view sessions for their appointments
CREATE POLICY "Therapists can view own sessions" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = sessions.appointment_id
            AND appointments.therapist_id = auth.uid()
        )
    );

-- Patients can view their own sessions
CREATE POLICY "Patients can view own sessions" ON public.sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = sessions.appointment_id
            AND appointments.patient_id = get_user_patient_id()
        )
    );

-- Staff can create sessions
CREATE POLICY "Staff can create sessions" ON public.sessions
    FOR INSERT WITH CHECK (is_staff());

-- Therapists can create sessions for their appointments
CREATE POLICY "Therapists can create own sessions" ON public.sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = appointment_id
            AND appointments.therapist_id = auth.uid()
        )
    );

-- Staff can update sessions
CREATE POLICY "Staff can update sessions" ON public.sessions
    FOR UPDATE USING (is_staff());

-- Therapists can update their own sessions
CREATE POLICY "Therapists can update own sessions" ON public.sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.appointments
            WHERE appointments.id = sessions.appointment_id
            AND appointments.therapist_id = auth.uid()
        )
    );

-- =============================================
-- PAIN POINTS TABLE POLICIES
-- =============================================

-- Staff can view all pain points
CREATE POLICY "Staff can view all pain points" ON public.pain_points
    FOR SELECT USING (is_staff());

-- Patients can view their own pain points
CREATE POLICY "Patients can view own pain points" ON public.pain_points
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Staff can create pain points
CREATE POLICY "Staff can create pain points" ON public.pain_points
    FOR INSERT WITH CHECK (is_staff());

-- Staff can update pain points
CREATE POLICY "Staff can update pain points" ON public.pain_points
    FOR UPDATE USING (is_staff());

-- =============================================
-- EXERCISES TABLE POLICIES
-- =============================================

-- Everyone can view active exercises
CREATE POLICY "Everyone can view active exercises" ON public.exercises
    FOR SELECT USING (active = true);

-- Staff can view all exercises
CREATE POLICY "Staff can view all exercises" ON public.exercises
    FOR SELECT USING (is_staff());

-- Therapists can create exercises
CREATE POLICY "Therapists can create exercises" ON public.exercises
    FOR INSERT WITH CHECK (is_therapist() OR is_admin());

-- Therapists can update their own exercises
CREATE POLICY "Therapists can update own exercises" ON public.exercises
    FOR UPDATE USING (created_by = auth.uid() OR is_admin());

-- =============================================
-- EXERCISE PRESCRIPTIONS TABLE POLICIES
-- =============================================

-- Staff can view all prescriptions
CREATE POLICY "Staff can view all prescriptions" ON public.exercise_prescriptions
    FOR SELECT USING (is_staff());

-- Therapists can view their own prescriptions
CREATE POLICY "Therapists can view own prescriptions" ON public.exercise_prescriptions
    FOR SELECT USING (therapist_id = auth.uid());

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.exercise_prescriptions
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Therapists can create prescriptions
CREATE POLICY "Therapists can create prescriptions" ON public.exercise_prescriptions
    FOR INSERT WITH CHECK (is_therapist() OR is_admin());

-- Therapists can update their own prescriptions
CREATE POLICY "Therapists can update own prescriptions" ON public.exercise_prescriptions
    FOR UPDATE USING (therapist_id = auth.uid() OR is_admin());

-- =============================================
-- EXERCISE LOGS TABLE POLICIES
-- =============================================

-- Staff can view all exercise logs
CREATE POLICY "Staff can view all exercise logs" ON public.exercise_logs
    FOR SELECT USING (is_staff());

-- Patients can view their own logs
CREATE POLICY "Patients can view own exercise logs" ON public.exercise_logs
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Patients can create their own logs
CREATE POLICY "Patients can create own exercise logs" ON public.exercise_logs
    FOR INSERT WITH CHECK (patient_id = get_user_patient_id());

-- Patients can update their own logs
CREATE POLICY "Patients can update own exercise logs" ON public.exercise_logs
    FOR UPDATE USING (patient_id = get_user_patient_id());

-- =============================================
-- FINANCIAL TRANSACTIONS TABLE POLICIES
-- =============================================

-- Admin and receptionist can view all transactions
CREATE POLICY "Admin and receptionist can view all transactions" ON public.financial_transactions
    FOR SELECT USING (is_admin() OR is_receptionist());

-- Patients can view their own transactions
CREATE POLICY "Patients can view own transactions" ON public.financial_transactions
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Admin and receptionist can create transactions
CREATE POLICY "Admin and receptionist can create transactions" ON public.financial_transactions
    FOR INSERT WITH CHECK (is_admin() OR is_receptionist());

-- Admin and receptionist can update transactions
CREATE POLICY "Admin and receptionist can update transactions" ON public.financial_transactions
    FOR UPDATE USING (is_admin() OR is_receptionist());

-- =============================================
-- INVOICES TABLE POLICIES
-- =============================================

-- Admin and receptionist can view all invoices
CREATE POLICY "Admin and receptionist can view all invoices" ON public.invoices
    FOR SELECT USING (is_admin() OR is_receptionist());

-- Patients can view their own invoices
CREATE POLICY "Patients can view own invoices" ON public.invoices
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Admin and receptionist can create invoices
CREATE POLICY "Admin and receptionist can create invoices" ON public.invoices
    FOR INSERT WITH CHECK (is_admin() OR is_receptionist());

-- Admin and receptionist can update invoices
CREATE POLICY "Admin and receptionist can update invoices" ON public.invoices
    FOR UPDATE USING (is_admin() OR is_receptionist());

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (from_id = auth.uid() OR to_id = auth.uid());

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (from_id = auth.uid());

-- Users can update their own sent messages
CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING (from_id = auth.uid());

-- =============================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Patients can view their notifications
CREATE POLICY "Patients can view own patient notifications" ON public.notifications
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Staff can create notifications
CREATE POLICY "Staff can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (is_staff());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid() OR patient_id = get_user_patient_id());

-- =============================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================

-- Only admin can view audit logs
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
    FOR SELECT USING (is_admin());

-- System can insert audit logs (through functions)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- PATIENT CONSENTS TABLE POLICIES
-- =============================================

-- Staff can view all consents
CREATE POLICY "Staff can view all consents" ON public.patient_consents
    FOR SELECT USING (is_staff());

-- Patients can view their own consents
CREATE POLICY "Patients can view own consents" ON public.patient_consents
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Staff can create consents
CREATE POLICY "Staff can create consents" ON public.patient_consents
    FOR INSERT WITH CHECK (is_staff());

-- Staff can update consents
CREATE POLICY "Staff can update consents" ON public.patient_consents
    FOR UPDATE USING (is_staff());

-- =============================================
-- DATA REQUESTS TABLE POLICIES
-- =============================================

-- Admin can view all data requests
CREATE POLICY "Admin can view all data requests" ON public.data_requests
    FOR SELECT USING (is_admin());

-- Patients can view their own data requests
CREATE POLICY "Patients can view own data requests" ON public.data_requests
    FOR SELECT USING (patient_id = get_user_patient_id());

-- Patients can create their own data requests
CREATE POLICY "Patients can create own data requests" ON public.data_requests
    FOR INSERT WITH CHECK (patient_id = get_user_patient_id());

-- Admin can update data requests
CREATE POLICY "Admin can update data requests" ON public.data_requests
    FOR UPDATE USING (is_admin());
