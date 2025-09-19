-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'receptionist', 'patient')),
    specialization TEXT,
    professional_id TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PATIENT MANAGEMENT
-- =============================================

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Personal information
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    
    -- Address
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT CHECK (LENGTH(address_state) = 2),
    address_zip_code TEXT,
    
    -- Emergency contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Medical information
    medical_history TEXT[],
    allergies TEXT[],
    medications TEXT[],
    blood_type TEXT,
    
    -- Insurance
    insurance_provider TEXT,
    insurance_plan TEXT,
    insurance_number TEXT,
    insurance_validity DATE,
    
    -- Additional info
    occupation TEXT,
    referred_by TEXT,
    observations TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- APPOINTMENTS
-- =============================================

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Related entities
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.users(id),
    
    -- Appointment details
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('evaluation', 'session', 'return', 'group')),
    
    -- Location
    room TEXT,
    is_online BOOLEAN DEFAULT false,
    online_link TEXT,
    
    -- Status and notes
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    chief_complaint TEXT,
    notes TEXT,
    
    -- Cancellation info
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.users(id),
    
    -- Financial
    price DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT false,
    insurance_authorization TEXT,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- SESSIONS
-- =============================================

-- Sessions table (treatment sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    
    -- Session data
    procedures_performed TEXT,
    pain_level_before INTEGER CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
    pain_level_after INTEGER CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
    
    -- Clinical notes
    objective_assessment TEXT,
    treatment_performed TEXT,
    patient_response TEXT,
    progress_notes TEXT,
    
    -- Plan
    next_session_notes TEXT,
    exercises_prescribed TEXT,
    homework TEXT,
    
    -- Measurements
    range_of_motion JSONB,
    strength_tests JSONB,
    functional_tests JSONB,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- =============================================
-- PAIN POINTS AND BODY MAP
-- =============================================

-- Pain points table
CREATE TABLE IF NOT EXISTS public.pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    -- Location
    body_region TEXT NOT NULL,
    coordinates_x INTEGER,
    coordinates_y INTEGER,
    side TEXT CHECK (side IN ('left', 'right', 'center', 'bilateral')),
    
    -- Pain characteristics
    pain_intensity INTEGER NOT NULL CHECK (pain_intensity >= 0 AND pain_intensity <= 10),
    pain_type TEXT[],
    pain_characteristics TEXT[],
    
    -- Description
    description TEXT NOT NULL,
    triggers TEXT[],
    relief_methods TEXT[],
    
    -- Frequency and duration
    frequency TEXT CHECK (frequency IN ('constant', 'frequent', 'occasional', 'rare')),
    duration TEXT,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'improving', 'stable', 'worsening', 'resolved')),
    
    -- Additional info
    notes TEXT,
    related_diagnosis TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Pain point history (for tracking evolution)
CREATE TABLE IF NOT EXISTS public.pain_point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pain_point_id UUID NOT NULL REFERENCES public.pain_points(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    
    -- Recorded values
    pain_intensity INTEGER NOT NULL CHECK (pain_intensity >= 0 AND pain_intensity <= 10),
    status TEXT CHECK (status IN ('active', 'improving', 'stable', 'worsening', 'resolved')),
    notes TEXT,
    
    -- System fields
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES public.users(id)
);

-- =============================================
-- EXERCISES
-- =============================================

-- Exercise library
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    
    -- Media
    video_url TEXT,
    image_urls TEXT[],
    
    -- Instructions
    instructions TEXT NOT NULL,
    contraindications TEXT,
    equipment_needed TEXT[],
    
    -- Default parameters
    default_sets INTEGER DEFAULT 3,
    default_repetitions INTEGER,
    default_duration_seconds INTEGER,
    default_rest_seconds INTEGER DEFAULT 30,
    
    -- Metadata
    tags TEXT[],
    target_muscles TEXT[],
    benefits TEXT[],
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2)
);

-- Exercise prescriptions
CREATE TABLE IF NOT EXISTS public.exercise_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.users(id),
    
    -- Prescription details
    name TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    frequency_per_week INTEGER,
    general_notes TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise prescription items
CREATE TABLE IF NOT EXISTS public.exercise_prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES public.exercise_prescriptions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id),
    
    -- Custom parameters
    sets INTEGER NOT NULL,
    repetitions INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    specific_notes TEXT,
    
    -- Ordering
    order_index INTEGER NOT NULL,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise logs (patient tracking)
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_item_id UUID NOT NULL REFERENCES public.exercise_prescription_items(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    -- Execution data
    date_performed DATE NOT NULL,
    sets_completed INTEGER,
    repetitions_completed INTEGER,
    duration_completed_seconds INTEGER,
    
    -- Feedback
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    pain_during_exercise INTEGER CHECK (pain_during_exercise >= 0 AND pain_during_exercise <= 10),
    notes TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FINANCIAL
-- =============================================

-- Financial transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment', 'insurance_claim', 'insurance_payment')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    description TEXT NOT NULL,
    
    -- Related entities
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES public.appointments(id),
    invoice_id UUID REFERENCES public.invoices(id),
    insurance_claim_id UUID REFERENCES public.insurance_claims(id),
    
    -- Payment details
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check', 'insurance', 'voucher')),
    payment_date DATE,
    due_date DATE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Reference numbers
    reference_number TEXT,
    receipt_number TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Metadata
    notes TEXT,
    metadata JSONB
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Invoice details
    invoice_number TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    
    -- Payment terms
    payment_terms TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ
);

-- Invoice items
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    
    -- Item details
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    -- Related entities
    appointment_id UUID REFERENCES public.appointments(id),
    session_id UUID REFERENCES public.sessions(id),
    
    -- Tax and discount
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(10,2),
    discount_rate DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    
    -- Metadata
    service_code TEXT,
    notes TEXT
);

-- Insurance providers
CREATE TABLE IF NOT EXISTS public.insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Provider details
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    tax_id TEXT NOT NULL,
    
    -- Contact information
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    
    -- Address
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT CHECK (LENGTH(address_state) = 2),
    address_zip_code TEXT,
    
    -- Contract details
    contract_number TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    
    -- Payment terms
    payment_terms_days INTEGER DEFAULT 30,
    reimbursement_percentage DECIMAL(5,2),
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance claims
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Claim details
    claim_number TEXT UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    insurance_provider_id UUID NOT NULL REFERENCES public.insurance_providers(id),
    insurance_plan_id UUID,
    
    -- Dates
    service_date DATE NOT NULL,
    submission_date DATE,
    approval_date DATE,
    payment_date DATE,
    
    -- Amounts
    claimed_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    patient_copay DECIMAL(10,2),
    deductible DECIMAL(10,2),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'partially_approved', 'denied', 'paid')),
    
    -- Related entities
    appointment_ids UUID[],
    session_ids UUID[],
    
    -- Documents
    authorization_number TEXT,
    denial_reason TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_by UUID REFERENCES public.users(id),
    
    -- Metadata
    notes TEXT,
    attachments TEXT[]
);

-- Payment plans
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan details
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id),
    
    -- Plan terms
    total_amount DECIMAL(10,2) NOT NULL,
    down_payment DECIMAL(10,2) DEFAULT 0,
    number_of_installments INTEGER NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    
    -- Schedule
    start_date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
    
    -- Progress
    paid_installments INTEGER DEFAULT 0,
    remaining_installments INTEGER GENERATED ALWAYS AS (number_of_installments - paid_installments) STORED,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES public.users(id)
);

-- Payment plan installments
CREATE TABLE IF NOT EXISTS public.payment_plan_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_plan_id UUID NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
    
    -- Installment details
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Payment information
    paid_date DATE,
    paid_amount DECIMAL(10,2),
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check', 'voucher')),
    transaction_id UUID REFERENCES public.financial_transactions(id),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMUNICATION
-- =============================================

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Message details
    from_id UUID NOT NULL REFERENCES public.users(id),
    to_id UUID NOT NULL REFERENCES public.users(id),
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Type and status
    message_type TEXT CHECK (message_type IN ('patient_to_therapist', 'therapist_to_patient', 'internal', 'system')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    
    -- Timestamps
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- Related entities
    patient_id UUID REFERENCES public.patients(id),
    appointment_id UUID REFERENCES public.appointments(id),
    
    -- System fields
    parent_message_id UUID REFERENCES public.messages(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Notification details
    user_id UUID REFERENCES public.users(id),
    patient_id UUID REFERENCES public.patients(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Type and channel
    notification_type TEXT NOT NULL CHECK (notification_type IN ('appointment_reminder', 'appointment_confirmation', 'appointment_cancellation', 'exercise_reminder', 'payment_reminder', 'system', 'marketing')),
    channel TEXT CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    read BOOLEAN DEFAULT false,
    
    -- Related entities
    appointment_id UUID REFERENCES public.appointments(id),
    invoice_id UUID REFERENCES public.invoices(id),
    
    -- Timestamps
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Metadata
    metadata JSONB
);

-- =============================================
-- AUDIT AND COMPLIANCE
-- =============================================

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action details
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient consents (LGPD compliance)
CREATE TABLE IF NOT EXISTS public.patient_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    -- Consent types
    treatment_consent BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    image_use_consent BOOLEAN DEFAULT false,
    
    -- Consent details
    consent_date TIMESTAMPTZ,
    consent_method TEXT CHECK (consent_method IN ('written', 'digital', 'verbal')),
    consent_document_url TEXT,
    
    -- Withdrawal
    withdrawal_date TIMESTAMPTZ,
    withdrawal_reason TEXT,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES public.users(id)
);

-- Data export requests (LGPD compliance)
CREATE TABLE IF NOT EXISTS public.data_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    
    -- Request details
    request_type TEXT NOT NULL CHECK (request_type IN ('data_export', 'data_deletion', 'data_correction')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    
    -- Processing
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.users(id),
    
    -- Response
    response_url TEXT,
    response_notes TEXT,
    rejection_reason TEXT
);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables with updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ language 'plpgsql';

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    last_number INTEGER;
    new_number TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0)
    INTO last_number
    FROM invoices
    WHERE invoice_number LIKE year_month || '%';
    
    new_number := year_month || LPAD((last_number + 1)::TEXT, 5, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_therapist_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_room TEXT DEFAULT NULL,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(conflicting_appointment_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id
    FROM appointments a
    WHERE a.therapist_id = p_therapist_id
    AND a.appointment_date = p_date
    AND a.status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_id IS NULL OR a.id != p_exclude_id)
    AND (
        (a.start_time < p_end_time AND a.end_time > p_start_time)
    )
    
    UNION
    
    -- Check room conflicts if room is specified
    SELECT a.id
    FROM appointments a
    WHERE p_room IS NOT NULL
    AND a.room = p_room
    AND a.appointment_date = p_date
    AND a.status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_id IS NULL OR a.id != p_exclude_id)
    AND (
        (a.start_time < p_end_time AND a.end_time > p_start_time)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate patient age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN DATE_PART('year', AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.paid_amount >= NEW.total_amount THEN
        NEW.status := 'paid';
        NEW.paid_at := NOW();
    ELSIF NEW.paid_amount > 0 THEN
        NEW.status := 'partially_paid';
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('paid', 'cancelled') THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_trigger
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status();

-- Function to update payment plan status
CREATE OR REPLACE FUNCTION update_payment_plan_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.paid_installments >= NEW.number_of_installments THEN
        NEW.status := 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_plan_status_trigger
BEFORE UPDATE ON payment_plans
FOR EACH ROW
EXECUTE FUNCTION update_payment_plan_status();