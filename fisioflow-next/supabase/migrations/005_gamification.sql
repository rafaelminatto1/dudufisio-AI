-- =============================================
-- MIGRATION 005: GAMIFICATION SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL,
  points_type TEXT NOT NULL CHECK (points_type IN ('sessao', 'meta', 'exercicio', 'feedback', 'sem_faltas', 'bonus', 'outros')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  rarity TEXT DEFAULT 'comum' CHECK (rarity IN ('comum', 'raro', 'epico', 'lendario')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gamification_points_patient_id ON public.gamification_points(patient_id);
CREATE INDEX idx_badges_slug ON public.badges(slug);

ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own points" ON public.gamification_points FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
);

CREATE POLICY "Everyone can view active badges" ON public.badges FOR SELECT USING (is_active = true);

