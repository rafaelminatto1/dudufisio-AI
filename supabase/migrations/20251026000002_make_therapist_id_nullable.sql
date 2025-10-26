-- ============================================================================
-- TORNAR THERAPIST_ID OPCIONAL NA TABELA APPOINTMENTS
-- ============================================================================
-- Migração: Permite agendamentos sem terapeuta definido
-- Data: 2025-10-26
-- Descrição: Permite que administradores e estagiários criem agendamentos
--            e definam o terapeuta posteriormente (na evolução)
-- ============================================================================

-- Remover a constraint NOT NULL do campo therapist_id
ALTER TABLE appointments 
  ALTER COLUMN therapist_id DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN appointments.therapist_id IS 
  'ID do terapeuta responsável. Pode ser NULL quando agendado por admin/estagiário e definido posteriormente na evolução.';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

