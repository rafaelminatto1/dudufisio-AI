-- =====================================================
-- MIGRATION: 002 - Core Tables (Patients, Appointments, Therapists)
-- Description: Create and enhance core business tables
-- Created: 2025-01-17
-- =====================================================

-- =====================================================
-- 1. THERAPISTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS therapists (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to User
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Professional Information
  license_number TEXT UNIQUE NOT NULL,
  license_type TEXT, -- CREFITO, CRM, etc
  specialties TEXT[],
  bio TEXT,

  -- Availability
  working_hours JSONB DEFAULT '{
    "monday": {"start": "08:00", "end": "18:00"},
    "tuesday": {"start": "08:00", "end": "18:00"},
    "wednesday": {"start": "08:00", "end": "18:00"},
    "thursday": {"start": "08:00", "end": "18:00"},
    "friday": {"start": "08:00", "end": "18:00"}
  }'::jsonb,
  is_accepting_patients BOOLEAN DEFAULT TRUE,

  -- Settings
  appointment_duration INTEGER DEFAULT 60, -- minutes
  color_code TEXT DEFAULT '#3b82f6', -- for calendar

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_therapists_user_id ON therapists(user_id);
CREATE INDEX idx_therapists_license ON therapists(license_number);
CREATE INDEX idx_therapists_specialties ON therapists USING GIN(specialties);

-- RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view own profile"
  ON therapists FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins can manage therapists"
  ON therapists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. PATIENTS TABLE (Enhanced)
-- =====================================================

DROP TABLE IF EXISTS patients CASCADE;

CREATE TABLE patients (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to User (optional - some patients may not have login)
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT UNIQUE,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

  -- Address
  address JSONB DEFAULT '{}'::jsonb, -- street, number, complement, neighborhood, city, state, zipcode

  -- Medical Information
  blood_type TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],
  emergency_contact JSONB, -- name, phone, relationship

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  assigned_therapist_id UUID REFERENCES therapists(id),

  -- Financial
  health_insurance TEXT,
  insurance_number TEXT,
  payment_method TEXT,

  -- Marketing
  how_found_us TEXT,
  referral_source TEXT,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_email ON patients(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_cpf ON patients(cpf) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX idx_patients_tags ON patients USING GIN(tags);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);

-- RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Therapists can view assigned patients"
  ON patients FOR SELECT
  USING (
    assigned_therapist_id IN (
      SELECT id FROM therapists
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Staff can manage patients"
  ON patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'manager', 'therapist', 'receptionist')
      AND is_active = TRUE
    )
  );

-- =====================================================
-- 3. APPOINTMENTS TABLE (Enhanced)
-- =====================================================

DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE appointments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,

  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutes

  -- Type and Status
  type TEXT DEFAULT 'regular' CHECK (type IN (
    'regular', 'first_consultation', 'followup', 'evaluation',
    'teleconsultation', 'group', 'emergency'
  )),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed',
    'cancelled', 'no_show', 'rescheduled'
  )),

  -- Details
  title TEXT,
  description TEXT,
  notes TEXT, -- private notes for therapist
  patient_notes TEXT, -- visible to patient

  -- Teleconsultation
  is_virtual BOOLEAN DEFAULT FALSE,
  meeting_url TEXT,
  meeting_id TEXT,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB, -- rrule format
  parent_appointment_id UUID REFERENCES appointments(id),

  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Financial
  price DECIMAL(10, 2),
  paid BOOLEAN DEFAULT FALSE,
  payment_id UUID,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,

  -- Check-in
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration > 0 AND duration <= 480)
);

-- Indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_end_time ON appointments(end_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_type ON appointments(type);
CREATE INDEX idx_appointments_date ON appointments(DATE(start_time));
CREATE INDEX idx_appointments_therapist_date ON appointments(therapist_id, DATE(start_time));

-- Composite index for conflict detection
CREATE INDEX idx_appointments_conflict ON appointments(
  therapist_id,
  start_time,
  end_time
) WHERE status NOT IN ('cancelled', 'no_show') AND deleted_at IS NULL;

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Therapists can view own appointments"
  ON appointments FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM therapists WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'manager', 'therapist', 'receptionist')
      AND is_active = TRUE
    )
  );

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function: Check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_therapist_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE therapist_id = p_therapist_id
    AND status NOT IN ('cancelled', 'no_show')
    AND deleted_at IS NULL
    AND id != COALESCE(p_appointment_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Get therapist availability for date
CREATE OR REPLACE FUNCTION get_therapist_availability(
  p_therapist_id UUID,
  p_date DATE
)
RETURNS TABLE(
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  is_available BOOLEAN
) AS $$
BEGIN
  -- This is a simplified version
  -- In production, this would generate time slots based on working_hours
  -- and check against existing appointments
  RETURN QUERY
  SELECT
    generate_series(
      p_date::TIMESTAMPTZ + '08:00'::TIME,
      p_date::TIMESTAMPTZ + '18:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_start,
    generate_series(
      p_date::TIMESTAMPTZ + '09:00'::TIME,
      p_date::TIMESTAMPTZ + '19:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_end,
    NOT check_appointment_conflict(
      p_therapist_id,
      generate_series(
        p_date::TIMESTAMPTZ + '08:00'::TIME,
        p_date::TIMESTAMPTZ + '18:00'::TIME,
        '1 hour'::INTERVAL
      ),
      generate_series(
        p_date::TIMESTAMPTZ + '09:00'::TIME,
        p_date::TIMESTAMPTZ + '19:00'::TIME,
        '1 hour'::INTERVAL
      )
    ) AS is_available;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update patient last activity
CREATE OR REPLACE FUNCTION update_patient_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE patients
  SET updated_at = NOW()
  WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on therapists
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on patients
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update patient activity when appointment is created/updated
CREATE TRIGGER update_patient_on_appointment
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_activity();

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE therapists IS 'Therapists/Physiotherapists information and availability';
COMMENT ON TABLE patients IS 'Patients with comprehensive medical and contact information';
COMMENT ON TABLE appointments IS 'Appointments/sessions with full scheduling and tracking';
