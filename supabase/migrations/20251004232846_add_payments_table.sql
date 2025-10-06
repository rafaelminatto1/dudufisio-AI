-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method VARCHAR(50) NOT NULL,
    payment_method_details JSONB DEFAULT '{}',
    gateway_transaction_id VARCHAR(255),
    gateway_provider VARCHAR(50) DEFAULT 'manual' NOT NULL CHECK (gateway_provider IN ('stripe', 'mercadopago', 'pagseguro', 'pix', 'manual')),
    description TEXT,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    processing_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);

-- Create RLS policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy for therapists to view payments for their patients
CREATE POLICY "Therapists can view payments for their patients" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = payments.appointment_id
            AND a.therapist_id = auth.uid()
        )
    );

-- Policy for patients to view their own payments
CREATE POLICY "Patients can view their own payments" ON public.payments
    FOR SELECT USING (patient_id = auth.uid());

-- Policy for admins to manage all payments
CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Policy for therapists to create payments for their patients
CREATE POLICY "Therapists can create payments for their patients" ON public.payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = payments.appointment_id
            AND a.therapist_id = auth.uid()
        )
    );

-- Policy for therapists to update payments for their patients
CREATE POLICY "Therapists can update payments for their patients" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = payments.appointment_id
            AND a.therapist_id = auth.uid()
        )
    );

-- Create financial_transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'refund')),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference payments, appointments, etc.
    reference_type VARCHAR(50), -- 'payment', 'appointment', 'refund', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_clinic_id ON public.financial_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON public.financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_at ON public.financial_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference ON public.financial_transactions(reference_id, reference_type);

-- Create RLS policies for financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage all financial transactions
CREATE POLICY "Admins can manage all financial transactions" ON public.financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Create sessions table (for teleconsulta)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'teleconsulta' NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes TEXT,
    recording_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_appointment_id ON public.sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON public.sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON public.sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON public.sessions(start_time);

-- Create RLS policies for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policy for therapists to manage their sessions
CREATE POLICY "Therapists can manage their sessions" ON public.sessions
    FOR ALL USING (therapist_id = auth.uid());

-- Policy for patients to view their sessions
CREATE POLICY "Patients can view their sessions" ON public.sessions
    FOR SELECT USING (patient_id = auth.uid());

-- Policy for admins to manage all sessions
CREATE POLICY "Admins can manage all sessions" ON public.sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Add missing columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'consultation',
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for new appointment columns
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_type ON public.appointments(appointment_type);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON public.appointments(end_time);

-- Update the updated_at column trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
