-- =============================================
-- MIGRATION 007: PATIENT PORTAL
-- portal access, exercises, documents, feedback
-- =============================================

-- =============================================
-- EXERCISES LIBRARY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercises_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Exercise Details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('mobilidade', 'forca', 'alongamento', 'equilibrio', 'respiracao', 'cardio', 'funcional')),
  difficulty TEXT DEFAULT 'iniciante' CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
  
  -- Body Parts
  body_parts TEXT[] DEFAULT '{}', -- ['ombro', 'joelho', 'coluna', etc]
  pathologies TEXT[] DEFAULT '{}', -- Associated pathologies
  
  -- Instructions
  instructions TEXT NOT NULL,
  repetitions TEXT, -- '3x10', '2x15', etc
  duration TEXT, -- '30 segundos', '2 minutos', etc
  frequency TEXT, -- 'diário', '3x/semana', etc
  
  -- Media
  video_url TEXT,
  thumbnail_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  
  -- Precautions
  contraindications TEXT[] DEFAULT '{}',
  precautions TEXT,
  
  -- Tags and Search
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  
  -- Creator
  created_by UUID REFERENCES public.therapists(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRESCRIBED EXERCISES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.prescribed_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises_library(id),
  treatment_id UUID REFERENCES public.treatments(id),
  prescribed_by UUID NOT NULL REFERENCES public.therapists(id),
  
  -- Prescription Details
  instructions TEXT,
  repetitions TEXT,
  sets INTEGER,
  duration_minutes INTEGER,
  frequency_per_week INTEGER,
  
  -- Scheduling
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Days of week (0=Sunday, 1=Monday, etc)
  days_of_week INTEGER[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'cancelado')),
  
  -- Progress Tracking
  total_sessions_prescribed INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_sessions_prescribed > 0 THEN 
        (sessions_completed::DECIMAL / total_sessions_prescribed * 100)
      ELSE 0
    END
  ) STORED,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EXERCISE COMPLETIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescribed_exercise_id UUID NOT NULL REFERENCES public.prescribed_exercises(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Completion Details
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Feedback
  sets_completed INTEGER,
  repetitions_completed INTEGER,
  duration_minutes INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  
  -- Notes
  notes TEXT,
  discomfort_reported TEXT,
  
  -- Gamification
  xp_earned INTEGER DEFAULT 5,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Document Details
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT CHECK (document_type IN ('exame', 'laudo', 'relatorio', 'receita', 'atestado', 'consentimento', 'outros')),
  
  -- File
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  file_type TEXT, -- MIME type
  
  -- Context
  related_treatment_id UUID REFERENCES public.treatments(id),
  related_session_id UUID REFERENCES public.session_evolutions(id),
  related_appointment_id UUID REFERENCES public.appointments(id),
  
  -- Visibility
  is_visible_to_patient BOOLEAN DEFAULT true,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Uploader
  uploaded_by UUID REFERENCES public.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Context
  feedback_type TEXT CHECK (feedback_type IN ('sessao', 'terapeuta', 'clinica', 'exercicio', 'geral')),
  related_appointment_id UUID REFERENCES public.appointments(id),
  related_therapist_id UUID REFERENCES public.therapists(id),
  related_exercise_id UUID REFERENCES public.prescribed_exercises(id),
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Feedback Content
  title TEXT,
  comment TEXT,
  
  -- Categories
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
  would_recommend BOOLEAN,
  
  -- Status
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'lido', 'respondido', 'arquivado')),
  
  -- Response
  response_text TEXT,
  responded_by UUID REFERENCES public.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PORTAL ACCESS LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.portal_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Access Details
  action TEXT NOT NULL, -- 'login', 'view_appointments', 'complete_exercise', etc
  page_url TEXT,
  
  -- Device Info
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  
  -- Session
  session_id TEXT,
  
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT PORTAL SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_portal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID UNIQUE NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Features
  auto_scheduling_enabled BOOLEAN DEFAULT true,
  exercise_reminders_enabled BOOLEAN DEFAULT true,
  
  -- Preferences
  preferred_appointment_time TEXT, -- 'morning', 'afternoon', 'evening'
  preferred_days INTEGER[] DEFAULT '{}', -- Days of week
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  
  -- Privacy
  share_progress_with_therapist BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EDUCATIONAL CONTENT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content Details
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('artigo', 'video', 'infografico', 'dica', 'guia')),
  category TEXT,
  
  -- Content
  content TEXT,
  video_url TEXT,
  image_url TEXT,
  
  -- Audience
  target_pathologies TEXT[] DEFAULT '{}',
  target_age_group TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Author
  author_id UUID REFERENCES public.users(id),
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_exercises_library_category ON public.exercises_library(category);
CREATE INDEX idx_exercises_library_difficulty ON public.exercises_library(difficulty);
CREATE INDEX idx_exercises_library_is_active ON public.exercises_library(is_active);

CREATE INDEX idx_prescribed_exercises_patient_id ON public.prescribed_exercises(patient_id);
CREATE INDEX idx_prescribed_exercises_exercise_id ON public.prescribed_exercises(exercise_id);
CREATE INDEX idx_prescribed_exercises_status ON public.prescribed_exercises(status);
CREATE INDEX idx_prescribed_exercises_prescribed_by ON public.prescribed_exercises(prescribed_by);

CREATE INDEX idx_exercise_completions_prescribed_exercise_id ON public.exercise_completions(prescribed_exercise_id);
CREATE INDEX idx_exercise_completions_patient_id ON public.exercise_completions(patient_id);
CREATE INDEX idx_exercise_completions_completion_date ON public.exercise_completions(completion_date DESC);

CREATE INDEX idx_patient_documents_patient_id ON public.patient_documents(patient_id);
CREATE INDEX idx_patient_documents_document_type ON public.patient_documents(document_type);
CREATE INDEX idx_patient_documents_created_at ON public.patient_documents(created_at DESC);

CREATE INDEX idx_patient_feedback_patient_id ON public.patient_feedback(patient_id);
CREATE INDEX idx_patient_feedback_status ON public.patient_feedback(status);
CREATE INDEX idx_patient_feedback_created_at ON public.patient_feedback(created_at DESC);

CREATE INDEX idx_portal_access_log_patient_id ON public.portal_access_log(patient_id);
CREATE INDEX idx_portal_access_log_accessed_at ON public.portal_access_log(accessed_at DESC);

CREATE INDEX idx_patient_portal_settings_patient_id ON public.patient_portal_settings(patient_id);

CREATE INDEX idx_educational_content_content_type ON public.educational_content(content_type);
CREATE INDEX idx_educational_content_is_published ON public.educational_content(is_published);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;

-- EXERCISES LIBRARY POLICIES
CREATE POLICY "Authenticated users can view active exercises"
  ON public.exercises_library FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Therapists can manage exercises"
  ON public.exercises_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.therapists
      WHERE user_id = auth.uid()
    )
  );

-- PRESCRIBED EXERCISES POLICIES
CREATE POLICY "Patients can view own prescribed exercises"
  ON public.prescribed_exercises FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view prescribed exercises"
  ON public.prescribed_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'fisioterapeuta'
    )
  );

CREATE POLICY "Therapists can prescribe exercises"
  ON public.prescribed_exercises FOR INSERT
  WITH CHECK (
    prescribed_by IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can update prescribed exercises"
  ON public.prescribed_exercises FOR UPDATE
  USING (
    prescribed_by IN (
      SELECT id FROM public.therapists WHERE user_id = auth.uid()
    )
  );

-- EXERCISE COMPLETIONS POLICIES
CREATE POLICY "Patients can view own completions"
  ON public.exercise_completions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create completions"
  ON public.exercise_completions FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view patient completions"
  ON public.exercise_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'fisioterapeuta'
    )
  );

-- PATIENT DOCUMENTS POLICIES
CREATE POLICY "Patients can view own visible documents"
  ON public.patient_documents FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    ) AND is_visible_to_patient = true
  );

CREATE POLICY "Staff can view all patient documents"
  ON public.patient_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

CREATE POLICY "Staff can manage documents"
  ON public.patient_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- PATIENT FEEDBACK POLICIES
CREATE POLICY "Patients can create feedback"
  ON public.patient_feedback FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view own feedback"
  ON public.patient_feedback FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all feedback"
  ON public.patient_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Staff can update feedback"
  ON public.patient_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- PORTAL ACCESS LOG POLICIES (System only)
CREATE POLICY "System can manage access logs"
  ON public.portal_access_log FOR ALL
  USING (true);

-- PATIENT PORTAL SETTINGS POLICIES
CREATE POLICY "Patients can view own settings"
  ON public.patient_portal_settings FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own settings"
  ON public.patient_portal_settings FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create settings"
  ON public.patient_portal_settings FOR INSERT
  WITH CHECK (true);

-- EDUCATIONAL CONTENT POLICIES
CREATE POLICY "Authenticated users can view published content"
  ON public.educational_content FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage content"
  ON public.educational_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta')
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_exercises_library_updated_at
  BEFORE UPDATE ON public.exercises_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescribed_exercises_updated_at
  BEFORE UPDATE ON public.prescribed_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_documents_updated_at
  BEFORE UPDATE ON public.patient_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_feedback_updated_at
  BEFORE UPDATE ON public.patient_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_portal_settings_updated_at
  BEFORE UPDATE ON public.patient_portal_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_content_updated_at
  BEFORE UPDATE ON public.educational_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create default portal settings for new patients
CREATE OR REPLACE FUNCTION create_default_portal_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patient_portal_settings (patient_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_portal_settings_on_patient
  AFTER INSERT ON public.patients
  FOR EACH ROW EXECUTE FUNCTION create_default_portal_settings();

-- Function to update prescribed exercise completion stats
CREATE OR REPLACE FUNCTION update_prescribed_exercise_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prescribed_exercises
  SET sessions_completed = sessions_completed + 1
  WHERE id = NEW.prescribed_exercise_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_completion
  AFTER INSERT ON public.exercise_completions
  FOR EACH ROW EXECUTE FUNCTION update_prescribed_exercise_stats();

-- Function to award XP for exercise completion
CREATE OR REPLACE FUNCTION award_xp_for_exercise()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gamification_points (patient_id, points_earned, points_type, description, source_type, source_id)
  VALUES (
    NEW.patient_id,
    NEW.xp_earned,
    'exercicio',
    'Exercício completado',
    'exercise_completion',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_xp_on_exercise_completion
  AFTER INSERT ON public.exercise_completions
  FOR EACH ROW EXECUTE FUNCTION award_xp_for_exercise();

