-- =====================================================
-- MIGRATION: 003 - Exercises and Financial Tables
-- Description: Create exercises, protocols, and financial tables
-- Created: 2025-01-17
-- =====================================================

-- =====================================================
-- 1. EXERCISES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS exercises (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility', 'balance', etc.

  -- Target Areas
  muscle_groups TEXT[] DEFAULT '{}',
  body_parts TEXT[] DEFAULT '{}', -- for compatibility with existing code
  equipment TEXT[] DEFAULT '{}',

  -- Difficulty
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3), -- 1=easy, 2=medium, 3=hard

  -- Exercise Parameters
  duration_minutes INTEGER,
  duration INTEGER DEFAULT 0, -- in seconds for compatibility
  repetitions INTEGER,
  sets INTEGER,
  rest_time INTEGER DEFAULT 0, -- in seconds

  -- Instructions
  instructions TEXT[] DEFAULT '{}',
  precautions TEXT[] DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  indications TEXT[] DEFAULT '{}', -- for compatibility

  -- Media
  video_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  media JSONB DEFAULT '{"videoUrl": "", "thumbnailUrl": "", "duration": 0}'::jsonb,

  -- Tags and Search
  tags TEXT[] DEFAULT '{}',

  -- Modifications
  modifications JSONB DEFAULT '{"easier": "", "harder": ""}'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_tags ON exercises USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_active ON exercises(is_active) WHERE is_active = TRUE;
-- RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active exercises"
  ON exercises FOR SELECT
  USING (is_active = TRUE AND deleted_at IS NULL);
CREATE POLICY "Therapists can create exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'therapist')
      AND is_active = TRUE
    )
  );
CREATE POLICY "Therapists can update own exercises"
  ON exercises FOR UPDATE
  USING (
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
-- =====================================================
-- 2. EXERCISE PROTOCOLS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS exercise_protocols (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,

  -- Clinical Context
  pathology TEXT NOT NULL, -- 'knee_injury', 'back_pain', etc.
  phase TEXT DEFAULT 'acute' CHECK (phase IN ('acute', 'subacute', 'chronic', 'maintenance')),

  -- Protocol Details
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  frequency_per_week INTEGER NOT NULL DEFAULT 3,

  -- Exercises (stored as JSONB array of exercise configurations)
  exercises JSONB DEFAULT '[]'::jsonb,
  -- Format: [{"exercise_id": "uuid", "order": 1, "sets": 3, "repetitions": 10, "duration_seconds": 60, "rest_seconds": 30, "notes": "..."}]

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_protocols_pathology ON exercise_protocols(pathology);
CREATE INDEX IF NOT EXISTS idx_protocols_phase ON exercise_protocols(phase);
CREATE INDEX IF NOT EXISTS idx_protocols_category ON exercise_protocols(category);
CREATE INDEX IF NOT EXISTS idx_protocols_active ON exercise_protocols(is_active) WHERE is_active = TRUE;
-- RLS
ALTER TABLE exercise_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can view protocols"
  ON exercise_protocols FOR SELECT
  USING (
    is_active = TRUE AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'therapist', 'manager')
    )
  );
CREATE POLICY "Therapists can create protocols"
  ON exercise_protocols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'therapist')
      AND is_active = TRUE
    )
  );
CREATE POLICY "Therapists can update own protocols"
  ON exercise_protocols FOR UPDATE
  USING (
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
-- =====================================================
-- 3. PATIENT EXERCISE PRESCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_exercise_prescriptions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
  protocol_id UUID REFERENCES exercise_protocols(id),

  -- Prescription Details
  title TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: same as protocol exercises

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  frequency_per_week INTEGER DEFAULT 3,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),

  -- Progress Tracking
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_sessions_planned INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,
  patient_feedback TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON patient_exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_therapist ON patient_exercise_prescriptions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_protocol ON patient_exercise_prescriptions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON patient_exercise_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_dates ON patient_exercise_prescriptions(start_date, end_date);
-- RLS
ALTER TABLE patient_exercise_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own prescriptions"
  ON patient_exercise_prescriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );
CREATE POLICY "Therapists can manage prescriptions"
  ON patient_exercise_prescriptions FOR ALL
  USING (
    therapist_id IN (
      SELECT id FROM therapists WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
-- =====================================================
-- 4. FINANCIAL TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction Type
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'revenue', 'receita', 'despesa')),
  transaction_type TEXT, -- 'voucher_purchase', 'appointment_payment', etc.

  -- References
  patient_id UUID REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  therapist_id UUID REFERENCES therapists(id),

  -- Amount and Currency
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',

  -- Description
  title TEXT,
  description TEXT NOT NULL,
  category TEXT, -- 'consultation', 'equipment', 'rent', 'salary', etc.

  -- Payment Details
  payment_method TEXT, -- 'cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer'
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_date DATE,
  due_date DATE,

  -- External References
  provider TEXT, -- 'stripe', 'mercadopago', etc.
  provider_transaction_id TEXT,
  customer_id TEXT,

  -- Breakdown (for complex transactions)
  breakdown JSONB DEFAULT '{}'::jsonb,
  -- Format: {"grossAmount": 100, "platformFee": 15, "taxAmount": 5, "netAmount": 80}

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),

  -- Additional Info
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Add columns if they don't exist (for existing table)
DO $$ BEGIN
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES therapists(id);
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS title TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_date DATE;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS due_date DATE;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS provider TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS customer_id TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS breakdown JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;
-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_patient ON financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appointment ON financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_therapist ON financial_transactions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON financial_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_date ON financial_transactions(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON financial_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON financial_transactions(category);
-- RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view all transactions"
  ON financial_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = TRUE
    )
  );
CREATE POLICY "Therapists can view own transactions"
  ON financial_transactions FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM therapists WHERE user_id IN (
        SELECT id FROM users WHERE auth_id = auth.uid()
      )
    )
  );
CREATE POLICY "Staff can manage transactions"
  ON financial_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = TRUE
    )
  );
-- =====================================================
-- 5. EXPENSE CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Category Info
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- lucide icon name
  color TEXT DEFAULT '#3b82f6',

  -- Budget
  monthly_budget DECIMAL(10, 2),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insert default categories
INSERT INTO expense_categories (name, description, icon, color) VALUES
  ('Aluguel', 'Aluguel do espaço', 'home', '#ef4444'),
  ('Equipamentos', 'Equipamentos e materiais', 'package', '#f59e0b'),
  ('Salários', 'Salários e benefícios', 'users', '#10b981'),
  ('Marketing', 'Marketing e publicidade', 'megaphone', '#8b5cf6'),
  ('Utilidades', 'Água, luz, internet', 'zap', '#06b6d4'),
  ('Manutenção', 'Manutenção e reparos', 'wrench', '#6366f1'),
  ('Software', 'Assinaturas e software', 'laptop', '#ec4899'),
  ('Outros', 'Outras despesas', 'more-horizontal', '#64748b')
ON CONFLICT (name) DO NOTHING;
-- RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories"
  ON expense_categories FOR SELECT
  USING (is_active = TRUE);
CREATE POLICY "Admins can manage categories"
  ON expense_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

-- Function: Calculate financial summary for period
CREATE OR REPLACE FUNCTION get_financial_summary(
  p_start_date DATE,
  p_end_date DATE,
  p_therapist_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_revenue DECIMAL,
  total_expenses DECIMAL,
  net_profit DECIMAL,
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'despesa') THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE -amount END), 0) AS net_profit,
    COUNT(*)::INTEGER AS transaction_count
  FROM financial_transactions
  WHERE payment_date >= p_start_date
    AND payment_date <= p_end_date
    AND status = 'completed'
    AND deleted_at IS NULL
    AND (p_therapist_id IS NULL OR therapist_id = p_therapist_id);
END;
$$ LANGUAGE plpgsql;
-- Function: Get exercise statistics
CREATE OR REPLACE FUNCTION get_exercise_statistics()
RETURNS TABLE(
  total_exercises INTEGER,
  by_category JSONB,
  by_difficulty JSONB,
  most_used_exercises JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_exercises,
    jsonb_object_agg(category, count) AS by_category,
    jsonb_object_agg(difficulty_level, diff_count) AS by_difficulty,
    jsonb_agg(jsonb_build_object('id', id, 'name', name, 'usage_count', 0)) AS most_used_exercises
  FROM (
    SELECT category, COUNT(*)::INTEGER as count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY category
  ) cat,
  (
    SELECT difficulty_level, COUNT(*)::INTEGER as diff_count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY difficulty_level
  ) diff,
  (
    SELECT id, name
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    LIMIT 10
  ) ex;
END;
$$ LANGUAGE plpgsql;
-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on exercises
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Trigger: Update updated_at on exercise_protocols
DROP TRIGGER IF EXISTS update_protocols_updated_at ON exercise_protocols;
CREATE TRIGGER update_protocols_updated_at
  BEFORE UPDATE ON exercise_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Trigger: Update updated_at on patient_exercise_prescriptions
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON patient_exercise_prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON patient_exercise_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Trigger: Update updated_at on financial_transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Trigger: Update updated_at on expense_categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON expense_categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- 8. VIEWS
-- =====================================================

-- View: Financial summary by month
CREATE OR REPLACE VIEW v_financial_monthly_summary AS
SELECT
  DATE_TRUNC('month', payment_date)::DATE AS month,
  SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN type IN ('expense', 'despesa') THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE -amount END) AS profit,
  COUNT(*) AS transaction_count
FROM financial_transactions
WHERE status = 'completed' AND deleted_at IS NULL
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;
-- View: Active exercise prescriptions
CREATE OR REPLACE VIEW v_active_prescriptions AS
SELECT
  pep.*,
  p.full_name AS patient_name,
  t.user_id AS therapist_user_id,
  u.full_name AS therapist_name
FROM patient_exercise_prescriptions pep
JOIN patients p ON p.id = pep.patient_id
JOIN therapists t ON t.id = pep.therapist_id
JOIN users u ON u.id = t.user_id
WHERE pep.status = 'active'
  AND pep.deleted_at IS NULL
  AND (pep.end_date IS NULL OR pep.end_date >= CURRENT_DATE);
-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE exercises IS 'Exercise library with detailed instructions and media';
COMMENT ON TABLE exercise_protocols IS 'Pre-defined exercise protocols for specific conditions';
COMMENT ON TABLE patient_exercise_prescriptions IS 'Exercise prescriptions assigned to patients';
COMMENT ON TABLE financial_transactions IS 'All financial transactions (income and expenses)';
COMMENT ON TABLE expense_categories IS 'Categories for organizing expenses';
