-- ============================================================================
-- SETUP DE AUTENTICAÇÃO REAL - DUDUFISIO-AI
-- ============================================================================
-- Execute este script no Supabase SQL Editor para configurar autenticação
-- Dashboard: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql
-- ============================================================================

-- ============================================================================
-- PASSO 1: Criar Usuário no Supabase Auth
-- ============================================================================
-- ⚠️ ATENÇÃO: Este passo deve ser feito MANUALMENTE via Dashboard!
-- Não é possível criar usuários via SQL no auth.users diretamente.
-- 
-- Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
-- Clique em "Add user" → "Create new user"
-- Preencha:
--   - Email: admin@dudufisio.com
--   - Password: demo123456
--   - Auto Confirm User: ✅ Marcar (pular verificação de email)
-- Clique em "Create user"
-- O UUID será usado automaticamente pelos scripts abaixo
-- 
-- Depois de criar o usuário, execute os comandos abaixo.

-- ============================================================================
-- PASSO 2: Verificar Tabelas Necessárias
-- ============================================================================

-- Verificar se as tabelas existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'therapists', 'patients', 'appointments')
ORDER BY table_name;

-- Se alguma tabela não existir, aplicar: supabase/migrations/20250117000002_core_tables.sql

-- ============================================================================
-- PASSO 3: Buscar UUID do Usuário Criado no Auth
-- ============================================================================

-- Verificar se o usuário foi criado no Auth
SELECT 
  id as auth_uuid,
  email,
  created_at,
  confirmed_at
FROM auth.users 
WHERE email = 'admin@dudufisio.com';

-- ⚠️ COPIE o UUID retornado (coluna auth_uuid) para usar no próximo passo

-- ============================================================================
-- PASSO 4: Criar Registro na Tabela public.users
-- ============================================================================

-- VERSÃO AUTOMÁTICA: Cria o registro automaticamente usando o UUID do auth.users
-- Esta é a forma mais simples - não precisa copiar/colar UUID manualmente
INSERT INTO public.users (
  id,
  auth_id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  au.id,
  'admin@dudufisio.com',
  'Admin Demo',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@dudufisio.com'
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- OU VERSÃO MANUAL (se preferir):
-- Descomente as linhas abaixo e substitua <AUTH_UUID>
-- INSERT INTO public.users (id, auth_id, email, full_name, role, is_active, created_at, updated_at)
-- VALUES (uuid_generate_v4(), '<AUTH_UUID>'::uuid, 'admin@dudufisio.com', 'Admin Demo', 'admin', true, NOW(), NOW())
-- ON CONFLICT (auth_id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();

-- Verificar se foi criado
SELECT 
  id as user_id,
  auth_id,
  email,
  full_name,
  role,
  is_active
FROM public.users
WHERE email = 'admin@dudufisio.com';

-- ============================================================================
-- PASSO 5: Criar Registro na Tabela public.therapists (OPCIONAL)
-- ============================================================================

-- Criar terapeuta vinculado ao usuário
INSERT INTO public.therapists (
  id,
  user_id,
  name,
  specialization,
  professional_id,
  phone,
  email,
  is_active,
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  u.id,
  'Admin Demo',
  'Fisioterapeuta',
  'CREFITO-12345',
  '(11) 99999-9999',
  'admin@dudufisio.com',
  true,
  NOW(),
  NOW()
FROM public.users u
WHERE u.email = 'admin@dudufisio.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar se foi criado
SELECT 
  t.id as therapist_id,
  t.name,
  t.email,
  t.specialization,
  t.is_active,
  u.full_name as user_name,
  u.role as user_role
FROM public.therapists t
JOIN public.users u ON t.user_id = u.id
WHERE t.email = 'admin@dudufisio.com';

-- ============================================================================
-- PASSO 6: Verificar Políticas RLS
-- ============================================================================

-- Verificar que RLS está habilitado em appointments
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'appointments' 
  AND schemaname = 'public';
-- Deve retornar: rowsecurity = true

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Deve incluir policy "Staff can manage appointments" ou similar

-- ============================================================================
-- PASSO 7: Testar Permissões (EXECUTAR APÓS FAZER LOGIN)
-- ============================================================================

-- Este comando só funcionará após fazer login na aplicação
-- Ele testa se o usuário autenticado tem as permissões corretas
SELECT 
  auth.uid() as current_auth_uuid,
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('admin', 'manager', 'therapist', 'receptionist')
    AND is_active = TRUE
  ) AS has_permission;
-- Deve retornar: has_permission = true

-- ============================================================================
-- QUERIES DE VERIFICAÇÃO FINAL
-- ============================================================================

-- Resumo completo do usuário configurado
SELECT 
  'auth.users' as source,
  au.id::text as id,
  au.email,
  'N/A' as role,
  au.created_at
FROM auth.users au
WHERE au.email = 'admin@dudufisio.com'

UNION ALL

SELECT 
  'public.users' as source,
  u.id::text as id,
  u.email,
  u.role,
  u.created_at
FROM public.users u
WHERE u.email = 'admin@dudufisio.com'

UNION ALL

SELECT 
  'public.therapists' as source,
  t.id::text as id,
  t.email,
  t.specialization as role,
  t.created_at
FROM public.therapists t
WHERE t.email = 'admin@dudufisio.com';

-- ============================================================================
-- ROLLBACK (Se necessário desfazer)
-- ============================================================================

/*
-- Descomentar e executar apenas se precisar desfazer as mudanças:

DELETE FROM public.therapists 
WHERE user_id IN (
  SELECT id FROM public.users WHERE email = 'admin@dudufisio.com'
);

DELETE FROM public.users 
WHERE email = 'admin@dudufisio.com';

-- Deletar usuário do Auth via Dashboard:
-- Authentication → Users → Encontrar admin@dudufisio.com → Delete User
*/

