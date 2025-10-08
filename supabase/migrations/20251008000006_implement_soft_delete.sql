-- ============================================================================
-- MIGRAÇÃO: SOFT DELETE PARA DADOS CRÍTICOS
-- Data: 2025-10-08
-- Descrição: Implementa soft delete para evitar perda acidental de dados críticos
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ADICIONAR CAMPOS DELETED_AT ÀS TABELAS CRÍTICAS
-- ============================================================================

-- Patients (já pode ter, adicionar se não existir)
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Appointments
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Clinical Documents
ALTER TABLE clinical_documents 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Initial Assessments
ALTER TABLE initial_assessments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Session Evolutions
ALTER TABLE session_evolutions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Exercises
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Exercise Protocols
ALTER TABLE exercise_protocols
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Patient Exercise Prescriptions
ALTER TABLE patient_exercise_prescriptions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- Clinics
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES unified_users(id);

-- ============================================================================
-- 2. ÍNDICES PARA SOFT DELETE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patients_not_deleted 
  ON patients(id, clinic_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_not_deleted 
  ON appointments(id, patient_id, therapist_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_docs_not_deleted 
  ON clinical_documents(id, patient_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_initial_assessments_not_deleted
  ON initial_assessments(id, patient_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_evolutions_not_deleted
  ON session_evolutions(id, patient_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_exercises_not_deleted
  ON exercises(id, category) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_exercise_protocols_not_deleted
  ON exercise_protocols(id, category) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_prescriptions_not_deleted
  ON patient_exercise_prescriptions(id, patient_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinics_not_deleted
  ON clinics(id) WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. VIEWS PARA DADOS ATIVOS
-- ============================================================================

-- Active Patients
CREATE OR REPLACE VIEW active_patients AS
SELECT * FROM patients WHERE deleted_at IS NULL;

-- Active Appointments
CREATE OR REPLACE VIEW active_appointments AS
SELECT * FROM appointments WHERE deleted_at IS NULL;

-- Active Clinical Documents
CREATE OR REPLACE VIEW active_clinical_documents AS
SELECT * FROM clinical_documents WHERE deleted_at IS NULL;

-- Active Exercises
CREATE OR REPLACE VIEW active_exercises AS
SELECT * FROM exercises WHERE deleted_at IS NULL AND is_active = TRUE;

-- Active Exercise Protocols
CREATE OR REPLACE VIEW active_exercise_protocols AS
SELECT * FROM exercise_protocols WHERE deleted_at IS NULL AND is_active = TRUE;

-- Active Prescriptions
CREATE OR REPLACE VIEW active_prescriptions AS
SELECT * FROM patient_exercise_prescriptions WHERE deleted_at IS NULL;

-- Active Clinics
CREATE OR REPLACE VIEW active_clinics AS
SELECT * FROM clinics WHERE deleted_at IS NULL AND is_active = TRUE;

-- ============================================================================
-- 4. FUNÇÃO PARA SOFT DELETE
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete_record(
  p_table TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
  rows_affected INTEGER;
BEGIN
  -- Validar nome da tabela
  IF p_table NOT IN (
    'patients', 'appointments', 'clinical_documents', 
    'initial_assessments', 'session_evolutions',
    'exercises', 'exercise_protocols', 'patient_exercise_prescriptions',
    'clinics'
  ) THEN
    RAISE EXCEPTION 'Tabela não suportada para soft delete: %', p_table;
  END IF;
  
  -- Construir e executar query
  sql_query := format(
    'UPDATE %I SET deleted_at = NOW(), deleted_by = auth.uid() WHERE id = $1 AND deleted_at IS NULL',
    p_table
  );
  
  EXECUTE sql_query USING p_record_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Registrar na auditoria
  INSERT INTO audit_trail (
    table_name,
    record_id,
    action,
    performed_by,
    details
  ) VALUES (
    p_table,
    p_record_id,
    'soft_delete',
    auth.uid(),
    jsonb_build_object('operation', 'soft_delete')
  );
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNÇÃO PARA RESTAURAR REGISTRO
-- ============================================================================

CREATE OR REPLACE FUNCTION restore_deleted_record(
  p_table TEXT,
  p_record_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  sql_query TEXT;
  rows_affected INTEGER;
BEGIN
  -- Validar nome da tabela
  IF p_table NOT IN (
    'patients', 'appointments', 'clinical_documents', 
    'initial_assessments', 'session_evolutions',
    'exercises', 'exercise_protocols', 'patient_exercise_prescriptions',
    'clinics'
  ) THEN
    RAISE EXCEPTION 'Tabela não suportada para restauração: %', p_table;
  END IF;
  
  -- Construir e executar query
  sql_query := format(
    'UPDATE %I SET deleted_at = NULL, deleted_by = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    p_table
  );
  
  EXECUTE sql_query USING p_record_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Registrar na auditoria
  INSERT INTO audit_trail (
    table_name,
    record_id,
    action,
    performed_by,
    details
  ) VALUES (
    p_table,
    p_record_id,
    'restore',
    auth.uid(),
    jsonb_build_object('operation', 'restore_from_soft_delete')
  );
  
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. FUNÇÃO PARA LISTAR REGISTROS DELETADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION list_deleted_records(
  p_table TEXT,
  p_days_ago INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by_name TEXT
) AS $$
DECLARE
  sql_query TEXT;
BEGIN
  -- Validar nome da tabela
  IF p_table NOT IN (
    'patients', 'appointments', 'clinical_documents', 
    'initial_assessments', 'session_evolutions',
    'exercises', 'exercise_protocols', 'patient_exercise_prescriptions',
    'clinics'
  ) THEN
    RAISE EXCEPTION 'Tabela não suportada: %', p_table;
  END IF;
  
  -- Construir query dinâmica
  sql_query := format(
    'SELECT t.id, t.deleted_at, u.full_name AS deleted_by_name
     FROM %I t
     LEFT JOIN unified_users u ON u.id = t.deleted_by
     WHERE t.deleted_at IS NOT NULL
       AND t.deleted_at > NOW() - INTERVAL ''%s days''
     ORDER BY t.deleted_at DESC
     LIMIT %s',
    p_table,
    p_days_ago,
    p_limit
  );
  
  RETURN QUERY EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. FUNÇÃO PARA LIMPEZA AUTOMÁTICA (HARD DELETE APÓS X DIAS)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_soft_deleted_records(
  p_table TEXT,
  p_days_retention INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  sql_query TEXT;
  rows_deleted INTEGER;
BEGIN
  -- Validar nome da tabela
  IF p_table NOT IN (
    'appointments', 'exercises', 'exercise_protocols'
  ) THEN
    RAISE EXCEPTION 'Tabela não permitida para hard delete automático: %', p_table;
  END IF;
  
  -- Construir e executar query
  sql_query := format(
    'DELETE FROM %I WHERE deleted_at < NOW() - INTERVAL ''%s days''',
    p_table,
    p_days_retention
  );
  
  EXECUTE sql_query;
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  -- Registrar na auditoria
  INSERT INTO audit_trail (
    table_name,
    action,
    performed_by,
    details
  ) VALUES (
    p_table,
    'cleanup_hard_delete',
    auth.uid(),
    jsonb_build_object(
      'operation', 'cleanup_old_soft_deleted',
      'days_retention', p_days_retention,
      'rows_deleted', rows_deleted
    )
  );
  
  RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ATUALIZAR RLS POLICIES PARA CONSIDERAR SOFT DELETE
-- ============================================================================

-- Patients
DROP POLICY IF EXISTS "users_view_clinic_patients" ON patients;
CREATE POLICY "users_view_clinic_patients" ON patients
  FOR SELECT USING (
    deleted_at IS NULL AND (
      created_by = auth.uid() OR
      clinic_id IN (
        SELECT clinic_id FROM unified_users WHERE id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM unified_users WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Appointments
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
CREATE POLICY "users_view_appointments" ON appointments
  FOR SELECT USING (
    deleted_at IS NULL AND (
      therapist_id = auth.uid() OR
      patient_id IN (
        SELECT id FROM patients WHERE user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM unified_users WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Clinical Documents
DROP POLICY IF EXISTS "Users can view their own clinical documents" ON clinical_documents;
CREATE POLICY "users_view_clinical_documents" ON clinical_documents
  FOR SELECT USING (
    deleted_at IS NULL AND (
      created_by = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM appointments a 
        WHERE a.patient_id = clinical_documents.patient_id 
          AND a.therapist_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 9. TRIGGER PARA PREVENIR HARD DELETE DE DADOS CRÍTICOS
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_hard_delete_critical_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Permitir hard delete apenas se já foi soft deleted há mais de 90 dias
  IF OLD.deleted_at IS NULL OR OLD.deleted_at > NOW() - INTERVAL '90 days' THEN
    RAISE EXCEPTION 'Hard delete não permitido. Use soft delete (deleted_at) ou aguarde 90 dias após soft delete.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas críticas
DROP TRIGGER IF EXISTS prevent_hard_delete_patients ON patients;
CREATE TRIGGER prevent_hard_delete_patients
  BEFORE DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_critical_data();

DROP TRIGGER IF EXISTS prevent_hard_delete_clinical_docs ON clinical_documents;
CREATE TRIGGER prevent_hard_delete_clinical_docs
  BEFORE DELETE ON clinical_documents
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_critical_data();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION soft_delete_record(TEXT, UUID) IS 'Marca registro como deletado sem remover fisicamente do banco';
COMMENT ON FUNCTION restore_deleted_record(TEXT, UUID) IS 'Restaura registro previamente soft deleted';
COMMENT ON FUNCTION list_deleted_records(TEXT, INTEGER, INTEGER) IS 'Lista registros deletados nos últimos N dias';
COMMENT ON FUNCTION cleanup_old_soft_deleted_records(TEXT, INTEGER) IS 'Remove permanentemente registros soft deleted há mais de N dias';
COMMENT ON FUNCTION prevent_hard_delete_critical_data() IS 'Previne hard delete acidental de dados críticos';

COMMIT;
