-- =============================================
-- MIGRATION 003: TREATMENTS SYSTEM
-- treatments, sessions, SOAP, surgeries, pathologies, goals, tests
-- =============================================

-- =============================================
-- TREATMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id),
  
  -- Details
  diagnosis TEXT NOT NULL,
  treatment_plan TEXT,
  objectives TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'cancelado')),
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE,
  estimated_sessions INTEGER,
  completed_sessions INTEGER DEFAULT 0,
  
  -- Pricing
  package_id UUID REFERENCES public.patient_packages(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SESSION EVOLUTIONS TABLE (SOAP)
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id),
  
  -- Session Details
  session_number INTEGER,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER DEFAULT 60,
  
  -- SOAP (4 colunas principais)
  subjective TEXT, -- S: O que o paciente relata
  objective TEXT,  -- O: O que o terapeuta observa
  assessment TEXT, -- A: Avaliação e raciocínio clínico
  plan TEXT,       -- P: Plano de tratamento
  
  -- Condutas Estruturadas
  conducts JSONB DEFAULT '[]', -- Array de condutas aplicadas
  exercises_prescribed JSONB DEFAULT '[]', -- Exercícios prescritos
  
  -- Clinical Measurements
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10), -- EVA 0-10
  range_of_motion JSONB, -- {joint: 'shoulder', left: 120, right: 150}
  muscle_strength JSONB, -- Força muscular por grupo
  functional_tests JSONB, -- Testes funcionais realizados
  
  -- Progress Photos
  photo_urls TEXT[] DEFAULT '{}',
  
  -- Next Session
  next_session_plan TEXT,
  homework TEXT, -- Exercícios para casa
  
  -- Auto-save tracking
  auto_saved_at TIMESTAMP WITH TIME ZONE,
  
  -- Replication
  replicated_from UUID REFERENCES public.session_evolutions(id),
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SURGERIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.surgeries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Surgery Details
  surgery_name TEXT NOT NULL,
  surgery_type TEXT,
  body_part TEXT,
  surgeon_name TEXT,
  hospital TEXT,
  
  -- Timeline
  surgery_date DATE NOT NULL,
  
  -- Post-Op Phase
  current_phase TEXT DEFAULT 'fase_1' CHECK (current_phase IN ('fase_1', 'fase_2', 'fase_3', 'fase_4')),
  phase_start_date DATE,
  
  -- Details
  complications TEXT,
  notes TEXT,
  
  -- Documents
  document_urls TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATHOLOGIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.pathologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Pathology Details
  name TEXT NOT NULL,
  icd_code TEXT, -- CID-10
  diagnosis_date DATE,
  
  -- Status
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'controlada', 'resolvida', 'cronica')),
  severity TEXT CHECK (severity IN ('leve', 'moderada', 'grave')),
  
  -- Treatment
  treatment_required BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Mandatory Tests
  mandatory_tests TEXT[] DEFAULT '{}',
  test_frequency TEXT, -- 'semanal', 'quinzenal', 'mensal'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES public.treatments(id),
  
  -- Goal Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('funcional', 'dor', 'mobilidade', 'forca', 'outros')),
  
  -- Progress
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT, -- 'graus', 'kg', 'cm', 'escala_dor', etc.
  
  -- Timeline
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  achieved_date DATE,
  
  -- Status
  status TEXT DEFAULT 'em_progresso' CHECK (status IN ('em_progresso', 'alcancado', 'abandonado', 'pausado')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Countdown
  days_remaining INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN target_date IS NOT NULL THEN 
        EXTRACT(DAY FROM target_date - CURRENT_DATE)::INTEGER
      ELSE NULL
    END
  ) STORED,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TEST RESULTS TABLE (Evolução de Testes)
-- =============================================
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_evolution_id UUID REFERENCES public.session_evolutions(id),
  pathology_id UUID REFERENCES public.pathologies(id),
  
  -- Test Details
  test_name TEXT NOT NULL,
  test_type TEXT,
  
  -- Results
  result_value NUMERIC,
  result_unit TEXT,
  result_category TEXT, -- 'normal', 'alterado', 'crítico'
  
  -- Details
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  performed_by UUID REFERENCES public.therapists(id),
  notes TEXT,
  
  -- Comparison
  previous_result NUMERIC,
  change_percentage NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONDUCT TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conduct_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES public.therapists(id),
  
  -- Template Details
  name TEXT NOT NULL,
  category TEXT,
  conducts JSONB NOT NULL, -- Estrutura de condutas
  
  -- Usage
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_treatments_patient_id ON public.treatments(patient_id);
CREATE INDEX idx_treatments_therapist_id ON public.treatments(therapist_id);
CREATE INDEX idx_treatments_status ON public.treatments(status);
CREATE INDEX idx_treatments_start_date ON public.treatments(start_date);

CREATE INDEX idx_session_evolutions_treatment_id ON public.session_evolutions(treatment_id);
CREATE INDEX idx_session_evolutions_patient_id ON public.session_evolutions(patient_id);
CREATE INDEX idx_session_evolutions_therapist_id ON public.session_evolutions(therapist_id);
CREATE INDEX idx_session_evolutions_session_date ON public.session_evolutions(session_date DESC);
CREATE INDEX idx_session_evolutions_appointment_id ON public.session_evolutions(appointment_id);

CREATE INDEX idx_surgeries_patient_id ON public.surgeries(patient_id);
CREATE INDEX idx_surgeries_surgery_date ON public.surgeries(surgery_date DESC);

CREATE INDEX idx_pathologies_patient_id ON public.pathologies(patient_id);
CREATE INDEX idx_pathologies_status ON public.pathologies(status);

CREATE INDEX idx_patient_goals_patient_id ON public.patient_goals(patient_id);
CREATE INDEX idx_patient_goals_treatment_id ON public.patient_goals(treatment_id);
CREATE INDEX idx_patient_goals_status ON public.patient_goals(status);
CREATE INDEX idx_patient_goals_target_date ON public.patient_goals(target_date);

CREATE INDEX idx_test_results_patient_id ON public.test_results(patient_id);
CREATE INDEX idx_test_results_pathology_id ON public.test_results(pathology_id);
CREATE INDEX idx_test_results_test_date ON public.test_results(test_date DESC);

CREATE INDEX idx_conduct_templates_therapist_id ON public.conduct_templates(therapist_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pathologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conduct_templates ENABLE ROW LEVEL SECURITY;

-- TREATMENTS POLICIES
CREATE POLICY "Patients can view own treatments"
  ON public.treatments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all treatments"
  ON public.treatments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

CREATE POLICY "Therapists can manage treatments"
  ON public.treatments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- SESSION EVOLUTIONS POLICIES
CREATE POLICY "Patients can view own evolutions"
  ON public.session_evolutions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all evolutions"
  ON public.session_evolutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

CREATE POLICY "Therapists can manage evolutions"
  ON public.session_evolutions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- SURGERIES POLICIES
CREATE POLICY "Patients can view own surgeries"
  ON public.surgeries FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage surgeries"
  ON public.surgeries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- PATHOLOGIES POLICIES
CREATE POLICY "Patients can view own pathologies"
  ON public.pathologies FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage pathologies"
  ON public.pathologies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- PATIENT GOALS POLICIES
CREATE POLICY "Patients can view own goals"
  ON public.patient_goals FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage goals"
  ON public.patient_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- TEST RESULTS POLICIES
CREATE POLICY "Patients can view own test results"
  ON public.test_results FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage test results"
  ON public.test_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- CONDUCT TEMPLATES POLICIES
CREATE POLICY "Therapists can view own templates"
  ON public.conduct_templates FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Therapists can manage own templates"
  ON public.conduct_templates FOR ALL
  USING (
    therapist_id IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_evolutions_updated_at
  BEFORE UPDATE ON public.session_evolutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surgeries_updated_at
  BEFORE UPDATE ON public.surgeries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pathologies_updated_at
  BEFORE UPDATE ON public.pathologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_goals_updated_at
  BEFORE UPDATE ON public.patient_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON public.test_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conduct_templates_updated_at
  BEFORE UPDATE ON public.conduct_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update treatment completed_sessions
CREATE OR REPLACE FUNCTION update_treatment_completed_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.treatments
  SET completed_sessions = (
    SELECT COUNT(*)
    FROM public.session_evolutions
    WHERE treatment_id = NEW.treatment_id
  )
  WHERE id = NEW.treatment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_completed_sessions_on_insert
  AFTER INSERT ON public.session_evolutions
  FOR EACH ROW EXECUTE FUNCTION update_treatment_completed_sessions();

-- Function to update patient's last_visit_date and total_sessions
CREATE OR REPLACE FUNCTION update_patient_visit_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.patients
  SET 
    last_visit_date = NEW.session_date,
    total_sessions = total_sessions + 1
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_stats_on_session
  AFTER INSERT ON public.session_evolutions
  FOR EACH ROW EXECUTE FUNCTION update_patient_visit_stats();

