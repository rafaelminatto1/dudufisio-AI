-- =====================================================
-- Migration: Create Appointments Table
-- Description: Tabela para gerenciar agendamentos de consultas
-- Author: Claude
-- Date: 2025-01-29
-- =====================================================

-- Drop existing table if exists
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table
CREATE TABLE appointments (
  -- === Primary Key ===
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- === Foreign Keys ===
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- === Patient Info (cached for performance) ===
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_email TEXT,
  patient_avatar_url TEXT,

  -- === Therapist Info (cached) ===
  therapist_name TEXT,

  -- === Appointment Details ===
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL DEFAULT 'Sessão',

  -- === Date & Time ===
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,

  -- === Status ===
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),

  -- === Location ===
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT,

  -- === Clinical Info ===
  chief_complaint TEXT,
  notes TEXT,
  private_notes TEXT, -- Notas privadas só para o terapeuta

  -- === Recurrence ===
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- {frequency: 'weekly', interval: 1, endDate: '2025-12-31'}
  parent_appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,

  -- === Cancellation ===
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- === Confirmation ===
  confirmed_at TIMESTAMPTZ,
  confirmation_method TEXT, -- 'phone', 'whatsapp', 'email', 'manual'

  -- === Check-in/Check-out ===
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,

  -- === Payment ===
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'cancelled')),
  payment_amount DECIMAL(10,2),
  payment_method TEXT,

  -- === Metadata ===
  tags TEXT[], -- ['primeira_consulta', 'urgente', 'retorno']
  color TEXT, -- Cor para exibição no calendário
  priority INTEGER DEFAULT 1, -- 1-5 (1=baixa, 5=urgente)

  -- === Timestamps ===
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- === Constraints ===
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 5)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Index for querying by patient
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);

-- Index for querying by therapist
CREATE INDEX idx_appointments_therapist_id ON appointments(therapist_id);

-- Index for querying by date range (most common query)
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_end_time ON appointments(end_time);

-- Composite index for date range + status
CREATE INDEX idx_appointments_time_status ON appointments(start_time, status);

-- Index for status queries
CREATE INDEX idx_appointments_status ON appointments(status);

-- Index for recurring appointments
CREATE INDEX idx_appointments_parent ON appointments(parent_appointment_id)
  WHERE parent_appointment_id IS NOT NULL;

-- Index for virtual appointments
CREATE INDEX idx_appointments_virtual ON appointments(is_virtual)
  WHERE is_virtual = true;

-- Full text search on notes
CREATE INDEX idx_appointments_notes_fts ON appointments
  USING gin(to_tsvector('portuguese', COALESCE(notes, '') || ' ' || COALESCE(description, '')));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY appointments_admin_all ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Therapists can view their own appointments
CREATE POLICY appointments_therapist_read ON appointments
  FOR SELECT
  TO authenticated
  USING (
    therapist_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('mentor', 'intern')
    )
  );

-- Policy: Therapists can create appointments
CREATE POLICY appointments_therapist_create ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'mentor', 'intern')
    )
  );

-- Policy: Therapists can update their own appointments
CREATE POLICY appointments_therapist_update ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    therapist_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    therapist_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete appointments
CREATE POLICY appointments_admin_delete ON appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE appointments IS 'Tabela de agendamentos de consultas fisioterapêuticas';
COMMENT ON COLUMN appointments.patient_id IS 'FK para patients - paciente do agendamento';
COMMENT ON COLUMN appointments.therapist_id IS 'FK para users - fisioterapeuta responsável';
COMMENT ON COLUMN appointments.status IS 'Status do agendamento: scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled';
COMMENT ON COLUMN appointments.is_recurring IS 'Indica se é um agendamento recorrente';
COMMENT ON COLUMN appointments.recurrence_pattern IS 'Padrão de recorrência em JSON';
COMMENT ON COLUMN appointments.parent_appointment_id IS 'FK para o agendamento pai (caso seja recorrência)';
COMMENT ON COLUMN appointments.payment_status IS 'Status do pagamento';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;
GRANT DELETE ON appointments TO authenticated; -- Controlled by RLS

-- Grant usage on sequence (for id generation)
GRANT USAGE ON SEQUENCE appointments_id_seq TO authenticated;
