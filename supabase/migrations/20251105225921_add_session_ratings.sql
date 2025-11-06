-- Migration: Adicionar sistema de feedback com emojis
-- Data: 2025-11-05
-- Descrição: Adiciona colunas de avaliação com emojis para pacientes e profissionais

-- ============================================================================
-- 1. Adicionar colunas de rating na tabela session_evolutions
-- ============================================================================

-- Verificar se a tabela existe, senão criar
CREATE TABLE IF NOT EXISTS session_evolutions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  therapist_id TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  
  -- Dados SOAP
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Métricas
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  satisfaction_level INTEGER CHECK (satisfaction_level >= 0 AND satisfaction_level <= 10),
  
  -- Metadata
  duration INTEGER,
  tags TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Adicionar colunas de rating (usar DO para evitar erro se já existirem)
DO $$
BEGIN
  -- Adicionar patient_rating se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'patient_rating'
  ) THEN
    ALTER TABLE session_evolutions
    ADD COLUMN patient_rating INTEGER CHECK (patient_rating >= 1 AND patient_rating <= 5);
  END IF;

  -- Adicionar professional_rating se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'professional_rating'
  ) THEN
    ALTER TABLE session_evolutions
    ADD COLUMN professional_rating INTEGER CHECK (professional_rating >= 1 AND professional_rating <= 5);
  END IF;

  -- Adicionar rating_comment se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'session_evolutions' 
    AND column_name = 'rating_comment'
  ) THEN
    ALTER TABLE session_evolutions
    ADD COLUMN rating_comment TEXT;
  END IF;
END $$;

-- ============================================================================
-- 2. Criar índices para melhor performance
-- ============================================================================

-- Índice para buscar ratings por paciente
CREATE INDEX IF NOT EXISTS idx_session_evolutions_patient_ratings 
ON session_evolutions(patient_id) 
WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL;

-- Índice para buscar ratings por data
CREATE INDEX IF NOT EXISTS idx_session_evolutions_date_ratings 
ON session_evolutions(session_date) 
WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL;

-- ============================================================================
-- 3. Criar view para estatísticas de ratings
-- ============================================================================

-- Drop view se existir
DROP VIEW IF EXISTS patient_rating_stats;

-- Criar view com estatísticas agregadas
CREATE VIEW patient_rating_stats AS
SELECT 
  patient_id,
  COUNT(*) as total_sessions,
  AVG(patient_rating) as avg_patient_rating,
  AVG(professional_rating) as avg_professional_rating,
  STDDEV(patient_rating) as stddev_patient_rating,
  STDDEV(professional_rating) as stddev_professional_rating,
  COUNT(CASE WHEN patient_rating >= 4 THEN 1 END) as positive_sessions,
  COUNT(CASE WHEN patient_rating <= 2 THEN 1 END) as negative_sessions,
  COUNT(CASE WHEN patient_rating = 5 THEN 1 END) as excellent_sessions,
  COUNT(CASE WHEN patient_rating = 1 THEN 1 END) as poor_sessions,
  MIN(session_date) as first_rating_date,
  MAX(session_date) as last_rating_date,
  COUNT(CASE WHEN rating_comment IS NOT NULL AND rating_comment != '' THEN 1 END) as sessions_with_comments
FROM session_evolutions
WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL
GROUP BY patient_id;

-- Comentários na view
COMMENT ON VIEW patient_rating_stats IS 'Estatísticas agregadas de avaliações por paciente';

-- ============================================================================
-- 4. Criar view para tendências de rating
-- ============================================================================

-- Drop view se existir
DROP VIEW IF EXISTS patient_rating_trends;

-- View para análise de tendências
CREATE VIEW patient_rating_trends AS
WITH ranked_ratings AS (
  SELECT 
    patient_id,
    session_date,
    patient_rating,
    professional_rating,
    rating_comment,
    ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY session_date DESC) as recent_rank,
    LAG(patient_rating) OVER (PARTITION BY patient_id ORDER BY session_date) as prev_patient_rating,
    LAG(professional_rating) OVER (PARTITION BY patient_id ORDER BY session_date) as prev_professional_rating
  FROM session_evolutions
  WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL
)
SELECT 
  patient_id,
  session_date as last_session_date,
  patient_rating as last_patient_rating,
  professional_rating as last_professional_rating,
  rating_comment as last_comment,
  prev_patient_rating,
  prev_professional_rating,
  CASE 
    WHEN patient_rating > prev_patient_rating THEN 'improving'
    WHEN patient_rating < prev_patient_rating THEN 'declining'
    WHEN patient_rating = prev_patient_rating THEN 'stable'
    ELSE 'new'
  END as patient_trend,
  CASE 
    WHEN professional_rating > prev_professional_rating THEN 'improving'
    WHEN professional_rating < prev_professional_rating THEN 'declining'
    WHEN professional_rating = prev_professional_rating THEN 'stable'
    ELSE 'new'
  END as professional_trend
FROM ranked_ratings
WHERE recent_rank = 1;

-- Comentários na view
COMMENT ON VIEW patient_rating_trends IS 'Tendências de avaliação comparando última sessão com anterior';

-- ============================================================================
-- 5. Criar função para obter média de ratings em período
-- ============================================================================

-- Drop function se existir
DROP FUNCTION IF EXISTS get_average_ratings_by_period(TEXT, TIMESTAMPTZ, TIMESTAMPTZ);

-- Criar função
CREATE OR REPLACE FUNCTION get_average_ratings_by_period(
  p_patient_id TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  patient_avg NUMERIC,
  professional_avg NUMERIC,
  total_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(patient_rating)::NUMERIC, 2) as patient_avg,
    ROUND(AVG(professional_rating)::NUMERIC, 2) as professional_avg,
    COUNT(*) as total_sessions
  FROM session_evolutions
  WHERE patient_id = p_patient_id
    AND session_date >= p_start_date
    AND session_date <= p_end_date
    AND (patient_rating IS NOT NULL OR professional_rating IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Comentários na função
COMMENT ON FUNCTION get_average_ratings_by_period IS 'Calcula média de avaliações para um paciente em um período específico';

-- ============================================================================
-- 6. Criar trigger para atualizar updated_at
-- ============================================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_session_evolution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_session_evolution_timestamp ON session_evolutions;

CREATE TRIGGER trigger_update_session_evolution_timestamp
  BEFORE UPDATE ON session_evolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_evolution_updated_at();

-- ============================================================================
-- 7. Permissões RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS se ainda não estiver
ALTER TABLE session_evolutions ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (usuários autenticados podem ler seus próprios dados)
DROP POLICY IF EXISTS "Users can read their own session evolutions" ON session_evolutions;

CREATE POLICY "Users can read their own session evolutions"
  ON session_evolutions
  FOR SELECT
  TO authenticated
  USING (
    therapist_id = auth.uid()::text 
    OR patient_id IN (
      SELECT id FROM patients WHERE therapist_id = auth.uid()::text
    )
  );

-- Policy para inserção
DROP POLICY IF EXISTS "Users can insert their own session evolutions" ON session_evolutions;

CREATE POLICY "Users can insert their own session evolutions"
  ON session_evolutions
  FOR INSERT
  TO authenticated
  WITH CHECK (therapist_id = auth.uid()::text);

-- Policy para atualização
DROP POLICY IF EXISTS "Users can update their own session evolutions" ON session_evolutions;

CREATE POLICY "Users can update their own session evolutions"
  ON session_evolutions
  FOR UPDATE
  TO authenticated
  USING (therapist_id = auth.uid()::text)
  WITH CHECK (therapist_id = auth.uid()::text);

-- ============================================================================
-- 8. Dados de exemplo (opcional - comentado por padrão)
-- ============================================================================

-- DESCOMENTAR APENAS PARA AMBIENTE DE DESENVOLVIMENTO
/*
-- Inserir alguns ratings de exemplo
INSERT INTO session_evolutions (
  id, session_id, patient_id, session_number, session_date,
  therapist_id, therapist_name,
  subjective, objective, assessment, plan,
  patient_rating, professional_rating, rating_comment
) VALUES 
  (
    'example_rating_1',
    'session_1',
    'patient_1',
    1,
    NOW() - INTERVAL '7 days',
    'therapist_1',
    'Dr. Silva',
    'Paciente relata melhora na dor',
    'ROM melhorado em 20%',
    'Evolução positiva',
    'Continuar tratamento',
    5,
    4,
    'Paciente muito colaborativo'
  ),
  (
    'example_rating_2',
    'session_2',
    'patient_1',
    2,
    NOW() - INTERVAL '3 days',
    'therapist_1',
    'Dr. Silva',
    'Dor leve persistente',
    'Força muscular aumentada',
    'Progressão adequada',
    'Intensificar exercícios',
    4,
    4,
    NULL
  );
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  RAISE NOTICE 'Migration aplicada com sucesso!';
  RAISE NOTICE 'Colunas adicionadas: patient_rating, professional_rating, rating_comment';
  RAISE NOTICE 'Views criadas: patient_rating_stats, patient_rating_trends';
  RAISE NOTICE 'Função criada: get_average_ratings_by_period';
  RAISE NOTICE 'Triggers e RLS policies configurados';
END $$;

