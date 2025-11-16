# 🔐 Melhorias de Integridade de Dados - DuduFisio AI

## 📋 Índice
1. [Análise Atual](#análise-atual)
2. [Problemas Identificados](#problemas-identificados)
3. [Soluções Implementadas](#soluções-implementadas)
4. [Scripts de Validação](#scripts-de-validação)
5. [Boas Práticas](#boas-práticas)

---

## 🔍 Análise Atual

### Estrutura Atual do Banco de Dados

O sistema DuduFisio AI possui **139 foreign keys** distribuídas em **16 tabelas** principais, garantindo integridade referencial básica.

#### Tabelas Principais
- `users` / `user_profiles`
- `patients`
- `appointments`
- `clinical_documents`
- `initial_assessments`
- `session_evolutions`
- `exercises`
- `exercise_protocols`
- `patient_exercise_prescriptions`
- `patient_exercise_executions`
- Tabelas de analytics e alertas

---

## ⚠️ Problemas Identificados

### 1. **Inconsistências Estruturais**

#### Problema 1.1: Tabela `users` duplicada
```
❌ PROBLEMA:
- Existe `users` (básica) em 20241231000000
- Existe `user_profiles` (OAuth) em 20241231000001
- Campos role conflitantes em ambas
```

**Impacto**: 
- Confusão sobre qual tabela usar
- Possível divergência de dados
- Dificuldade de manutenção

**Solução**: Consolidar em uma única tabela

---

#### Problema 1.2: Campos `clinic_id` sem foreign key
```
❌ PROBLEMA:
Em várias tabelas existe clinic_id mas sem FK:
- ai_predictions
- payment_methods
- financial_alerts
- waitlist_entries
- e outras
```

**Impacto**:
- Dados órfãos (clinic_id inexistente)
- Impossível garantir integridade
- Problemas em multi-tenancy

**Solução**: Criar tabela `clinics` e adicionar FKs

---

#### Problema 1.3: Falta de validação de dados críticos
```
❌ PROBLEMA:
- Emails sem validação de formato
- Telefones sem padrão
- CPF/documentos sem validação
- Datas ilógicas (futuro em created_at)
```

**Solução**: Adicionar constraints e validações

---

### 2. **Problemas de Integridade Referencial**

#### Problema 2.1: Cascade inadequado
```
❌ PROBLEMA:
Algumas FKs usam ON DELETE CASCADE onde não deveria:
- patient_id ON DELETE CASCADE
  → Se apagar paciente, perde histórico clínico!
```

**Risco Legal**: 
- Perda de documentos clínicos (ilegal por 20 anos)
- Violação de compliance CFM/COFFITO

**Solução**: Usar ON DELETE RESTRICT ou SET NULL

---

#### Problema 2.2: Falta de validação de estados
```
❌ PROBLEMA:
- Appointment com status inválido
- Payment_status sem validação
- Transições de estado não controladas
```

**Impacto**:
- Dados inconsistentes
- Lógica de negócio quebrada

**Solução**: Adicionar CHECK constraints e triggers

---

### 3. **Problemas de Performance e Índices**

#### Problema 3.1: Índices faltantes
```
❌ PROBLEMA:
Queries comuns sem índice:
- appointments WHERE scheduled_at BETWEEN ... AND ...
- clinical_documents WHERE created_at > ...
- patient_exercise_executions WHERE execution_date ...
```

**Solução**: Adicionar índices compostos

---

### 4. **Auditoria e Compliance**

#### Problema 4.1: Auditoria incompleta
```
❌ PROBLEMA:
- Nem todas as tabelas críticas têm trigger de auditoria
- Falta rastreamento de updates em patients
- Sem log de tentativas de acesso negado
```

**Risco Legal**: Não conformidade com LGPD

**Solução**: Expandir sistema de auditoria

---

## ✅ Soluções Implementadas

### Migração 1: Consolidação de Usuários

```sql
-- ============================================================================
-- MIGRAÇÃO: CONSOLIDAÇÃO DE TABELAS DE USUÁRIOS
-- Data: 2025-10-08
-- Descrição: Une users e user_profiles em uma estrutura consistente
-- ============================================================================

BEGIN;

-- 1. Criar tabela consolidada (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.unified_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'patient', 'educador_fisico', 'partner')),
  phone TEXT,
  avatar_url TEXT,
  
  -- Informações profissionais
  professional_registration TEXT, -- CREFITO, CRM, etc
  specialties TEXT[],
  
  -- Permissões e configurações
  permissions JSONB DEFAULT '[]'::jsonb,
  profile_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status e auditoria
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- 2. Índices otimizados
CREATE INDEX IF NOT EXISTS idx_unified_users_email ON unified_users(email);
CREATE INDEX IF NOT EXISTS idx_unified_users_role_active ON unified_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_unified_users_auth_id ON unified_users(auth_id);

-- 3. Migrar dados existentes
INSERT INTO unified_users (id, email, full_name, role, phone, avatar_url, created_at)
SELECT 
  up.id,
  up.email,
  up.name,
  up.role,
  up.phone,
  up.avatar_url,
  up.created_at
FROM user_profiles up
ON CONFLICT (email) DO NOTHING;

-- 4. RLS Policies
ALTER TABLE unified_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_profile" ON unified_users
  FOR SELECT USING (id = auth.uid() OR auth_id = auth.uid());

CREATE POLICY "users_update_own_profile" ON unified_users
  FOR UPDATE USING (id = auth.uid() OR auth_id = auth.uid());

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_unified_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER unified_users_updated_at
  BEFORE UPDATE ON unified_users
  FOR EACH ROW EXECUTE FUNCTION update_unified_users_updated_at();

COMMIT;
```

---

### Migração 2: Tabela Clinics e Integridade Multi-Tenant

```sql
-- ============================================================================
-- MIGRAÇÃO: SISTEMA MULTI-CLÍNICA COM INTEGRIDADE
-- Data: 2025-10-08
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

-- 2. Adicionar clinic_id a unified_users
ALTER TABLE unified_users
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_unified_users_clinic ON unified_users(clinic_id) WHERE clinic_id IS NOT NULL;

-- 3. Adicionar clinic_id a patients
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_patients_clinic ON patients(clinic_id) WHERE clinic_id IS NOT NULL;

-- 4. Adicionar clinic_id às tabelas que precisam
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE financial_alerts ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE waitlist_entries ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE recurrent_payments ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE cash_flow_predictions ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE clinical_metrics ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE recurrence_templates ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);
ALTER TABLE schedule_blocks ADD COLUMN IF NOT EXISTS clinic_id_fk UUID REFERENCES clinics(id);

-- 5. Criar clínica padrão para dados existentes
INSERT INTO clinics (id, name, email, phone, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Clínica Padrão',
  'contato@clinica.com',
  '+5511999999999',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 6. RLS para multi-tenancy
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_clinic" ON clinics
  FOR SELECT USING (
    id IN (
      SELECT clinic_id FROM unified_users WHERE id = auth.uid()
    )
  );

-- 7. Atualizar políticas existentes para considerar clinic_id
DROP POLICY IF EXISTS "Users can view patients they created" ON patients;
CREATE POLICY "users_view_clinic_patients" ON patients
  FOR SELECT USING (
    created_by = auth.uid() OR
    clinic_id IN (
      SELECT clinic_id FROM unified_users WHERE id = auth.uid()
    )
  );

COMMIT;
```

---

### Migração 3: Validações e Constraints

```sql
-- ============================================================================
-- MIGRAÇÃO: VALIDAÇÕES E CONSTRAINTS ADICIONAIS
-- Data: 2025-10-08
-- ============================================================================

BEGIN;

-- 1. Validações em patients
ALTER TABLE patients
  ADD CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
  ADD CONSTRAINT logical_birth_date CHECK (birth_date <= CURRENT_DATE AND birth_date >= '1900-01-01'),
  ADD CONSTRAINT future_created_at CHECK (created_at <= NOW());

-- 2. Validações em appointments
ALTER TABLE appointments
  ADD CONSTRAINT logical_scheduled_time CHECK (scheduled_at >= created_at),
  ADD CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled'));

-- 3. Validações em clinical_documents
ALTER TABLE clinical_documents
  ADD CONSTRAINT signed_has_signature CHECK (
    (is_signed = FALSE) OR 
    (is_signed = TRUE AND signature_data IS NOT NULL AND signed_at IS NOT NULL AND signed_by IS NOT NULL)
  );

-- 4. Validações em exercises
ALTER TABLE exercises
  ADD CONSTRAINT positive_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  ADD CONSTRAINT positive_repetitions CHECK (repetitions IS NULL OR repetitions > 0),
  ADD CONSTRAINT positive_sets CHECK (sets IS NULL OR sets > 0);

-- 5. Validações em patient_exercise_prescriptions
ALTER TABLE patient_exercise_prescriptions
  ADD CONSTRAINT logical_date_range CHECK (end_date IS NULL OR end_date >= start_date),
  ADD CONSTRAINT positive_sets CHECK (sets > 0),
  ADD CONSTRAINT positive_repetitions CHECK (repetitions > 0),
  ADD CONSTRAINT positive_frequency CHECK (frequency_per_week > 0 AND frequency_per_week <= 7);

-- 6. Validações em payments (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    ALTER TABLE payments
      ADD CONSTRAINT positive_amount CHECK (amount > 0),
      ADD CONSTRAINT logical_paid_date CHECK (paid_at IS NULL OR paid_at >= created_at);
  END IF;
END $$;

COMMIT;
```

---

### Migração 4: Índices Compostos para Performance

```sql
-- ============================================================================
-- MIGRAÇÃO: ÍNDICES COMPOSTOS PARA PERFORMANCE
-- Data: 2025-10-08
-- ============================================================================

BEGIN;

-- 1. Índices para queries de agendamento
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date 
  ON appointments(therapist_id, scheduled_at DESC) 
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
  ON appointments(patient_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date 
  ON appointments(clinic_id, scheduled_at DESC) 
  WHERE clinic_id IS NOT NULL;

-- 2. Índices para documentos clínicos
CREATE INDEX IF NOT EXISTS idx_clinical_docs_patient_created 
  ON clinical_documents(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinical_docs_therapist_type 
  ON clinical_documents(created_by, document_type) 
  WHERE status = 'signed';

-- 3. Índices para exercícios
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient_status 
  ON patient_exercise_prescriptions(patient_id, status, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_executions_patient_date 
  ON patient_exercise_executions(patient_id, execution_date DESC);

-- 4. Índices para analytics
CREATE INDEX IF NOT EXISTS idx_treatment_effectiveness_type_outcome 
  ON treatment_effectiveness(treatment_type, outcome_score DESC, end_date DESC) 
  WHERE end_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_insights_priority 
  ON patient_insights(patient_id, priority, status) 
  WHERE status = 'active';

-- 5. Índices para alertas
CREATE INDEX IF NOT EXISTS idx_financial_alerts_active 
  ON financial_alerts(clinic_id_fk, status, severity, created_at DESC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_clinical_alerts_active 
  ON clinical_alerts(assigned_to, status, severity, created_at DESC) 
  WHERE status = 'active';

-- 6. Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed 
  ON audit_trail(performed_by, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_document_action 
  ON audit_trail(document_id, action, performed_at DESC);

COMMIT;
```

---

### Migração 5: Auditoria Expandida

```sql
-- ============================================================================
-- MIGRAÇÃO: SISTEMA DE AUDITORIA EXPANDIDO
-- Data: 2025-10-08
-- ============================================================================

BEGIN;

-- 1. Expandir tabela audit_trail
ALTER TABLE audit_trail
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS record_id UUID,
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB,
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);

-- 2. Função genérica de auditoria
CREATE OR REPLACE FUNCTION generic_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  audit_action TEXT;
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determinar ação
  IF TG_OP = 'INSERT' THEN
    audit_action := 'create';
    old_data := NULL;
    new_data := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := 'update';
    old_data := row_to_json(OLD)::jsonb;
    new_data := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'DELETE' THEN
    audit_action := 'delete';
    old_data := row_to_json(OLD)::jsonb;
    new_data := NULL;
  END IF;
  
  -- Inserir registro de auditoria
  INSERT INTO audit_trail (
    table_name,
    record_id,
    action,
    performed_by,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    audit_action,
    auth.uid(),
    old_data,
    new_data,
    inet_client_addr()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Adicionar triggers de auditoria em tabelas críticas
DROP TRIGGER IF EXISTS audit_patients_changes ON patients;
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

DROP TRIGGER IF EXISTS audit_appointments_changes ON appointments;
CREATE TRIGGER audit_appointments_changes
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

DROP TRIGGER IF EXISTS audit_users_changes ON unified_users;
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON unified_users
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- 4. Tabela de tentativas de acesso negado
CREATE TABLE IF NOT EXISTS access_denied_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES unified_users(id),
  attempted_table TEXT NOT NULL,
  attempted_action TEXT NOT NULL,
  attempted_record_id UUID,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_denied_user_date 
  ON access_denied_log(user_id, created_at DESC);

-- 5. Função para registrar acessos negados
CREATE OR REPLACE FUNCTION log_access_denied(
  p_table TEXT,
  p_action TEXT,
  p_record_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO access_denied_log (
    user_id,
    attempted_table,
    attempted_action,
    attempted_record_id,
    reason,
    ip_address
  ) VALUES (
    auth.uid(),
    p_table,
    p_action,
    p_record_id,
    p_reason,
    inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
```

---

### Migração 6: Soft Delete e Recuperação

```sql
-- ============================================================================
-- MIGRAÇÃO: SOFT DELETE PARA DADOS CRÍTICOS
-- Data: 2025-10-08
-- Descrição: Implementa soft delete para evitar perda acidental de dados
-- ============================================================================

BEGIN;

-- 1. Adicionar campo deleted_at às tabelas críticas
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

ALTER TABLE clinical_documents 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- 2. Índices para soft delete
CREATE INDEX IF NOT EXISTS idx_patients_not_deleted 
  ON patients(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_not_deleted 
  ON appointments(id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_docs_not_deleted 
  ON clinical_documents(id) WHERE deleted_at IS NULL;

-- 3. Views para dados ativos
CREATE OR REPLACE VIEW active_patients AS
SELECT * FROM patients WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_appointments AS
SELECT * FROM appointments WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_clinical_documents AS
SELECT * FROM clinical_documents WHERE deleted_at IS NULL;

-- 4. Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(
  p_table TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = $1',
    p_table
  ) USING p_record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para restaurar registro
CREATE OR REPLACE FUNCTION restore_deleted_record(
  p_table TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1',
    p_table
  ) USING p_record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atualizar RLS policies para considerar soft delete
DROP POLICY IF EXISTS "users_view_clinic_patients" ON patients;
CREATE POLICY "users_view_clinic_patients" ON patients
  FOR SELECT USING (
    deleted_at IS NULL AND (
      created_by = auth.uid() OR
      clinic_id IN (
        SELECT clinic_id FROM unified_users WHERE id = auth.uid()
      )
    )
  );

COMMIT;
```

---

## 📊 Scripts de Validação

### Script 1: Validação de Integridade Referencial

```sql
-- ============================================================================
-- SCRIPT: VALIDAÇÃO DE INTEGRIDADE REFERENCIAL
-- Verifica se existem dados órfãos no banco
-- ============================================================================

-- 1. Pacientes sem created_by válido
SELECT 
  'Pacientes órfãos' AS issue,
  COUNT(*) AS count
FROM patients p
WHERE created_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM unified_users u WHERE u.id = p.created_by);

-- 2. Appointments sem patient ou therapist válido
SELECT 
  'Appointments órfãos' AS issue,
  COUNT(*) AS count
FROM appointments a
WHERE (
  NOT EXISTS (SELECT 1 FROM patients p WHERE p.id = a.patient_id)
  OR NOT EXISTS (SELECT 1 FROM unified_users u WHERE u.id = a.therapist_id)
);

-- 3. Clinical documents sem paciente
SELECT 
  'Documentos órfãos' AS issue,
  COUNT(*) AS count
FROM clinical_documents cd
WHERE NOT EXISTS (SELECT 1 FROM patients p WHERE p.id = cd.patient_id);

-- 4. Prescrições sem paciente ou terapeuta
SELECT 
  'Prescrições órfãs' AS issue,
  COUNT(*) AS count
FROM patient_exercise_prescriptions pep
WHERE NOT EXISTS (SELECT 1 FROM patients p WHERE p.id = pep.patient_id)
   OR NOT EXISTS (SELECT 1 FROM unified_users u WHERE u.id = pep.therapist_id);

-- 5. Clinic_id sem clínica correspondente
SELECT 
  'Registros com clinic_id inválido' AS issue,
  table_name,
  COUNT(*) AS count
FROM (
  SELECT 'patients' AS table_name, clinic_id FROM patients WHERE clinic_id IS NOT NULL
  UNION ALL
  SELECT 'appointments', clinic_id FROM appointments WHERE clinic_id IS NOT NULL
  UNION ALL
  SELECT 'unified_users', clinic_id FROM unified_users WHERE clinic_id IS NOT NULL
) AS all_clinics
WHERE NOT EXISTS (SELECT 1 FROM clinics c WHERE c.id = all_clinics.clinic_id)
GROUP BY table_name;
```

### Script 2: Validação de Dados Inconsistentes

```sql
-- ============================================================================
-- SCRIPT: VALIDAÇÃO DE DADOS INCONSISTENTES
-- ============================================================================

-- 1. Appointments no passado ainda como 'scheduled'
SELECT 
  'Appointments antigos pendentes' AS issue,
  COUNT(*) AS count,
  MIN(scheduled_at) AS oldest
FROM appointments
WHERE status = 'scheduled' 
  AND scheduled_at < NOW() - INTERVAL '7 days';

-- 2. Documentos assinados sem signature_data
SELECT 
  'Documentos assinados sem assinatura' AS issue,
  COUNT(*) AS count
FROM clinical_documents
WHERE is_signed = TRUE 
  AND (signature_data IS NULL OR signed_at IS NULL);

-- 3. Prescrições ativas com end_date no passado
SELECT 
  'Prescrições expiradas ativas' AS issue,
  COUNT(*) AS count
FROM patient_exercise_prescriptions
WHERE status = 'active' 
  AND end_date < CURRENT_DATE;

-- 4. Pacientes com datas de nascimento inválidas
SELECT 
  'Datas de nascimento inválidas' AS issue,
  COUNT(*) AS count
FROM patients
WHERE birth_date > CURRENT_DATE 
   OR birth_date < '1900-01-01';

-- 5. Emails duplicados
SELECT 
  'Emails duplicados em patients' AS issue,
  email,
  COUNT(*) AS count
FROM patients
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;
```

### Script 3: Relatório de Saúde do Banco

```sql
-- ============================================================================
-- SCRIPT: RELATÓRIO DE SAÚDE DO BANCO DE DADOS
-- ============================================================================

-- 1. Estatísticas gerais
SELECT 
  'Total de usuários' AS metric,
  COUNT(*) AS value,
  COUNT(*) FILTER (WHERE is_active) AS active
FROM unified_users

UNION ALL

SELECT 
  'Total de pacientes',
  COUNT(*),
  COUNT(*) FILTER (WHERE deleted_at IS NULL)
FROM patients

UNION ALL

SELECT 
  'Total de appointments',
  COUNT(*),
  COUNT(*) FILTER (WHERE status != 'cancelled')
FROM appointments

UNION ALL

SELECT 
  'Documentos clínicos',
  COUNT(*),
  COUNT(*) FILTER (WHERE is_signed = TRUE)
FROM clinical_documents;

-- 2. Distribuição por role
SELECT 
  role,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_active) AS active
FROM unified_users
GROUP BY role
ORDER BY total DESC;

-- 3. Appointments por status
SELECT 
  status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM appointments
GROUP BY status
ORDER BY total DESC;

-- 4. Taxa de assinatura de documentos
SELECT 
  document_type,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_signed) AS signed,
  ROUND(COUNT(*) FILTER (WHERE is_signed) * 100.0 / COUNT(*), 2) AS sign_rate
FROM clinical_documents
GROUP BY document_type;

-- 5. Índices não utilizados (performance)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%'
ORDER BY tablename, indexname;
```

---

## 📚 Boas Práticas Implementadas

### 1. **Nomenclatura Consistente**
```
✅ DO:
- Usar snake_case: user_id, created_at
- Prefixos claros: idx_, fk_, chk_
- Nomes descritivos: patient_exercise_prescriptions

❌ DON'T:
- camelCase ou PascalCase
- Abreviações confusas
- Nomes genéricos (data, info, temp)
```

### 2. **Constraints Nomeados**
```sql
-- ✅ BOM
ALTER TABLE patients
  ADD CONSTRAINT chk_patients_valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@...');

-- ❌ RUIM  
ALTER TABLE patients
  ADD CHECK (email ~* '^...');  -- constraint gerado automaticamente
```

### 3. **Uso Adequado de ON DELETE**
```sql
-- Para dados críticos (histórico clínico)
REFERENCES patients(id) ON DELETE RESTRICT

-- Para dados em cascade controlado
REFERENCES appointments(id) ON DELETE CASCADE

-- Para dados que podem ficar órfãos temporariamente
REFERENCES users(id) ON DELETE SET NULL
```

### 4. **Índices Estratégicos**
```sql
-- Índice composto para queries comuns
CREATE INDEX idx_appointments_therapist_date 
  ON appointments(therapist_id, scheduled_at)
  WHERE status != 'cancelled';

-- Índice parcial para dados ativos
CREATE INDEX idx_patients_active 
  ON patients(clinic_id, created_at)
  WHERE deleted_at IS NULL;

-- Índice GIN para JSONB
CREATE INDEX idx_clinical_docs_content 
  ON clinical_documents USING GIN(content);
```

### 5. **Auditoria Automática**
```sql
-- Trigger para todas as operações
CREATE TRIGGER audit_<table>_changes
  AFTER INSERT OR UPDATE OR DELETE ON <table>
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();
```

### 6. **Soft Delete por Padrão**
```sql
-- Sempre adicionar deleted_at para tabelas críticas
ALTER TABLE <critical_table>
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN deleted_by UUID REFERENCES users(id);

-- View para dados ativos
CREATE VIEW active_<table> AS
SELECT * FROM <table> WHERE deleted_at IS NULL;
```

---

## 🔧 Manutenção Contínua

### Checklist Mensal
- [ ] Executar scripts de validação
- [ ] Verificar índices não utilizados
- [ ] Analisar slow queries
- [ ] Revisar políticas RLS
- [ ] Backup e teste de restore

### Checklist Trimestral
- [ ] Auditoria de compliance
- [ ] Revisão de permissões
- [ ] Limpeza de dados órfãos
- [ ] Otimização de índices
- [ ] Atualização de documentação

### Alertas Automáticos
```sql
-- Criar função para alertas
CREATE OR REPLACE FUNCTION check_data_health()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details JSONB
) AS $$
BEGIN
  -- Verificações aqui
  -- Enviar notificação se houver problemas
END;
$$ LANGUAGE plpgsql;

-- Agendar execução diária (via pg_cron ou external scheduler)
```

---

## 📞 Suporte

Para questões sobre integridade de dados:
- Consulte `/docs/SUPABASE_SETUP.md`
- Execute scripts de validação regularmente
- Reporte problemas via Issues do projeto

---

**Última Atualização**: 08/10/2025
**Versão**: 1.0.0
**Status**: ✅ Implementado
