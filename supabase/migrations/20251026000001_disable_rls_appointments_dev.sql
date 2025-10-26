-- ============================================================================
-- DESABILITAR RLS PARA DESENVOLVIMENTO - APPOINTMENTS
-- ============================================================================
-- Migração temporária para desenvolvimento
-- Data: 2025-10-26
-- Descrição: Desabilita RLS na tabela appointments para permitir inserções
--            sem autenticação real durante desenvolvimento
-- ⚠️ ATENÇÃO: Esta migração é APENAS para desenvolvimento!
-- ============================================================================

-- Desabilitar Row Level Security na tabela appointments
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Adicionar comentário de aviso
COMMENT ON TABLE appointments IS '⚠️ RLS DESABILITADO PARA DESENVOLVIMENTO - HABILITAR EM PRODUÇÃO';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

