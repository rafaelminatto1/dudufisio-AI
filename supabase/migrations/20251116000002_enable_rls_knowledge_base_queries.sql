-- Migration: Enable RLS on knowledge_base_queries
-- Data: 16/11/2025
-- Descrição: Habilita Row Level Security na tabela knowledge_base_queries
-- Tipo: Correção de Segurança (CRÍTICO)

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================
ALTER TABLE public.knowledge_base_queries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Política: Usuários autenticados podem inserir queries
CREATE POLICY "authenticated_can_insert_queries"
ON public.knowledge_base_queries
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Usuários podem ver suas próprias queries
CREATE POLICY "users_can_view_own_queries"
ON public.knowledge_base_queries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Admins e terapeutas podem ver todas as queries
CREATE POLICY "admins_therapists_can_view_all_queries"
ON public.knowledge_base_queries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'therapist')
    )
);

-- Política: Usuários podem atualizar suas próprias queries
CREATE POLICY "users_can_update_own_queries"
ON public.knowledge_base_queries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias queries
CREATE POLICY "users_can_delete_own_queries"
ON public.knowledge_base_queries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE public.knowledge_base_queries IS 
'Tabela de queries da base de conhecimento com RLS habilitado';

COMMENT ON POLICY "authenticated_can_insert_queries" ON public.knowledge_base_queries IS
'Permite que usuários autenticados insiram queries';

COMMENT ON POLICY "users_can_view_own_queries" ON public.knowledge_base_queries IS
'Permite que usuários vejam apenas suas próprias queries';

COMMENT ON POLICY "admins_therapists_can_view_all_queries" ON public.knowledge_base_queries IS
'Permite que admins e terapeutas vejam todas as queries para análise';

COMMENT ON POLICY "users_can_update_own_queries" ON public.knowledge_base_queries IS
'Permite que usuários atualizem apenas suas próprias queries';

COMMENT ON POLICY "users_can_delete_own_queries" ON public.knowledge_base_queries IS
'Permite que usuários deletem apenas suas próprias queries';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Query para verificar se RLS está habilitado
-- SELECT 
--     schemaname,
--     tablename,
--     rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename = 'knowledge_base_queries';

-- Query para verificar políticas criadas
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'knowledge_base_queries';

