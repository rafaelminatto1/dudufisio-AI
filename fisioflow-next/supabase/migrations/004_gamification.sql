-- Gamification System
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('comum', 'raro', 'epico', 'lendario')),
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patient_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, achievement_id)
);

CREATE TABLE public.patient_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('sessao_completa', 'exercicio_completo', 'meta_atingida', 'login', 'feedback_dado')),
  xp_earned INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cost_xp INTEGER NOT NULL,
  type TEXT CHECK (type IN ('desconto', 'voucher', 'brinde', 'beneficio')),
  value DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.patient_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'usado', 'expirado')),
  expiry_date DATE
);

-- Indexes
CREATE INDEX idx_patient_achievements_patient ON public.patient_achievements(patient_id);
CREATE INDEX idx_patient_activities_patient ON public.patient_activities(patient_id);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Patients can view own activities" ON public.patient_activities FOR SELECT USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

