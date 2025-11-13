-- ============================================================================
-- DESABILITAR RLS NA TABELA USERS (APENAS PARA DESENVOLVIMENTO)
-- ============================================================================
-- Migração: Desabilita RLS na tabela users para permitir JOINs
-- Data: 2025-10-27
-- Descrição: Temporariamente desabilita RLS em users para debug de JOINs.
--            Isso permite que queries de appointments façam JOIN com users
--            e retornem dados de pacientes e terapeutas.
-- ============================================================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================;
