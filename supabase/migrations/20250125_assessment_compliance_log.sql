-- ============================================================================
-- ASSESSMENT COMPLIANCE LOG - Registro de Conformidade de Avaliações
-- Migration criada em: 2025-01-25
-- Descrição: Sistema para registrar quando medições obrigatórias são ou não realizadas
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: assessment_compliance_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_compliance_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID, -- ID da sessão (se aplicável)
  test_config_id UUID, -- ID do teste obrigatório (se aplicável)
  
  -- Informações do teste
  test_name VARCHAR(255) NOT NULL,
  test_type VARCHAR(50), -- 'amplitude', 'strength', 'balance', 'functional', 'pain'
  
  -- Status da medição
  was_measured BOOLEAN NOT NULL DEFAULT false,
  skip_reason TEXT, -- Razão para não medir (se was_measured = false)
  measured_value JSONB, -- Valor medido (se was_measured = true)
  
  -- Timing
  timing VARCHAR(20) CHECK (timing IN ('before', 'during', 'after', 'independent')),
  session_number INTEGER,
  
  -- Auditoria
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID NOT NULL REFERENCES users(id),
  
  -- Metadados
  notes TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_patient 
  ON assessment_compliance_log(patient_id);

CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_session 
  ON assessment_compliance_log(session_id);

CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_test_config 
  ON assessment_compliance_log(test_config_id);

CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_recorded_at 
  ON assessment_compliance_log(recorded_at);

CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_was_measured 
  ON assessment_compliance_log(was_measured);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_assessment_compliance_log_patient_session 
  ON assessment_compliance_log(patient_id, session_id);

-- ============================================================================
-- FUNÇÃO: Calcular taxa de conformidade por paciente
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_patient_compliance_rate(
  p_patient_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_required INTEGER,
  total_measured INTEGER,
  compliance_rate NUMERIC,
  skipped_tests TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_required,
    COUNT(*) FILTER (WHERE was_measured = true)::INTEGER as total_measured,
    ROUND(
      (COUNT(*) FILTER (WHERE was_measured = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as compliance_rate,
    ARRAY_AGG(DISTINCT test_name) FILTER (WHERE was_measured = false) as skipped_tests
  FROM assessment_compliance_log
  WHERE patient_id = p_patient_id
    AND (p_start_date IS NULL OR recorded_at >= p_start_date)
    AND (p_end_date IS NULL OR recorded_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÃO: Relatório de conformidade por período
-- ============================================================================

CREATE OR REPLACE FUNCTION get_compliance_report(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_test_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  patient_id UUID,
  patient_name VARCHAR(255),
  test_name VARCHAR(255),
  total_required INTEGER,
  total_measured INTEGER,
  compliance_rate NUMERIC,
  most_common_skip_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    acl.patient_id,
    p.name as patient_name,
    acl.test_name,
    COUNT(*)::INTEGER as total_required,
    COUNT(*) FILTER (WHERE acl.was_measured = true)::INTEGER as total_measured,
    ROUND(
      (COUNT(*) FILTER (WHERE acl.was_measured = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as compliance_rate,
    MODE() WITHIN GROUP (ORDER BY acl.skip_reason) as most_common_skip_reason
  FROM assessment_compliance_log acl
  JOIN patients p ON acl.patient_id = p.id
  WHERE acl.recorded_at BETWEEN p_start_date AND p_end_date
    AND (p_test_type IS NULL OR acl.test_type = p_test_type)
  GROUP BY acl.patient_id, p.name, acl.test_name
  ORDER BY compliance_rate ASC, total_required DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: Vista consolidada de conformidade
-- ============================================================================

CREATE OR REPLACE VIEW v_assessment_compliance_summary AS
SELECT 
  patient_id,
  test_name,
  test_type,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE was_measured = true) as measured_count,
  COUNT(*) FILTER (WHERE was_measured = false) as skipped_count,
  ROUND(
    (COUNT(*) FILTER (WHERE was_measured = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as compliance_rate,
  MAX(recorded_at) as last_attempt_at,
  MIN(recorded_at) as first_attempt_at
FROM assessment_compliance_log
GROUP BY patient_id, test_name, test_type;

-- ============================================================================
-- TRIGGER: Atualizar estatísticas de conformidade
-- ============================================================================

CREATE OR REPLACE FUNCTION update_compliance_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar cache de estatísticas (se existir)
  -- Pode ser expandido para atualizar outras tabelas de agregação
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_compliance_stats
  AFTER INSERT OR UPDATE OR DELETE ON assessment_compliance_log
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_stats();

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE assessment_compliance_log IS 'Registro de conformidade com medições obrigatórias';
COMMENT ON COLUMN assessment_compliance_log.was_measured IS 'Indica se a medição foi realizada (true) ou não (false)';
COMMENT ON COLUMN assessment_compliance_log.skip_reason IS 'Razão para não realizar a medição (ex: paciente não compareceu, equipamento quebrado)';
COMMENT ON COLUMN assessment_compliance_log.measured_value IS 'Valor da medição em formato JSONB (ex: {"value": 120, "unit": "degrees"})';
COMMENT ON COLUMN assessment_compliance_log.timing IS 'Quando a medição deveria ser feita: before, during, after, independent';

-- ============================================================================
-- DADOS DE EXEMPLO (para testes)
-- ============================================================================

-- Exemplo de inserção:
-- INSERT INTO assessment_compliance_log (
--   patient_id,
--   session_id,
--   test_name,
--   test_type,
--   was_measured,
--   measured_value,
--   timing,
--   session_number,
--   recorded_by,
--   notes
-- ) VALUES (
--   'patient-uuid',
--   'session-uuid',
--   'Amplitude do Joelho',
--   'amplitude',
--   true,
--   '{"flexion": 120, "extension": 0}'::jsonb,
--   'during',
--   5,
--   'user-uuid',
--   'Medição realizada com goniômetro'
-- );

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

