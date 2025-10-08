-- ============================================================================
-- MIGRAÇÃO: SISTEMA MULTI-CLÍNICA COM INTEGRIDADE
-- Data: 2025-10-08
-- Descrição: Implementa estrutura multi-tenant com integridade referencial
-- ============================================================================

BEGIN;

-- 1. Criar tabela de clínicas
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address JSONB,
  
  -- Configurações
  settings JSONB DEFAULT '{}'::jsonb,
  billing_config JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_expires_at DATE,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES unified_users(id),
  
  -- Constraints
  CONSTRAINT valid_cnpj CHECK (cnpj ~ '^\d{14}$' OR cnpj IS NULL),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_clinics_cnpj ON clinics(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active) WHERE is_active = TRUE;

-- 3. Adicionar clinic_id a unified_users (se não existir)
ALTER TABLE unified_users
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_unified_users_clinic ON unified_users(clinic_id) WHERE clinic_id IS NOT NULL;

-- 4. Adicionar clinic_id a patients
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id) WHERE clinic_id IS NOT NULL;

-- 5. Adicionar FKs às tabelas com clinic_id
DO $$ 
BEGIN
  -- appointments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='appointments' AND column_name='clinic_id_fk') THEN
    ALTER TABLE appointments ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_appointments_clinic ON appointments(clinic_id_fk);
  END IF;

  -- payment_methods
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='payment_methods' AND column_name='clinic_id_fk') THEN
    ALTER TABLE payment_methods ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_payment_methods_clinic ON payment_methods(clinic_id_fk);
  END IF;

  -- financial_alerts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='financial_alerts' AND column_name='clinic_id_fk') THEN
    ALTER TABLE financial_alerts ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_financial_alerts_clinic ON financial_alerts(clinic_id_fk);
  END IF;

  -- waitlist_entries
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='waitlist_entries' AND column_name='clinic_id_fk') THEN
    ALTER TABLE waitlist_entries ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_waitlist_entries_clinic ON waitlist_entries(clinic_id_fk);
  END IF;

  -- recurrent_payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='recurrent_payments' AND column_name='clinic_id_fk') THEN
    ALTER TABLE recurrent_payments ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_recurrent_payments_clinic ON recurrent_payments(clinic_id_fk);
  END IF;

  -- financial_goals
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='financial_goals' AND column_name='clinic_id_fk') THEN
    ALTER TABLE financial_goals ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_financial_goals_clinic ON financial_goals(clinic_id_fk);
  END IF;

  -- cash_flow_predictions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='cash_flow_predictions' AND column_name='clinic_id_fk') THEN
    ALTER TABLE cash_flow_predictions ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_cash_flow_predictions_clinic ON cash_flow_predictions(clinic_id_fk);
  END IF;

  -- clinical_metrics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='clinical_metrics' AND column_name='clinic_id_fk') THEN
    ALTER TABLE clinical_metrics ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_clinical_metrics_clinic ON clinical_metrics(clinic_id_fk);
  END IF;

  -- ai_predictions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ai_predictions' AND column_name='clinic_id_fk') THEN
    ALTER TABLE ai_predictions ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_ai_predictions_clinic ON ai_predictions(clinic_id_fk);
  END IF;

  -- recurrence_templates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='recurrence_templates' AND column_name='clinic_id_fk') THEN
    ALTER TABLE recurrence_templates ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_recurrence_templates_clinic ON recurrence_templates(clinic_id_fk);
  END IF;

  -- schedule_blocks
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='schedule_blocks' AND column_name='clinic_id_fk') THEN
    ALTER TABLE schedule_blocks ADD COLUMN clinic_id_fk UUID REFERENCES clinics(id);
    CREATE INDEX idx_schedule_blocks_clinic ON schedule_blocks(clinic_id_fk);
  END IF;
END $$;

-- 6. Criar clínica padrão para dados existentes
INSERT INTO clinics (id, name, email, phone, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Clínica Padrão',
  'contato@clinicapadrao.com',
  '+5511999999999',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 7. RLS para clinics
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_clinic" ON clinics;
CREATE POLICY "users_view_own_clinic" ON clinics
  FOR SELECT USING (
    id IN (
      SELECT clinic_id FROM unified_users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admins_manage_clinics" ON clinics;
CREATE POLICY "admins_manage_clinics" ON clinics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM unified_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Atualizar políticas de patients para multi-tenant
DROP POLICY IF EXISTS "Users can view patients they created" ON patients;
DROP POLICY IF EXISTS "users_view_clinic_patients" ON patients;

CREATE POLICY "users_view_clinic_patients" ON patients
  FOR SELECT USING (
    created_by = auth.uid() OR
    clinic_id IN (
      SELECT clinic_id FROM unified_users WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM unified_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Comentários
COMMENT ON TABLE clinics IS 'Tabela de clínicas para suporte multi-tenant';
COMMENT ON COLUMN clinics.subscription_status IS 'Status da assinatura: trial, active, suspended, cancelled';
COMMENT ON COLUMN clinics.settings IS 'Configurações específicas da clínica em formato JSON';

COMMIT;
