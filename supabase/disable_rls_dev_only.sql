-- ============================================================================
-- ⚠️ PLANO B: DESABILITAR RLS TEMPORARIAMENTE (APENAS DESENVOLVIMENTO)
-- ============================================================================
-- Use este script APENAS se a autenticação real não funcionar
-- e você precisar de uma solução rápida para desenvolvimento
-- 
-- ⚠️ ATENÇÃO: NUNCA USE EM PRODUÇÃO!
-- ⚠️ Este script remove toda proteção RLS da tabela appointments
-- ============================================================================

-- Verificar estado atual
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'appointments' 
  AND schemaname = 'public';

-- ============================================================================
-- OPÇÃO 1: Desabilitar RLS Completamente (Mais Simples)
-- ============================================================================

-- Desabilitar RLS
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- Adicionar comentário de aviso
COMMENT ON TABLE public.appointments IS 
  '⚠️ RLS TEMPORARIAMENTE DESABILITADO para desenvolvimento. REATIVAR antes de produção!';

-- Verificar que foi desabilitado
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'appointments';
-- Deve retornar: rls_habilitado = false

-- ============================================================================
-- OPÇÃO 2: Manter RLS mas Criar Policy Permissiva (Mais Seguro)
-- ============================================================================

/*
-- Se preferir manter RLS habilitado mas adicionar uma policy permissiva:
-- Comente a linha "ALTER TABLE ... DISABLE" acima e descomente abaixo:

-- Deletar policy existente se houver
DROP POLICY IF EXISTS "dev_allow_all_temp" ON public.appointments;

-- Criar policy temporária que permite tudo
CREATE POLICY "dev_allow_all_temp" 
  ON public.appointments 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Comentário de aviso
COMMENT ON POLICY "dev_allow_all_temp" ON public.appointments IS
  '⚠️ POLICY TEMPORÁRIA - Permite acesso total. REMOVER em produção!';

-- Verificar policies
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND schemaname = 'public';
*/

-- ============================================================================
-- REATIVAR RLS (Use quando for para produção)
-- ============================================================================

/*
-- Quando quiser reativar RLS, execute:

-- Reabilitar RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remover policy temporária se criou
DROP POLICY IF EXISTS "dev_allow_all_temp" ON public.appointments;

-- Remover comentário de aviso
COMMENT ON TABLE public.appointments IS NULL;

-- Verificar que foi reabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'appointments';
-- Deve retornar: rowsecurity = true
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- ✅ Use este script APENAS para desenvolvimento local
-- ⚠️ NUNCA desabilite RLS em produção
-- ⚠️ Qualquer pessoa poderá ler/escrever appointments sem autenticação
-- ⚠️ REATIVE RLS antes de fazer deploy

-- Para testar se funcionou:
-- 1. Reinicie a aplicação
-- 2. Tente criar um agendamento
-- 3. Não deve haver erro 401
-- 4. Verifique no console que o agendamento foi salvo

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Status das tabelas principais
SELECT 
  tablename,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity THEN '⚠️ RLS HABILITADO (Requer autenticação)'
    ELSE '✅ RLS DESABILITADO (Acesso livre - DEV ONLY)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('appointments', 'users', 'patients', 'therapists')
ORDER BY tablename;

