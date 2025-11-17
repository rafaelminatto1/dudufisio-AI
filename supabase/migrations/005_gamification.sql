-- =============================================
-- MIGRATION 005: GAMIFICATION SYSTEM
-- xp, badges, achievements, vouchers, leaderboard
-- =============================================

-- =============================================
-- GAMIFICATION POINTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Points
  points_earned INTEGER NOT NULL,
  points_type TEXT NOT NULL CHECK (points_type IN ('sessao', 'meta', 'exercicio', 'feedback', 'sem_faltas', 'bonus', 'outros')),
  
  -- Source
  source_type TEXT, -- 'appointment', 'goal', 'exercise', etc.
  source_id UUID,
  
  -- Details
  description TEXT NOT NULL,
  multiplier DECIMAL(3, 2) DEFAULT 1.0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BADGES TABLE (Badge Definitions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Badge Details
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  
  -- Visual
  icon_url TEXT,
  icon_name TEXT, -- For icon library
  color TEXT DEFAULT '#3b82f6',
  
  -- Rarity
  rarity TEXT DEFAULT 'comum' CHECK (rarity IN ('comum', 'raro', 'epico', 'lendario')),
  
  -- Requirements
  criteria JSONB NOT NULL, -- {type: 'sessions_count', value: 10}
  points_reward INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT BADGES TABLE (Awarded Badges)
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  
  -- Award Details
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_at_award JSONB, -- Snapshot of progress when awarded
  
  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  UNIQUE(patient_id, badge_id)
);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Achievement Details
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('tratamento', 'frequencia', 'progresso', 'social', 'especial')),
  
  -- Requirements
  requirements JSONB NOT NULL, -- Complex requirements
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  badge_id UUID REFERENCES public.badges(id),
  voucher_reward UUID REFERENCES public.vouchers(id),
  
  -- Visual
  icon_name TEXT,
  color TEXT DEFAULT '#10b981',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENT ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  
  -- Progress
  progress JSONB DEFAULT '{}',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Completion
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(patient_id, achievement_id)
);

-- =============================================
-- VOUCHERS TABLE (Reward Store Items)
-- =============================================
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Voucher Details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN ('desconto_sessao', 'sessao_gratis', 'produto', 'servico', 'upgrade')),
  
  -- Cost
  xp_cost INTEGER NOT NULL,
  
  -- Value/Benefit
  discount_percentage DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  free_sessions INTEGER,
  
  -- Availability
  stock_quantity INTEGER,
  max_per_patient INTEGER DEFAULT 1,
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  validity_days INTEGER, -- Days valid after redemption
  
  -- Restrictions
  restrictions JSONB DEFAULT '{}',
  
  -- Visual
  image_url TEXT,
  color TEXT DEFAULT '#8b5cf6',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- VOUCHER REDEMPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Redemption Details
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_spent INTEGER NOT NULL,
  
  -- Usage
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'usado', 'expirado', 'cancelado')),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Application
  applied_to_appointment_id UUID REFERENCES public.appointments(id),
  applied_to_transaction_id UUID REFERENCES public.financial_transactions(id),
  
  -- Voucher Code
  redemption_code TEXT UNIQUE,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LEADERBOARD TABLE (Periodic Rankings)
-- =============================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Period
  period_type TEXT NOT NULL CHECK (period_type IN ('semanal', 'mensal', 'anual', 'all_time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Stats
  total_xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  
  -- Achievements during period
  badges_earned INTEGER DEFAULT 0,
  achievements_completed INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  goals_achieved INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(patient_id, period_type, period_start)
);

-- =============================================
-- XP LEVELS TABLE (Level Definitions)
-- =============================================
CREATE TABLE IF NOT EXISTS public.xp_levels (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL UNIQUE,
  title TEXT,
  color TEXT DEFAULT '#3b82f6',
  rewards JSONB DEFAULT '{}', -- Rewards for reaching this level
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default levels
INSERT INTO public.xp_levels (level, xp_required, title, color) VALUES
(1, 0, 'Iniciante', '#94a3b8'),
(2, 100, 'Aprendiz', '#3b82f6'),
(3, 250, 'Dedicado', '#6366f1'),
(4, 500, 'Comprometido', '#8b5cf6'),
(5, 1000, 'Experiente', '#a855f7'),
(6, 2000, 'Veterano', '#c026d3'),
(7, 3500, 'Mestre', '#d946ef'),
(8, 5500, 'Campeão', '#e879f9'),
(9, 8000, 'Lendário', '#f0abfc'),
(10, 12000, 'Épico', '#fae8ff')
ON CONFLICT (level) DO NOTHING;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_gamification_points_patient_id ON public.gamification_points(patient_id);
CREATE INDEX idx_gamification_points_points_type ON public.gamification_points(points_type);
CREATE INDEX idx_gamification_points_created_at ON public.gamification_points(created_at DESC);

CREATE INDEX idx_badges_slug ON public.badges(slug);
CREATE INDEX idx_badges_rarity ON public.badges(rarity);
CREATE INDEX idx_badges_is_active ON public.badges(is_active);

CREATE INDEX idx_patient_badges_patient_id ON public.patient_badges(patient_id);
CREATE INDEX idx_patient_badges_badge_id ON public.patient_badges(badge_id);
CREATE INDEX idx_patient_badges_awarded_at ON public.patient_badges(awarded_at DESC);

CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_is_active ON public.achievements(is_active);

CREATE INDEX idx_patient_achievements_patient_id ON public.patient_achievements(patient_id);
CREATE INDEX idx_patient_achievements_achievement_id ON public.patient_achievements(achievement_id);
CREATE INDEX idx_patient_achievements_completed ON public.patient_achievements(completed);

CREATE INDEX idx_vouchers_voucher_type ON public.vouchers(voucher_type);
CREATE INDEX idx_vouchers_is_active ON public.vouchers(is_active);
CREATE INDEX idx_vouchers_xp_cost ON public.vouchers(xp_cost);

CREATE INDEX idx_voucher_redemptions_voucher_id ON public.voucher_redemptions(voucher_id);
CREATE INDEX idx_voucher_redemptions_patient_id ON public.voucher_redemptions(patient_id);
CREATE INDEX idx_voucher_redemptions_status ON public.voucher_redemptions(status);
CREATE INDEX idx_voucher_redemptions_redemption_code ON public.voucher_redemptions(redemption_code);

CREATE INDEX idx_leaderboard_patient_id ON public.leaderboard(patient_id);
CREATE INDEX idx_leaderboard_period_type ON public.leaderboard(period_type);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);
CREATE INDEX idx_leaderboard_total_xp ON public.leaderboard(total_xp DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_levels ENABLE ROW LEVEL SECURITY;

-- GAMIFICATION POINTS POLICIES
CREATE POLICY "Patients can view own points"
  ON public.gamification_points FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create points"
  ON public.gamification_points FOR INSERT
  WITH CHECK (true);

-- BADGES POLICIES (Public read)
CREATE POLICY "Everyone can view active badges"
  ON public.badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PATIENT BADGES POLICIES
CREATE POLICY "Patients can view own badges"
  ON public.patient_badges FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view others' badges"
  ON public.patient_badges FOR SELECT
  USING (is_visible = true);

CREATE POLICY "System can award badges"
  ON public.patient_badges FOR INSERT
  WITH CHECK (true);

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Everyone can view active achievements"
  ON public.achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PATIENT ACHIEVEMENTS POLICIES
CREATE POLICY "Patients can view own achievements"
  ON public.patient_achievements FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- VOUCHERS POLICIES
CREATE POLICY "Authenticated users can view active vouchers"
  ON public.vouchers FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage vouchers"
  ON public.vouchers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- VOUCHER REDEMPTIONS POLICIES
CREATE POLICY "Patients can view own redemptions"
  ON public.voucher_redemptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can redeem vouchers"
  ON public.voucher_redemptions FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage redemptions"
  ON public.voucher_redemptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

-- LEADERBOARD POLICIES
CREATE POLICY "Authenticated users can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- XP LEVELS POLICIES
CREATE POLICY "Everyone can view levels"
  ON public.xp_levels FOR SELECT
  USING (true);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_achievements_updated_at
  BEFORE UPDATE ON public.patient_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voucher_redemptions_updated_at
  BEFORE UPDATE ON public.voucher_redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update patient XP and level
CREATE OR REPLACE FUNCTION update_patient_xp()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- Update patient XP
  UPDATE public.patients
  SET xp_points = xp_points + NEW.points_earned
  WHERE id = NEW.patient_id;
  
  -- Calculate new level
  SELECT level INTO new_level
  FROM public.xp_levels
  WHERE xp_required <= (
    SELECT xp_points FROM public.patients WHERE id = NEW.patient_id
  )
  ORDER BY xp_required DESC
  LIMIT 1;
  
  -- Update patient level
  UPDATE public.patients
  SET level = COALESCE(new_level, 1)
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_xp_on_points
  AFTER INSERT ON public.gamification_points
  FOR EACH ROW EXECUTE FUNCTION update_patient_xp();

-- Function to deduct XP on voucher redemption
CREATE OR REPLACE FUNCTION deduct_xp_on_redemption()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.patients
  SET xp_points = xp_points - NEW.xp_spent
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deduct_xp_on_voucher
  AFTER INSERT ON public.voucher_redemptions
  FOR EACH ROW EXECUTE FUNCTION deduct_xp_on_redemption();

-- Function to generate redemption code
CREATE OR REPLACE FUNCTION generate_redemption_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.redemption_code IS NULL THEN
    NEW.redemption_code := 'VCH-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_code_on_redemption
  BEFORE INSERT ON public.voucher_redemptions
  FOR EACH ROW EXECUTE FUNCTION generate_redemption_code();

