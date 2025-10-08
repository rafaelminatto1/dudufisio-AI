-- =====================================================
-- MIGRATION: Create Gamification Tables
-- Version: 1.0.0
-- Date: 2025-10-08
-- Description: Sistema de gamificação para engajamento de pacientes
-- =====================================================

-- =====================================================
-- 1. TABELA DE PONTOS DE GAMIFICAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Pontuação
  points INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'attendance', 'exercises', 'engagement', 'referral', 'milestone'
  
  -- Referência (opcional)
  reference_type VARCHAR(50), -- 'appointment', 'exercise', 'review', etc.
  reference_id UUID,
  
  -- Metadados
  metadata JSONB,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES unified_users(id),
  
  -- Constraints
  CONSTRAINT gamification_points_category_check CHECK (category IN ('attendance', 'exercises', 'engagement', 'referral', 'milestone', 'bonus'))
);

-- Índices
CREATE INDEX idx_gamification_points_patient ON gamification_points(patient_id, created_at DESC);
CREATE INDEX idx_gamification_points_clinic ON gamification_points(clinic_id, created_at DESC);
CREATE INDEX idx_gamification_points_category ON gamification_points(category);

-- Comentários
COMMENT ON TABLE gamification_points IS 'Registro de pontos ganhos pelos pacientes';
COMMENT ON COLUMN gamification_points.reason IS 'Motivo pelo qual os pontos foram concedidos';

-- =====================================================
-- 2. TABELA DE CONQUISTAS (ACHIEVEMENTS)
-- =====================================================
CREATE TABLE IF NOT EXISTS gamification_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255), -- emoji ou URL da imagem
  
  -- Requisitos
  points_required INTEGER DEFAULT 0,
  category VARCHAR(50) NOT NULL, -- 'attendance', 'exercises', 'engagement', 'milestones'
  trigger_type VARCHAR(100), -- 'first_appointment', 'week_streak', '20_appointments', etc.
  trigger_conditions JSONB,
  
  -- Configuração
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE, -- Conquistas secretas
  
  -- Recompensa (opcional)
  reward_type VARCHAR(50), -- 'points', 'discount', 'free_session', 'item'
  reward_value DECIMAL(10,2),
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT gamification_achievements_category_check CHECK (category IN ('attendance', 'exercises', 'engagement', 'milestones', 'referral', 'special'))
);

-- Índices
CREATE INDEX idx_achievements_clinic_active ON gamification_achievements(clinic_id, is_active);
CREATE INDEX idx_achievements_category ON gamification_achievements(category, is_active);

-- Comentários
COMMENT ON TABLE gamification_achievements IS 'Definição de conquistas/badges disponíveis';
COMMENT ON COLUMN gamification_achievements.is_hidden IS 'Se true, conquista é surpresa (não aparece até desbloquear)';

-- =====================================================
-- 3. TABELA DE CONQUISTAS DOS PACIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES gamification_achievements(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Dados do unlock
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB, -- Progresso até desbloquear
  
  -- Notificação
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  
  UNIQUE(patient_id, achievement_id)
);

-- Índices
CREATE INDEX idx_patient_achievements_patient ON patient_achievements(patient_id, unlocked_at DESC);
CREATE INDEX idx_patient_achievements_achievement ON patient_achievements(achievement_id);

-- Comentários
COMMENT ON TABLE patient_achievements IS 'Conquistas desbloqueadas por paciente';

-- =====================================================
-- 4. TABELA DE RECOMPENSAS
-- =====================================================
CREATE TABLE IF NOT EXISTS gamification_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  
  -- Custo em pontos
  points_cost INTEGER NOT NULL,
  
  -- Tipo de recompensa
  reward_type VARCHAR(50) NOT NULL, -- 'discount', 'free_session', 'item', 'voucher'
  reward_value VARCHAR(255), -- "10%", "1 sessão", etc.
  
  -- Disponibilidade
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER, -- NULL = ilimitado
  max_per_patient INTEGER DEFAULT 1,
  
  -- Período de validade
  valid_from DATE,
  valid_until DATE,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT gamification_rewards_type_check CHECK (reward_type IN ('discount', 'free_session', 'item', 'voucher', 'upgrade'))
);

-- Índices
CREATE INDEX idx_rewards_clinic_active ON gamification_rewards(clinic_id, is_active);
CREATE INDEX idx_rewards_points ON gamification_rewards(points_cost);

-- =====================================================
-- 5. TABELA DE RESGATES DE RECOMPENSAS
-- =====================================================
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES gamification_rewards(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Dados do resgate
  points_spent INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'delivered', 'cancelled'
  
  -- Aprovação
  approved_by UUID REFERENCES unified_users(id),
  approved_at TIMESTAMPTZ,
  
  -- Entrega
  delivered_at TIMESTAMPTZ,
  delivery_notes TEXT,
  
  -- Auditoria
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT reward_redemptions_status_check CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled', 'expired'))
);

-- Índices
CREATE INDEX idx_redemptions_patient ON reward_redemptions(patient_id, redeemed_at DESC);
CREATE INDEX idx_redemptions_clinic_status ON reward_redemptions(clinic_id, status);

-- =====================================================
-- 6. VIEW: Saldo de Pontos por Paciente
-- =====================================================
CREATE OR REPLACE VIEW patient_points_balance AS
SELECT
  gp.patient_id,
  gp.clinic_id,
  COALESCE(SUM(gp.points), 0) as total_earned,
  COALESCE(SUM(rr.points_spent), 0) as total_spent,
  COALESCE(SUM(gp.points), 0) - COALESCE(SUM(rr.points_spent), 0) as current_balance
FROM gamification_points gp
LEFT JOIN reward_redemptions rr ON rr.patient_id = gp.patient_id AND rr.status = 'approved'
GROUP BY gp.patient_id, gp.clinic_id;

-- =====================================================
-- 7. FUNCTION: Calcular Nível do Paciente
-- =====================================================
CREATE OR REPLACE FUNCTION get_patient_level(p_patient_id UUID)
RETURNS TABLE(
  level_name VARCHAR,
  level_number INTEGER,
  current_points INTEGER,
  points_to_next INTEGER
) AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Buscar saldo atual
  SELECT current_balance INTO v_balance
  FROM patient_points_balance
  WHERE patient_id = p_patient_id;

  v_balance := COALESCE(v_balance, 0);

  -- Determinar nível
  IF v_balance >= 5000 THEN
    RETURN QUERY SELECT 'Platina'::VARCHAR, 5, v_balance, 0;
  ELSIF v_balance >= 2000 THEN
    RETURN QUERY SELECT 'Ouro'::VARCHAR, 4, v_balance, 5000 - v_balance;
  ELSIF v_balance >= 1000 THEN
    RETURN QUERY SELECT 'Prata'::VARCHAR, 3, v_balance, 2000 - v_balance;
  ELSIF v_balance >= 500 THEN
    RETURN QUERY SELECT 'Bronze'::VARCHAR, 2, v_balance, 1000 - v_balance;
  ELSE
    RETURN QUERY SELECT 'Iniciante'::VARCHAR, 1, v_balance, 500 - v_balance;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. SEEDS: Conquistas Padrão
-- =====================================================
INSERT INTO gamification_achievements (name, description, icon, points_required, category, trigger_type) VALUES
('Primeira Consulta', 'Completou sua primeira sessão de fisioterapia', '🎯', 0, 'attendance', 'first_appointment'),
('Dedicado', 'Compareceu a 5 consultas consecutivas', '⭐', 100, 'attendance', '5_consecutive_appointments'),
('Comprometido', 'Completou 10 sessões de tratamento', '💪', 200, 'attendance', '10_appointments'),
('Veterano', 'Completou 20 sessões de tratamento', '🏆', 500, 'attendance', '20_appointments'),
('Mestre da Recuperação', 'Completou 50 sessões', '👑', 1000, 'milestones', '50_appointments'),
('Semana Completa', 'Fez todos os exercícios por 7 dias seguidos', '🔥', 100, 'exercises', 'week_streak_exercises'),
('Disciplinado', 'Manteve streak de exercícios por 30 dias', '💎', 500, 'exercises', 'month_streak_exercises'),
('Comunicativo', 'Forneceu feedback em 5 sessões', '💬', 50, 'engagement', '5_feedbacks'),
('Fotógrafo', 'Compartilhou 3 fotos de evolução', '📸', 75, 'engagement', '3_progress_photos'),
('Avaliador', 'Deixou avaliação no Google', '⭐⭐⭐⭐⭐', 50, 'engagement', 'google_review'),
('Embaixador', 'Indicou 1 amigo que agendou', '🎁', 200, 'referral', '1_referral'),
('Influencer', 'Indicou 3 amigos que agendaram', '🌟', 600, 'referral', '3_referrals'),
('Pontual', 'Não faltou nenhuma consulta em 1 mês', '⏰', 100, 'attendance', 'no_misses_month'),
('Madrugador', 'Agendou consulta para 7h da manhã', '🌅', 20, 'special', 'early_appointment'),
('Noturno', 'Manteve frequência após 18h', '🌙', 20, 'special', 'evening_appointments')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. SEEDS: Recompensas Padrão
-- =====================================================
INSERT INTO gamification_rewards (name, description, icon, points_cost, reward_type, reward_value, is_active) VALUES
('10% de Desconto', 'Desconto de 10% na próxima sessão', '🎟️', 500, 'discount', '10%', true),
('15% de Desconto', 'Desconto de 15% em 3 sessões', '🎫', 1000, 'discount', '15%', true),
('Sessão Gratuita', 'Uma sessão completamente grátis', '🎁', 1500, 'free_session', '1 sessão', true),
('Avaliação Grátis', 'Avaliação completa de corrida gratuita', '👟', 2000, 'free_session', 'Avaliação', true),
('Kit de Exercícios', 'Kit de faixas elásticas para casa', '🏋️', 2500, 'item', 'Kit fisio', true),
('Massagem Relaxante', 'Sessão de massagem relaxante 30min', '💆', 1200, 'voucher', '30min massagem', true),
('Upgrade Premium', 'Atendimento VIP por 1 mês', '⭐', 3000, 'upgrade', 'VIP 1 mês', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. RLS (Row Level Security)
-- =====================================================
ALTER TABLE gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies para pontos
CREATE POLICY "Users can view points from their clinic"
  ON gamification_points FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

CREATE POLICY "System can insert points"
  ON gamification_points FOR INSERT
  WITH CHECK (true); -- Sistema pode sempre adicionar

-- Policies para achievements
CREATE POLICY "Users can view achievements from their clinic"
  ON gamification_achievements FOR SELECT
  USING (clinic_id IS NULL OR clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

-- Policies para patient_achievements
CREATE POLICY "Users can view patient achievements from their clinic"
  ON patient_achievements FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

-- Políticas para rewards
CREATE POLICY "Users can view rewards from their clinic"
  ON gamification_rewards FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

-- =====================================================
-- 11. GRANTS
-- =====================================================
GRANT SELECT, INSERT ON gamification_points TO authenticated;
GRANT SELECT ON gamification_achievements TO authenticated;
GRANT SELECT ON patient_achievements TO authenticated;
GRANT SELECT ON gamification_rewards TO authenticated;
GRANT SELECT, INSERT ON reward_redemptions TO authenticated;
GRANT SELECT ON patient_points_balance TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

