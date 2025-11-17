-- Patient Portal and Exercises
CREATE TABLE public.exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  category TEXT CHECK (category IN ('mobilidade', 'fortalecimento', 'alongamento', 'equilibrio', 'respiratorio', 'postural')),
  difficulty TEXT CHECK (difficulty IN ('facil', 'moderado', 'dificil')),
  equipment_needed TEXT[] DEFAULT '{}',
  duration_seconds INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patient_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercise_library(id),
  prescribed_by UUID REFERENCES public.therapists(id),
  prescribed_date DATE NOT NULL,
  frequency TEXT,
  duration_days INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_exercise_id UUID NOT NULL REFERENCES public.patient_exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  repetitions_completed INTEGER,
  sets_completed INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  notes TEXT,
  video_url TEXT,
  ai_feedback JSONB
);

CREATE TABLE public.patient_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  target_date DATE,
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  notes TEXT,
  created_by UUID REFERENCES public.therapists(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patient_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  categories JSONB DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercise_library_category ON public.exercise_library(category);
CREATE INDEX idx_patient_exercises_patient ON public.patient_exercises(patient_id);
CREATE INDEX idx_exercise_logs_patient_exercise ON public.exercise_logs(patient_exercise_id);
CREATE INDEX idx_patient_goals_patient ON public.patient_goals(patient_id);

-- RLS
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active exercises" ON public.exercise_library FOR SELECT USING (is_active = true);
CREATE POLICY "Patients can view own exercises" ON public.patient_exercises FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients can log own exercises" ON public.exercise_logs FOR INSERT WITH CHECK (
  patient_exercise_id IN (SELECT id FROM public.patient_exercises WHERE patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()))
);

-- Triggers
CREATE TRIGGER update_exercise_library_updated_at BEFORE UPDATE ON public.exercise_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_goals_updated_at BEFORE UPDATE ON public.patient_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

