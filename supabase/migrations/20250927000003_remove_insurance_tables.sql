-- =====================================================
-- 🚫 REMOÇÃO DE TABELAS E CAMPOS RELACIONADOS A CONVÊNIOS
-- =====================================================
-- Esta migração remove completamente todas as referências a convênios/insurance
-- conforme a política anti-convênios do sistema

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS public.insurance_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.insurance_providers DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS das tabelas de convênios
DROP POLICY IF EXISTS insurance_providers_select_policy ON public.insurance_providers;
DROP POLICY IF EXISTS insurance_providers_insert_policy ON public.insurance_providers;
DROP POLICY IF EXISTS insurance_providers_update_policy ON public.insurance_providers;
DROP POLICY IF EXISTS insurance_providers_delete_policy ON public.insurance_providers;

DROP POLICY IF EXISTS insurance_claims_select_policy ON public.insurance_claims;
DROP POLICY IF EXISTS insurance_claims_insert_policy ON public.insurance_claims;
DROP POLICY IF EXISTS insurance_claims_update_policy ON public.insurance_claims;
DROP POLICY IF EXISTS insurance_claims_delete_policy ON public.insurance_claims;

-- Remover índices das tabelas de convênios
DROP INDEX IF EXISTS idx_insurance_providers_code;
DROP INDEX IF EXISTS idx_insurance_providers_name;
DROP INDEX IF EXISTS idx_insurance_claims_insurance_provider_id;
DROP INDEX IF EXISTS idx_insurance_claims_patient_id;
DROP INDEX IF EXISTS idx_insurance_claims_submitted_by;
DROP INDEX IF EXISTS idx_financial_transactions_insurance_claim_id;

-- Remover foreign keys que referenciam tabelas de convênios
ALTER TABLE IF EXISTS public.financial_transactions 
DROP CONSTRAINT IF EXISTS financial_transactions_insurance_claim_id_fkey;

ALTER TABLE IF EXISTS public.insurance_claims 
DROP CONSTRAINT IF EXISTS insurance_claims_insurance_provider_id_fkey;

-- Remover tabelas de convênios completamente
DROP TABLE IF EXISTS public.insurance_claims CASCADE;
DROP TABLE IF EXISTS public.insurance_providers CASCADE;

-- Remover campos relacionados a convênios da tabela patients
ALTER TABLE IF EXISTS public.patients 
DROP COLUMN IF EXISTS insurance_provider,
DROP COLUMN IF EXISTS insurance_plan,
DROP COLUMN IF EXISTS insurance_number,
DROP COLUMN IF EXISTS insurance_validity,
DROP COLUMN IF EXISTS insurance_info;

-- Remover campos relacionados a convênios da tabela appointments
ALTER TABLE IF EXISTS public.appointments 
DROP COLUMN IF EXISTS insurance_covered,
DROP COLUMN IF EXISTS insurance_authorization;

-- Remover campos relacionados a convênios da tabela financial_transactions
ALTER TABLE IF EXISTS public.financial_transactions 
DROP COLUMN IF EXISTS insurance_claim_id;

-- Atualizar constraints de payment_method para remover 'insurance'
ALTER TABLE IF EXISTS public.financial_transactions 
DROP CONSTRAINT IF EXISTS financial_transactions_payment_method_check;

ALTER TABLE IF EXISTS public.financial_transactions 
ADD CONSTRAINT financial_transactions_payment_method_check 
CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check', 'voucher'));

-- Atualizar constraints de transaction_type para remover tipos relacionados a convênios
ALTER TABLE IF EXISTS public.financial_transactions 
DROP CONSTRAINT IF EXISTS financial_transactions_transaction_type_check;

ALTER TABLE IF EXISTS public.financial_transactions 
ADD CONSTRAINT financial_transactions_transaction_type_check 
CHECK (transaction_type IN ('payment', 'refund', 'adjustment'));

-- Comentário explicativo sobre a política anti-convênios
COMMENT ON TABLE public.patients IS 'Tabela de pacientes - Sistema trabalha EXCLUSIVAMENTE com atendimento particular. NUNCA aceita convênios.';
COMMENT ON TABLE public.appointments IS 'Tabela de agendamentos - Sistema trabalha EXCLUSIVAMENTE com atendimento particular. NUNCA aceita convênios.';
COMMENT ON TABLE public.financial_transactions IS 'Tabela de transações financeiras - Sistema trabalha EXCLUSIVAMENTE com atendimento particular. NUNCA aceita convênios.';

-- Criar função para validar política anti-convênios
CREATE OR REPLACE FUNCTION validate_no_insurance_policy()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se algum campo contém palavras relacionadas a convênios
  IF (
    (TG_TABLE_NAME = 'patients' AND (
      NEW.insurance_provider IS NOT NULL OR
      NEW.insurance_plan IS NOT NULL OR
      NEW.insurance_number IS NOT NULL OR
      NEW.insurance_validity IS NOT NULL OR
      NEW.insurance_info IS NOT NULL
    )) OR
    (TG_TABLE_NAME = 'appointments' AND (
      NEW.insurance_covered = true OR
      NEW.insurance_authorization IS NOT NULL
    )) OR
    (TG_TABLE_NAME = 'financial_transactions' AND (
      NEW.payment_method = 'insurance' OR
      NEW.transaction_type IN ('insurance_claim', 'insurance_payment') OR
      NEW.insurance_claim_id IS NOT NULL
    ))
  ) THEN
    RAISE EXCEPTION '🚫 VIOLAÇÃO DA POLÍTICA ANTI-CONVÊNIOS: Sistema não atende convênios ou planos de saúde. Esta é uma regra fundamental do negócio que NÃO pode ser alterada.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para aplicar a validação
DROP TRIGGER IF EXISTS trigger_validate_no_insurance_patients ON public.patients;
DROP TRIGGER IF EXISTS trigger_validate_no_insurance_appointments ON public.appointments;
DROP TRIGGER IF EXISTS trigger_validate_no_insurance_financial_transactions ON public.financial_transactions;

CREATE TRIGGER trigger_validate_no_insurance_patients
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION validate_no_insurance_policy();

CREATE TRIGGER trigger_validate_no_insurance_appointments
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION validate_no_insurance_policy();

CREATE TRIGGER trigger_validate_no_insurance_financial_transactions
  BEFORE INSERT OR UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION validate_no_insurance_policy();

-- Atualizar comentários das tabelas principais
COMMENT ON FUNCTION validate_no_insurance_policy() IS 'Função que valida a política anti-convênios do sistema. NUNCA permite dados relacionados a convênios ou planos de saúde.';

-- Migração concluída: Política anti-convênios implementada
