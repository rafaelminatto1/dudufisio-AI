-- =============================================
-- MIGRATION 002: APPOINTMENTS SYSTEM
-- appointments, schedule_blocks, waitlist
-- =============================================

-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  
  -- Scheduling
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  
  -- Status
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'falta')),
  
  -- Type and Details
  appointment_type TEXT DEFAULT 'consulta' CHECK (appointment_type IN ('consulta', 'retorno', 'avaliacao', 'sessao')),
  service_type TEXT,
  notes TEXT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- {frequency: 'daily'|'weekly'|'monthly', interval: 1, days: [0,1,2], end_date: '2024-12-31'}
  recurrence_group_id UUID, -- Same ID for all appointments in recurrence
  
  -- Confirmation and Reminders
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by TEXT, -- 'patient', 'staff', 'auto'
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Check-in/Check-out
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  
  -- Pricing
  price DECIMAL(10, 2),
  paid BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SCHEDULE BLOCKS TABLE (Bloqueios de Agenda)
-- =============================================
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Type and Details
  block_type TEXT NOT NULL CHECK (block_type IN ('ferias', 'almoco', 'intervalo', 'reuniao', 'treinamento', 'outros')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  
  -- Applies to all therapists if null
  is_global BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WAITLIST TABLE (Lista de Espera)
-- =============================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(id),
  
  -- Preferred Times
  preferred_dates DATE[] DEFAULT '{}',
  preferred_times JSONB, -- {morning: true, afternoon: true, evening: false}
  preferred_days INTEGER[] DEFAULT '{}', -- 0=Sunday, 1=Monday, etc.
  
  -- Priority
  priority INTEGER DEFAULT 0, -- Higher = more urgent
  reason TEXT,
  
  -- Status
  status TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'contatado', 'agendado', 'cancelado')),
  
  -- Notifications
  notified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- APPOINTMENT CONFLICTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.appointment_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('bloqueio_agenda', 'paciente_sobreposto', 'terapeuta_multiplo', 'intervalo_minimo', 'carga_horaria')),
  conflict_details JSONB,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_therapist_id ON public.appointments(therapist_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_end_time ON public.appointments(end_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_recurrence_group ON public.appointments(recurrence_group_id);
CREATE INDEX idx_appointments_date ON public.appointments(DATE(start_time));

CREATE INDEX idx_schedule_blocks_therapist_id ON public.schedule_blocks(therapist_id);
CREATE INDEX idx_schedule_blocks_start_time ON public.schedule_blocks(start_time);
CREATE INDEX idx_schedule_blocks_end_time ON public.schedule_blocks(end_time);
CREATE INDEX idx_schedule_blocks_is_global ON public.schedule_blocks(is_global);

CREATE INDEX idx_waitlist_patient_id ON public.waitlist(patient_id);
CREATE INDEX idx_waitlist_therapist_id ON public.waitlist(therapist_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_priority ON public.waitlist(priority DESC);

CREATE INDEX idx_appointment_conflicts_appointment_id ON public.appointment_conflicts(appointment_id);
CREATE INDEX idx_appointment_conflicts_resolved ON public.appointment_conflicts(resolved);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_conflicts ENABLE ROW LEVEL SECURITY;

-- APPOINTMENTS POLICIES
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Staff can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Staff can update appointments"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Patients can cancel own appointments"
  ON public.appointments FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (status = 'cancelado');

-- SCHEDULE BLOCKS POLICIES
CREATE POLICY "Staff can view schedule blocks"
  ON public.schedule_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Therapists can manage own blocks"
  ON public.schedule_blocks FOR ALL
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all blocks"
  ON public.schedule_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- WAITLIST POLICIES
CREATE POLICY "Patients can view own waitlist"
  ON public.waitlist FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all waitlist"
  ON public.waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Staff can manage waitlist"
  ON public.waitlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

-- CONFLICTS POLICIES
CREATE POLICY "Staff can view conflicts"
  ON public.appointment_conflicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_blocks_updated_at
  BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_found BOOLEAN := false;
BEGIN
  -- Check for schedule blocks
  IF EXISTS (
    SELECT 1 FROM public.schedule_blocks
    WHERE (therapist_id = NEW.therapist_id OR is_global = true)
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
  ) THEN
    INSERT INTO public.appointment_conflicts (appointment_id, conflict_type, severity)
    VALUES (NEW.id, 'bloqueio_agenda', 'error');
    conflict_found := true;
  END IF;
  
  -- Check for patient overlap
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE patient_id = NEW.patient_id
    AND id != NEW.id
    AND status NOT IN ('cancelado', 'falta')
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
  ) THEN
    INSERT INTO public.appointment_conflicts (appointment_id, conflict_type, severity)
    VALUES (NEW.id, 'paciente_sobreposto', 'error');
    conflict_found := true;
  END IF;
  
  -- Check for therapist overlap
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE therapist_id = NEW.therapist_id
    AND id != NEW.id
    AND status NOT IN ('cancelado', 'falta')
    AND (
      (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    )
  ) THEN
    INSERT INTO public.appointment_conflicts (appointment_id, conflict_type, severity)
    VALUES (NEW.id, 'terapeuta_multiplo', 'error');
    conflict_found := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_conflicts_on_insert
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION check_appointment_conflicts();

CREATE TRIGGER check_conflicts_on_update
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  WHEN (OLD.start_time IS DISTINCT FROM NEW.start_time OR OLD.end_time IS DISTINCT FROM NEW.end_time)
  EXECUTE FUNCTION check_appointment_conflicts();

