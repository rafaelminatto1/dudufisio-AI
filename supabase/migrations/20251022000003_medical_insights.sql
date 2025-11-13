-- Migration: Criar tabela medical_insights
-- Data: 22/10/2025
-- Descrição: Cache de insights médicos gerados automaticamente para relatórios

-- Criar tabela
CREATE TABLE IF NOT EXISTS medical_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Tipo de insight
  type TEXT NOT NULL CHECK (type IN (
    'pain_reduction',
    'range_improvement',
    'strength_gain',
    'functional_progress',
    'milestone',
    'alert'
  )),
  
  -- Conteúdo do insight
  title TEXT NOT NULL,
  description TEXT,
  
  -- Dados estruturados (JSONB)
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Severidade
  severity TEXT CHECK (severity IN ('info', 'success', 'warning', 'error')),
  
  -- Texto sugerido para laudo médico
  suggested_text TEXT,
  
  -- Timestamps
  generated_at TIMESTAMP DEFAULT NOW()
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_insights_patient_id ON medical_insights(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_insights_type ON medical_insights(type);
CREATE INDEX IF NOT EXISTS idx_medical_insights_severity ON medical_insights(severity);
CREATE INDEX IF NOT EXISTS idx_medical_insights_generated_at ON medical_insights(generated_at DESC);
-- Índice composto para buscar insights recentes de um paciente
CREATE INDEX IF NOT EXISTS idx_medical_insights_patient_recent ON medical_insights(patient_id, generated_at DESC);
-- Índice GIN para busca no JSONB data
CREATE INDEX IF NOT EXISTS idx_medical_insights_data ON medical_insights USING gin(data);
-- RLS (Row Level Security)
ALTER TABLE medical_insights ENABLE ROW LEVEL SECURITY;
-- Policy: Terapeutas podem ver insights dos seus pacientes
CREATE POLICY "Therapists can view insights of their patients"
  ON medical_insights
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT therapist_id FROM appointments WHERE patient_id = medical_insights.patient_id
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
-- Policy: Sistema pode criar insights (via service account ou authenticated users)
CREATE POLICY "System can create medical insights"
  ON medical_insights
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );
-- Policy: Apenas Admin pode deletar insights
CREATE POLICY "Only admins can delete medical insights"
  ON medical_insights
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
-- View para insights agregados por paciente
CREATE OR REPLACE VIEW patient_insights_summary AS
SELECT 
  patient_id,
  COUNT(*) as total_insights,
  COUNT(*) FILTER (WHERE severity = 'success') as success_count,
  COUNT(*) FILTER (WHERE severity = 'warning') as warning_count,
  COUNT(*) FILTER (WHERE severity = 'error') as error_count,
  COUNT(*) FILTER (WHERE type = 'pain_reduction') as pain_insights,
  COUNT(*) FILTER (WHERE type = 'milestone') as milestones,
  MAX(generated_at) as last_insight_date
FROM medical_insights
GROUP BY patient_id;
-- Comentários na tabela
COMMENT ON TABLE medical_insights IS 'Cache de insights médicos gerados automaticamente para uso em relatórios e laudos';
COMMENT ON COLUMN medical_insights.data IS 'Dados estruturados do insight (valores iniciais, finais, melhora, etc)';
COMMENT ON COLUMN medical_insights.suggested_text IS 'Texto formatado e pronto para copiar no laudo médico';
COMMENT ON VIEW patient_insights_summary IS 'Resumo agregado de insights por paciente';
