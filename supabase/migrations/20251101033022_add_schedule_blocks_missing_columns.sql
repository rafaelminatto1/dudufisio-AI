-- =====================================================
-- Migration: Adicionar colunas faltantes em schedule_blocks
-- Description: Adiciona title, description, is_active e ajusta índices
-- Created: 2025-11-01
-- =====================================================

-- Adicionar colunas faltantes se não existirem
ALTER TABLE public.schedule_blocks 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Atualizar registros existentes sem title
UPDATE public.schedule_blocks 
SET title = 
  CASE 
    WHEN block_type = 'ferias' THEN 'Férias'
    WHEN block_type = 'almoco' THEN 'Almoço'
    WHEN block_type = 'ausencia' THEN 'Ausência'
    WHEN block_type = 'feriado' THEN 'Feriado'
    WHEN block_type = 'treinamento' THEN 'Treinamento'
    ELSE 'Bloqueio'
  END
WHERE title IS NULL;

-- Tornar title NOT NULL após popular dados
ALTER TABLE public.schedule_blocks 
  ALTER COLUMN title SET NOT NULL;

-- Criar índice para is_active se não existir
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_active 
  ON public.schedule_blocks(is_active) 
  WHERE is_active = TRUE;

-- Comentários para documentação
COMMENT ON COLUMN public.schedule_blocks.title IS 'Título do bloqueio de agenda';
COMMENT ON COLUMN public.schedule_blocks.description IS 'Descrição detalhada do bloqueio';
COMMENT ON COLUMN public.schedule_blocks.is_active IS 'Se o bloqueio está ativo (permite desativar sem deletar)';

