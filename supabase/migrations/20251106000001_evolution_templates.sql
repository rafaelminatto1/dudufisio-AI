-- ============================================================================
-- Migration: Evolution Templates
-- Descrição: Cria tabela para templates de evolução reutilizáveis
-- Data: 2025-11-06
-- ============================================================================

-- Criar tabela evolution_templates
CREATE TABLE IF NOT EXISTS evolution_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE,
  
  -- Templates de texto para cada seção SOAP
  subjective_template TEXT,
  objective_template TEXT,
  assessment_template TEXT,
  
  -- Condutas e exercícios estruturados (JSONB)
  conducts JSONB DEFAULT '[]'::jsonb,
  exercises JSONB DEFAULT '[]'::jsonb,
  
  -- Métricas de uso
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- Índice para busca por terapeuta
CREATE INDEX idx_evolution_templates_therapist ON evolution_templates(therapist_id);
-- Índice para busca por uso mais frequente
CREATE INDEX idx_evolution_templates_usage ON evolution_templates(usage_count DESC);
-- Comentários na tabela
COMMENT ON TABLE evolution_templates IS 'Templates reutilizáveis de evolução para agilizar registro de sessões';
COMMENT ON COLUMN evolution_templates.conducts IS 'Array JSON de condutas estruturadas (categoria, nome, detalhes, etc)';
COMMENT ON COLUMN evolution_templates.exercises IS 'Array JSON de exercícios prescritos com parâmetros';
COMMENT ON COLUMN evolution_templates.usage_count IS 'Contador de quantas vezes o template foi usado';
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_evolution_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_evolution_templates_updated_at
  BEFORE UPDATE ON evolution_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_evolution_templates_updated_at();
-- Função para incrementar usage_count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE evolution_templates
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;
-- ============================================================================
-- Estender tabela session_evolutions para incluir novos campos
-- ============================================================================

-- Adicionar campos para funcionalidades avançadas
DO $$ 
BEGIN
  -- Exercícios prescritos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'prescribed_exercises'
  ) THEN
    ALTER TABLE session_evolutions 
    ADD COLUMN prescribed_exercises JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Fotos de progresso
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'progress_photos'
  ) THEN
    ALTER TABLE session_evolutions 
    ADD COLUMN progress_photos JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Dados do timer da sessão
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'session_timer'
  ) THEN
    ALTER TABLE session_evolutions 
    ADD COLUMN session_timer JSONB;
  END IF;

  -- Condutas estruturadas (se ainda não existir)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'conducts'
  ) THEN
    ALTER TABLE session_evolutions 
    ADD COLUMN conducts JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Observações gerais do plano
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'plan_general_notes'
  ) THEN
    ALTER TABLE session_evolutions 
    ADD COLUMN plan_general_notes TEXT;
  END IF;
END $$;
-- Comentários nas novas colunas
COMMENT ON COLUMN session_evolutions.prescribed_exercises IS 'Array JSON de exercícios prescritos com séries, reps, carga, etc';
COMMENT ON COLUMN session_evolutions.progress_photos IS 'Array JSON de fotos de progresso com URLs e legendas';
COMMENT ON COLUMN session_evolutions.session_timer IS 'Objeto JSON com startTime, endTime e duration da sessão';
COMMENT ON COLUMN session_evolutions.conducts IS 'Array JSON de condutas estruturadas por categoria';
COMMENT ON COLUMN session_evolutions.plan_general_notes IS 'Observações gerais do plano de tratamento';
-- ============================================================================
-- Políticas RLS (Row Level Security) para evolution_templates
-- ============================================================================

-- Habilitar RLS
ALTER TABLE evolution_templates ENABLE ROW LEVEL SECURITY;
-- Política: Terapeutas podem ver apenas seus próprios templates
CREATE POLICY evolution_templates_select_own 
  ON evolution_templates
  FOR SELECT
  USING (
    therapist_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM therapists
      WHERE therapists.id = auth.uid()
    )
  );
-- Política: Terapeutas podem inserir templates
CREATE POLICY evolution_templates_insert_own 
  ON evolution_templates
  FOR INSERT
  WITH CHECK (
    therapist_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM therapists
      WHERE therapists.id = auth.uid()
    )
  );
-- Política: Terapeutas podem atualizar apenas seus próprios templates
CREATE POLICY evolution_templates_update_own 
  ON evolution_templates
  FOR UPDATE
  USING (
    therapist_id = auth.uid()
  )
  WITH CHECK (
    therapist_id = auth.uid()
  );
-- Política: Terapeutas podem deletar apenas seus próprios templates
CREATE POLICY evolution_templates_delete_own 
  ON evolution_templates
  FOR DELETE
  USING (
    therapist_id = auth.uid()
  );
-- ============================================================================
-- Dados de exemplo (opcional - remover em produção)
-- ============================================================================

-- Inserir template de exemplo (apenas se houver terapeutas)
DO $$
DECLARE
  v_therapist_id UUID;
BEGIN
  -- Pegar primeiro terapeuta disponível
  SELECT id INTO v_therapist_id FROM therapists LIMIT 1;
  
  IF v_therapist_id IS NOT NULL THEN
    INSERT INTO evolution_templates (
      name,
      description,
      therapist_id,
      subjective_template,
      objective_template,
      assessment_template,
      conducts,
      usage_count
    ) VALUES (
      'Lombalgia Aguda - Protocolo Base',
      'Template padrão para atendimento de lombalgia aguda',
      v_therapist_id,
      'Paciente relata dor lombar de intensidade moderada/forte, com início há X dias. Dor piora com movimentos de flexão e permanência prolongada em mesma posição.',
      'Espasmo muscular em paravertebrais lombares, amplitude de movimento lombar reduzida, teste de Lasègue negativo bilateralmente.',
      'Lombalgia aguda com componente muscular predominante. Paciente apresenta limitação funcional moderada.',
      '[
        {
          "id": "conduct_1",
          "category": "manual_therapy",
          "name": "Liberação miofascial",
          "details": "Região lombar e paravertebrais",
          "duration": "15min"
        },
        {
          "id": "conduct_2",
          "category": "electrotherapy",
          "name": "TENS",
          "details": "Lombar baixa",
          "duration": "20min"
        }
      ]'::jsonb,
      0
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
