-- ============================================================================
-- REMOVER CHECK CONSTRAINT DO CAMPO TYPE (DESENVOLVIMENTO)
-- ============================================================================
-- Migração: Remove constraint de tipo para desenvolvimento
-- Data: 2025-10-26
-- Descrição: Remove temporariamente a constraint para permitir testes
-- ⚠️ APENAS PARA DESENVOLVIMENTO!
-- ============================================================================

-- Remover constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_type_check;

COMMENT ON TABLE appointments IS '⚠️ Type constraint removida para desenvolvimento';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

