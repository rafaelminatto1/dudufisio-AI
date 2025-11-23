-- =====================================================
-- Migration: Add Extended Fields to Patients Table
-- Data: 2025-11-22
-- Descrição: Adiciona campos que estão sendo usados no código
--           mas não existem no schema atual
-- =====================================================

-- 1. Adicionar campos de informações pessoais
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- 2. Adicionar campos de contato
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 3. Adicionar campos complexos (JSONB)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';

-- 4. Adicionar campos clínicos
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS patient_origin TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'ativo', 'inativo'));

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name) WHERE full_name IS NOT NULL;

-- 6. Adicionar índice GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_patients_address_gin ON public.patients USING GIN (address) WHERE address IS NOT NULL AND address != '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_patients_emergency_contact_gin ON public.patients USING GIN (emergency_contact) WHERE emergency_contact IS NOT NULL AND emergency_contact != '{}'::jsonb;

-- 7. Comentários para documentação
COMMENT ON COLUMN public.patients.full_name IS 'Nome completo do paciente (pode ser diferente de name)';
COMMENT ON COLUMN public.patients.cpf IS 'CPF do paciente (formato: 000.000.000-00)';
COMMENT ON COLUMN public.patients.rg IS 'RG do paciente';
COMMENT ON COLUMN public.patients.gender IS 'Gênero: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN public.patients.marital_status IS 'Estado civil';
COMMENT ON COLUMN public.patients.occupation IS 'Profissão';
COMMENT ON COLUMN public.patients.whatsapp IS 'Número do WhatsApp';
COMMENT ON COLUMN public.patients.address IS 'Endereço em formato JSON: {street, number, complement, neighborhood, city, state, zipcode, country}';
COMMENT ON COLUMN public.patients.emergency_contact IS 'Contato de emergência em formato JSON: {name, phone, relationship, email}';
COMMENT ON COLUMN public.patients.patient_origin IS 'Como o paciente chegou à clínica (indicação, busca online, etc)';
COMMENT ON COLUMN public.patients.notes IS 'Observações gerais sobre o paciente';
COMMENT ON COLUMN public.patients.status IS 'Status do paciente: active/ativo, inactive/inativo, archived';

-- 8. Migrar dados existentes (se necessário)
-- Copiar 'name' para 'full_name' onde full_name está vazio
UPDATE public.patients
SET full_name = name
WHERE full_name IS NULL AND name IS NOT NULL;

-- Definir status padrão para registros existentes
UPDATE public.patients
SET status = 'active'
WHERE status IS NULL;

-- 9. Criar função para validar CPF (opcional)
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove caracteres não numéricos
  cpf := regexp_replace(cpf, '[^0-9]', '', 'g');

  -- Verifica se tem 11 dígitos
  IF length(cpf) != 11 THEN
    RETURN FALSE;
  END IF;

  -- Verifica se não são todos dígitos iguais
  IF cpf ~ '^(\d)\1{10}$' THEN
    RETURN FALSE;
  END IF;

  -- TODO: Implementar validação completa do CPF com dígitos verificadores
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_cpf(TEXT) IS 'Valida formato básico de CPF (11 dígitos, não todos iguais)';

-- 10. Criar view para facilitar queries
CREATE OR REPLACE VIEW public.patients_complete AS
SELECT
  p.*,
  p.full_name AS display_name,
  EXTRACT(YEAR FROM AGE(p.birth_date::date)) AS age,
  p.address->>'city' AS city,
  p.address->>'state' AS state,
  p.emergency_contact->>'name' AS emergency_name,
  p.emergency_contact->>'phone' AS emergency_phone
FROM public.patients p;

COMMENT ON VIEW public.patients_complete IS 'View que expõe campos JSONB como colunas para facilitar queries';

-- 11. Grant permissions (ajustar conforme necessário)
-- GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
-- GRANT SELECT ON public.patients_complete TO authenticated;
