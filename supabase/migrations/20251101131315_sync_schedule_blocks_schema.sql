-- =====================================================
-- Migration: Sincronizar schema de schedule_blocks
-- Description: Remove colunas desnecessárias e ajusta constraints
-- Created: 2025-11-01
-- =====================================================

-- Remover colunas que não são mais necessárias
ALTER TABLE public.schedule_blocks 
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS is_recurring,
  DROP COLUMN IF EXISTS recurrence_end_date,
  DROP COLUMN IF EXISTS recurrence_pattern;
-- Remover constraint antigo de block_type se existir
ALTER TABLE public.schedule_blocks 
  DROP CONSTRAINT IF EXISTS schedule_blocks_block_type_check;
-- Adicionar novo constraint com todos os tipos possíveis
ALTER TABLE public.schedule_blocks 
  ADD CONSTRAINT schedule_blocks_block_type_check 
  CHECK (block_type = ANY (ARRAY[
    'ferias'::text, 
    'almoco'::text, 
    'ausencia'::text, 
    'feriado'::text, 
    'treinamento'::text, 
    'outro'::text
  ]));
-- Remover índices antigos se existirem
DROP INDEX IF EXISTS public.idx_schedule_blocks_therapist;
DROP INDEX IF EXISTS public.idx_schedule_blocks_active;
-- Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_therapist_id 
  ON public.schedule_blocks(therapist_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_active 
  ON public.schedule_blocks(is_active) 
  WHERE is_active = TRUE;
-- Comentários para documentação
COMMENT ON TABLE public.schedule_blocks IS 'Bloqueios de agenda dos fisioterapeutas (férias, almoço, etc)';
COMMENT ON COLUMN public.schedule_blocks.title IS 'Título do bloqueio';
COMMENT ON COLUMN public.schedule_blocks.description IS 'Descrição opcional do bloqueio';
COMMENT ON COLUMN public.schedule_blocks.is_active IS 'Se o bloqueio está ativo (permite desativar sem deletar)';
COMMENT ON COLUMN public.schedule_blocks.block_type IS 'Tipo de bloqueio: ferias, almoco, ausencia, feriado, treinamento, outro';
