-- Appointments and Treatments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE RESTRICT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou')),
  type TEXT NOT NULL CHECK (type IN ('avaliacao', 'sessao', 'reavaliacao', 'retorno')),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  parent_appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (scheduled_end > scheduled_start)
);

CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE RESTRICT,
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT,
  goals TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'concluido', 'cancelado')),
  total_sessions_planned INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.treatment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  techniques_used TEXT[] DEFAULT '{}',
  equipment_used TEXT[] DEFAULT '{}',
  exercises_prescribed JSONB DEFAULT '[]',
  progress_notes TEXT,
  pain_level_before INTEGER CHECK (pain_level_before BETWEEN 0 AND 10),
  pain_level_after INTEGER CHECK (pain_level_after BETWEEN 0 AND 10),
  therapist_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_therapist ON public.appointments(therapist_id);
CREATE INDEX idx_appointments_date ON public.appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_treatments_patient ON public.treatments(patient_id);
CREATE INDEX idx_treatment_sessions_treatment ON public.treatment_sessions(treatment_id);

-- RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage appointments" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista'))
);

CREATE POLICY "Staff can manage treatments" ON public.treatments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta'))
);

-- Triggers
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_sessions_updated_at BEFORE UPDATE ON public.treatment_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

