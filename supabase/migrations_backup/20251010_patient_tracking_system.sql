-- ============================================================================
-- MIGRATION: SISTEMA DE ACOMPANHAMENTO DE PACIENTES
-- Data: 10 de Outubro de 2025
-- Versão: 1.0
-- Descrição: Sistema completo de observações, avaliações e acompanhamento
--            com testes obrigatórios configuráveis e relatórios de evolução
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABELA: CATEGORIAS DE CASOS CLÍNICOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinical_case_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(50) CHECK (specialty IN (
    'sports', 'post_operative', 'orthopedic', 'neurological', 'cardiorespiratory', 'other'
  )),
  description TEXT,
  is_system_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Trigger para updated_at
CREATE TRIGGER update_clinical_case_categories_updated_at
  BEFORE UPDATE ON clinical_case_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE clinical_case_categories IS 'Categorias de casos clínicos (LCA, menisco, tendinite, etc.)';
COMMENT ON COLUMN clinical_case_categories.is_system_default IS 'True se é uma categoria padrão do sistema';

-- ============================================================================
-- 2. TABELA: TEMPLATES DE AVALIAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES clinical_case_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
    'number', 'range', 'angle', 'scale', 'text', 'date', 'boolean', 'select'
  )),
  unit VARCHAR(20), -- 'graus', 'cm', 'kg', 'N', '%', etc
  min_value NUMERIC,
  max_value NUMERIC,
  options JSONB, -- Para tipo 'select': [{"label": "Negativo", "value": "negative"}, ...]
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  help_text TEXT, -- Texto de ajuda para o campo
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Comentários
COMMENT ON TABLE assessment_templates IS 'Templates de campos de avaliação personalizados por categoria';
COMMENT ON COLUMN assessment_templates.field_type IS 'Tipo do campo: number, range, angle, scale, text, date, boolean, select';
COMMENT ON COLUMN assessment_templates.options IS 'Opções para campos do tipo select (formato JSON)';

-- ============================================================================
-- 3. TABELA: OBSERVAÇÕES DE SESSÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  author_name VARCHAR(255) NOT NULL,
  
  -- Conteúdo
  observation_type VARCHAR(50) DEFAULT 'general' CHECK (observation_type IN (
    'general', 'clinical', 'evolution', 'assessment', 'alert', 'recommendation'
  )),
  content TEXT NOT NULL,
  
  -- Timing da observação
  timing VARCHAR(20) CHECK (timing IN ('before', 'during', 'after', 'independent')),
  
  -- Metadata
  tags TEXT[],
  is_important BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Trigger para updated_at
CREATE TRIGGER update_session_observations_updated_at
  BEFORE UPDATE ON session_observations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE session_observations IS 'Observações e notas de acompanhamento dos pacientes';
COMMENT ON COLUMN session_observations.timing IS 'Quando a observação foi feita: before, during, after, independent';
COMMENT ON COLUMN session_observations.is_important IS 'Marca observação como importante para destaque';

-- ============================================================================
-- 4. TABELA: AVALIAÇÕES/MEDIÇÕES DO PACIENTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  observation_id UUID REFERENCES session_observations(id) ON DELETE SET NULL,
  template_id UUID REFERENCES assessment_templates(id) ON DELETE SET NULL,
  
  -- Dados da medição
  field_name VARCHAR(200) NOT NULL,
  field_value NUMERIC, -- Valor numérico
  field_text TEXT, -- Valor texto (para campos text, boolean, select)
  unit VARCHAR(20),
  
  -- Timing da avaliação
  assessment_timing VARCHAR(20) CHECK (assessment_timing IN (
    'pre_session', 'post_session', 'mid_session', 'independent'
  )),
  
  -- Metadata
  measured_by UUID NOT NULL REFERENCES users(id),
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Comentários
COMMENT ON TABLE patient_assessments IS 'Medições e avaliações dos pacientes (ângulos, força, dor, etc.)';
COMMENT ON COLUMN patient_assessments.assessment_timing IS 'Quando a avaliação foi feita: pre_session, post_session, mid_session, independent';

-- ============================================================================
-- 5. TABELA: CONFIGURAÇÃO DE TESTES OBRIGATÓRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mandatory_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  category_id UUID REFERENCES clinical_case_categories(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  
  -- Configuração de frequência
  frequency_type VARCHAR(50) NOT NULL CHECK (frequency_type IN (
    'every_session', 'weekly', 'biweekly', 'monthly', 'every_n_sessions', 'milestones'
  )),
  frequency_value INTEGER, -- Para 'every_n_sessions' (ex: a cada 3 sessões)
  milestone_sessions INTEGER[], -- Para 'milestones': [1, 5, 10, 20, 30]
  
  -- Timing da aplicação
  assessment_timing VARCHAR(20)[] DEFAULT ARRAY['pre_session'], -- Pode ser múltiplos
  
  -- Status e período
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  
  -- Auditoria
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Trigger para updated_at
CREATE TRIGGER update_mandatory_assessments_updated_at
  BEFORE UPDATE ON mandatory_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE mandatory_assessments IS 'Configuração de testes obrigatórios por paciente';
COMMENT ON COLUMN mandatory_assessments.frequency_type IS 'Tipo de frequência: every_session, weekly, every_n_sessions, milestones';
COMMENT ON COLUMN mandatory_assessments.milestone_sessions IS 'Array com números de sessão para milestones [1, 5, 10, 20]';

-- ============================================================================
-- 6. ÍNDICES DE PERFORMANCE
-- ============================================================================

-- Índices para session_observations
CREATE INDEX IF NOT EXISTS idx_session_obs_patient 
  ON session_observations(patient_id, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_obs_session 
  ON session_observations(session_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_obs_author 
  ON session_observations(author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_obs_type 
  ON session_observations(observation_type) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_obs_important 
  ON session_observations(is_important) 
  WHERE is_important = true AND deleted_at IS NULL;

-- Índices para patient_assessments
CREATE INDEX IF NOT EXISTS idx_patient_assess_patient 
  ON patient_assessments(patient_id, measured_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_assess_template 
  ON patient_assessments(template_id, measured_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_assess_session 
  ON patient_assessments(session_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_assess_field 
  ON patient_assessments(patient_id, field_name, measured_at DESC) 
  WHERE deleted_at IS NULL;

-- Índices para mandatory_assessments
CREATE INDEX IF NOT EXISTS idx_mandatory_assess_patient 
  ON mandatory_assessments(patient_id, is_active) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mandatory_assess_template 
  ON mandatory_assessments(template_id) 
  WHERE deleted_at IS NULL;

-- Índices para assessment_templates
CREATE INDEX IF NOT EXISTS idx_assessment_templates_category 
  ON assessment_templates(category_id, display_order) 
  WHERE deleted_at IS NULL;

-- Índices para clinical_case_categories
CREATE INDEX IF NOT EXISTS idx_clinical_categories_specialty 
  ON clinical_case_categories(specialty) 
  WHERE deleted_at IS NULL;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clinical_case_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatory_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas para clinical_case_categories
CREATE POLICY "Todos podem ver categorias" 
  ON clinical_case_categories FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode gerenciar categorias" 
  ON clinical_case_categories FOR ALL 
  USING (auth.jwt() ->> 'role' = 'Admin');

-- Políticas para assessment_templates
CREATE POLICY "Todos podem ver templates" 
  ON assessment_templates FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin e terapeutas podem criar templates" 
  ON assessment_templates FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

-- Políticas para session_observations
CREATE POLICY "Ver observações próprias ou como terapeuta" 
  ON session_observations FOR SELECT 
  USING (
    auth.uid() = author_id OR 
    auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta')
  );

CREATE POLICY "Terapeutas podem criar observações" 
  ON session_observations FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

CREATE POLICY "Autor pode editar próprias observações" 
  ON session_observations FOR UPDATE 
  USING (auth.uid() = author_id);

-- Políticas para patient_assessments
CREATE POLICY "Ver avaliações como terapeuta" 
  ON patient_assessments FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

CREATE POLICY "Terapeutas podem criar avaliações" 
  ON patient_assessments FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

-- Políticas para mandatory_assessments
CREATE POLICY "Ver configurações obrigatórias como terapeuta" 
  ON mandatory_assessments FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

CREATE POLICY "Terapeutas podem configurar testes obrigatórios" 
  ON mandatory_assessments FOR ALL 
  USING (auth.jwt() ->> 'role' IN ('Admin', 'Fisioterapeuta'));

-- ============================================================================
-- 8. FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para obter próxima sessão onde teste é obrigatório
CREATE OR REPLACE FUNCTION get_next_mandatory_assessment_session(
  p_patient_id UUID,
  p_mandatory_id UUID,
  p_current_session INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
  v_frequency_type VARCHAR(50);
  v_frequency_value INTEGER;
  v_milestone_sessions INTEGER[];
  v_next_session INTEGER;
BEGIN
  -- Buscar configuração
  SELECT frequency_type, frequency_value, milestone_sessions
  INTO v_frequency_type, v_frequency_value, v_milestone_sessions
  FROM mandatory_assessments
  WHERE id = p_mandatory_id AND is_active = true;
  
  -- Calcular próxima sessão baseado no tipo
  CASE v_frequency_type
    WHEN 'every_session' THEN
      v_next_session := p_current_session + 1;
    
    WHEN 'every_n_sessions' THEN
      v_next_session := p_current_session + v_frequency_value;
    
    WHEN 'milestones' THEN
      -- Encontrar próximo milestone
      SELECT MIN(session_num)
      INTO v_next_session
      FROM unnest(v_milestone_sessions) AS session_num
      WHERE session_num > p_current_session;
    
    ELSE
      v_next_session := NULL;
  END CASE;
  
  RETURN v_next_session;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar testes pendentes de uma sessão
CREATE OR REPLACE FUNCTION get_pending_assessments_for_session(
  p_patient_id UUID,
  p_session_number INTEGER,
  p_timing VARCHAR(20) DEFAULT 'pre_session'
)
RETURNS TABLE (
  mandatory_id UUID,
  template_id UUID,
  template_name VARCHAR(200),
  field_type VARCHAR(50),
  is_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.id,
    at.id,
    at.name,
    at.field_type,
    at.is_required
  FROM mandatory_assessments ma
  INNER JOIN assessment_templates at ON at.id = ma.template_id
  WHERE ma.patient_id = p_patient_id
    AND ma.is_active = true
    AND ma.deleted_at IS NULL
    AND at.deleted_at IS NULL
    AND p_timing = ANY(ma.assessment_timing)
    AND (
      ma.start_date IS NULL OR ma.start_date <= CURRENT_DATE
    )
    AND (
      ma.end_date IS NULL OR ma.end_date >= CURRENT_DATE
    )
    AND (
      -- Every session
      (ma.frequency_type = 'every_session')
      OR
      -- Every N sessions
      (ma.frequency_type = 'every_n_sessions' AND p_session_number % ma.frequency_value = 0)
      OR
      -- Milestones
      (ma.frequency_type = 'milestones' AND p_session_number = ANY(ma.milestone_sessions))
    )
    -- Verificar se não foi feito ainda nesta sessão
    AND NOT EXISTS (
      SELECT 1 FROM patient_assessments pa
      WHERE pa.template_id = at.id
        AND pa.patient_id = p_patient_id
        AND pa.assessment_timing = p_timing
        AND pa.measured_at::date = CURRENT_DATE
        AND pa.deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Comentários nas funções
COMMENT ON FUNCTION get_next_mandatory_assessment_session IS 'Calcula próxima sessão onde teste obrigatório deve ser aplicado';
COMMENT ON FUNCTION get_pending_assessments_for_session IS 'Retorna lista de testes obrigatórios pendentes para uma sessão';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

