-- =============================================
-- MIGRATION 007: PATIENT PORTAL
-- =============================================

CREATE TABLE IF NOT EXISTS public.exercises_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescribed_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises_library(id),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prescribed_exercises_patient_id ON public.prescribed_exercises(patient_id);

ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active exercises" ON public.exercises_library FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Patients can view own exercises" ON public.prescribed_exercises FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);

CREATE TRIGGER update_exercises_library_updated_at BEFORE UPDATE ON public.exercises_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescribed_exercises_updated_at BEFORE UPDATE ON public.prescribed_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

