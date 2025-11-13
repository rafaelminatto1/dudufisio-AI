-- Migration: Criar tabela conduct_templates
-- Data: 22/10/2025
-- Descrição: Armazena templates de conduta salvos para replicação entre sessões

-- Criar tabela
CREATE TABLE IF NOT EXISTS conduct_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Dados da conduta (campos SOAP)
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Testes incluídos no template (JSONB array)
  tests JSONB DEFAULT '[]'::jsonb,
  
  -- Origem do template
  source_session_id UUID REFERENCES session_evolutions(id) ON DELETE SET NULL,
  source_session_date TIMESTAMP,
  
  -- Estatísticas de uso
  times_used INTEGER DEFAULT 0,
  
  -- Se é template salvo ou apenas de sessão anterior
  is_template BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conduct_templates_patient_id ON conduct_templates(patient_id);
CREATE INDEX IF NOT EXISTS idx_conduct_templates_is_template ON conduct_templates(is_template);
CREATE INDEX IF NOT EXISTS idx_conduct_templates_created_at ON conduct_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conduct_templates_times_used ON conduct_templates(times_used DESC);
-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_conduct_templates_name ON conduct_templates USING gin(to_tsvector('portuguese', name));
-- RLS (Row Level Security)
ALTER TABLE conduct_templates ENABLE ROW LEVEL SECURITY;
-- Policy: Usuários podem ver templates dos seus pacientes
CREATE POLICY "Users can view conduct templates of their patients"
  ON conduct_templates
  FOR SELECT
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
-- Policy: Terapeutas podem criar templates
CREATE POLICY "Therapists can create conduct templates"
  ON conduct_templates
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'therapist', 'manager'))
  );
-- Policy: Apenas criador ou Admin pode atualizar
CREATE POLICY "Creators and admins can update conduct templates"
  ON conduct_templates
  FOR UPDATE
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
-- Policy: Apenas criador ou Admin pode deletar
CREATE POLICY "Creators and admins can delete conduct templates"
  ON conduct_templates
  FOR DELETE
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
-- Function para incrementar times_used
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE conduct_templates
  SET times_used = times_used + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;
-- Comentários na tabela
COMMENT ON TABLE conduct_templates IS 'Templates de conduta salvos para replicação rápida entre sessões';
COMMENT ON COLUMN conduct_templates.tests IS 'Array JSON com definições dos testes incluídos no template';
COMMENT ON COLUMN conduct_templates.times_used IS 'Contador de quantas vezes o template foi utilizado';
COMMENT ON COLUMN conduct_templates.is_template IS 'True se é template salvo pelo usuário, false se é apenas referência de sessão anterior';
