-- Migration: Adicionar sistema de feedback com emojis
-- Data: 2025-11-05
-- Descrição: Adiciona colunas de avaliação com emojis para pacientes e profissionais
-- NOTA: A tabela session_evolutions JÁ existe com tipos UUID (criada em 20251022000001)

-- ============================================================================
-- 1. Adicionar colunas de rating na tabela session_evolutions
-- ============================================================================

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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_session_evolutions_patient_ratings'
  ) THEN
    CREATE INDEX idx_session_evolutions_patient_ratings
    ON session_evolutions(patient_id)
    WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL;
  END IF;
END $$;

-- Índice para buscar ratings por data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_session_evolutions_date_ratings'
  ) THEN
    CREATE INDEX idx_session_evolutions_date_ratings
    ON session_evolutions(session_date)
    WHERE patient_rating IS NOT NULL OR professional_rating IS NOT NULL;
  END IF;
END $$;

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
DROP FUNCTION IF EXISTS get_average_ratings_by_period(UUID, TIMESTAMPTZ, TIMESTAMPTZ);

-- Criar função (usando UUID corretamente)
CREATE OR REPLACE FUNCTION get_average_ratings_by_period(
  p_patient_id UUID,
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

-- NOTA: Trigger já existe na migração 20251022000001_session_evolutions.sql
-- Não é necessário recriar

-- ============================================================================
-- 7. Permissões RLS (Row Level Security)
-- ============================================================================

-- NOTA: RLS já está habilitado e políticas já existem na migração 20251022000001
-- As políticas existentes cobrem todos os casos de uso necessários:
-- - "Users can view session evolutions of their patients" (SELECT)
-- - "Therapists can create session evolutions" (INSERT)
-- - "Therapists can update their own session evolutions" (UPDATE)
-- - "Only admins can delete session evolutions" (DELETE)
--
-- Não é necessário criar políticas duplicadas para ratings.

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
END $$;
