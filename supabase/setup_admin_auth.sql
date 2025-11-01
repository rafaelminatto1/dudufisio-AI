-- =====================================================
-- SETUP DE AUTENTICAÇÃO ADMIN PARA DUDUFISIO-AI
-- =====================================================
-- Execute este script no Supabase Dashboard → SQL Editor
-- após criar o usuário admin@dudufisio.com no Auth
-- =====================================================

-- ⚠️ IMPORTANTE: Antes de executar este script:
-- 1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/auth/users
-- 2. Clique em "Add user" → "Create new user"
-- 3. Email: admin@dudufisio.com
-- 4. Password: DuduFisio2024!
-- 5. Marque "Auto Confirm User" ✅
-- 6. Anote o UUID gerado (aparece na coluna ID)
-- 7. Substitua <AUTH_UUID> abaixo pelo UUID anotado

-- =====================================================
-- PASSO 1: Verificar se as tabelas necessárias existem
-- =====================================================

-- Verificar tabelas users e therapists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'therapists');

-- Se não retornar as tabelas, você precisa aplicar a migration:
-- supabase/migrations/20250117000002_core_tables.sql

-- =====================================================
-- PASSO 2: Verificar se o usuário foi criado no Auth
-- =====================================================

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@dudufisio.com';

-- Deve retornar 1 registro com o UUID
-- ⚠️ COPIE O UUID DA COLUNA "id" - você vai precisar dele!

-- =====================================================
-- PASSO 3: Criar registro na tabela public.users
-- =====================================================

-- 🔴 SUBSTITUA <AUTH_UUID> pelo UUID do passo anterior
-- Exemplo: '12345678-1234-1234-1234-123456789abc'

INSERT INTO public.users (
  id,
  auth_id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '<AUTH_UUID>'::uuid,  -- ⚠️ SUBSTITUIR AQUI
  'admin@dudufisio.com',
  'Admin Demo',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar se foi criado
SELECT 
  id,
  auth_id,
  email,
  full_name,
  role,
  is_active
FROM public.users 
WHERE email = 'admin@dudufisio.com';

-- =====================================================
-- PASSO 4: (OPCIONAL) Criar registro de terapeuta
-- =====================================================

-- Se o admin também for terapeuta, execute:

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

-- Verificar therapist criado
SELECT 
  t.id,
  t.name,
  t.user_id,
  t.specialization,
  u.email
FROM public.therapists t
JOIN public.users u ON t.user_id = u.id
WHERE u.email = 'admin@dudufisio.com';

-- =====================================================
-- PASSO 5: Verificar políticas RLS
-- =====================================================

-- Verificar que as políticas permitem operações do admin
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'appointments' 
  AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Deve incluir "Staff can manage appointments" com cmd = 'ALL'

-- =====================================================
-- PASSO 6: Testar permissões manualmente
-- =====================================================

-- Execute esta query APÓS fazer login no app
-- Ela deve retornar TRUE se o usuário tiver permissões corretas

SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE auth_id = auth.uid()
  AND role IN ('admin', 'manager', 'therapist', 'receptionist')
  AND is_active = TRUE
) AS user_has_permission;

-- Deve retornar: true

-- =====================================================
-- PASSO 7: Verificar vinculação completa
-- =====================================================

-- Query completa para verificar todos os vínculos
SELECT 
  au.id AS auth_user_id,
  au.email AS auth_email,
  au.email_confirmed_at,
  u.id AS user_id,
  u.full_name,
  u.role,
  u.is_active,
  t.id AS therapist_id,
  t.name AS therapist_name
FROM auth.users au
LEFT JOIN public.users u ON u.auth_id = au.id
LEFT JOIN public.therapists t ON t.user_id = u.id
WHERE au.email = 'admin@dudufisio.com';

-- Deve retornar 1 registro com todos os dados preenchidos

-- =====================================================
-- ROLLBACK (Se necessário desfazer)
-- =====================================================

-- Se precisar reverter as mudanças:
/*
-- Deletar therapist
DELETE FROM public.therapists 
WHERE user_id IN (
  SELECT id FROM public.users WHERE email = 'admin@dudufisio.com'
);

-- Deletar user
DELETE FROM public.users 
WHERE email = 'admin@dudufisio.com';

-- Deletar do Auth (fazer manualmente no Dashboard)
-- Authentication → Users → Encontrar admin@dudufisio.com → Delete User
*/

-- =====================================================
-- CREDENCIAIS PARA LOGIN
-- =====================================================

-- Após completar todos os passos, use estas credenciais no app:
-- Email: admin@dudufisio.com
-- Password: DuduFisio2024!

-- ✅ FIM DO SCRIPT

