-- =====================================================
-- VERIFICAÇÃO DE TABELAS NECESSÁRIAS
-- =====================================================
-- Execute este script para verificar se todas as tabelas
-- necessárias existem antes de configurar autenticação
-- =====================================================

-- 1. Verificar se extensão uuid-ossp está habilitada
SELECT 
  extname,
  extversion
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Se não retornar resultado, habilitar com:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. Verificar tabelas principais
-- =====================================================

SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'therapists', 'patients', 'appointments')
ORDER BY table_name;

-- Deve retornar 4 tabelas:
-- ✅ appointments
-- ✅ patients
-- ✅ therapists
-- ✅ users

-- =====================================================
-- 3. Verificar colunas da tabela users
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Deve incluir pelo menos:
-- ✅ id (uuid)
-- ✅ auth_id (uuid) - IMPORTANTE para vincular com auth.users
-- ✅ email (text)
-- ✅ full_name (text)
-- ✅ role (text)
-- ✅ is_active (boolean)

-- =====================================================
-- 4. Verificar colunas da tabela therapists
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'therapists'
ORDER BY ordinal_position;

-- Deve incluir pelo menos:
-- ✅ id (uuid)
-- ✅ user_id (uuid) - IMPORTANTE para vincular com users
-- ✅ name (text)
-- ✅ email (text)

-- =====================================================
-- 5. Verificar Foreign Keys
-- =====================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('users', 'therapists', 'appointments')
ORDER BY tc.table_name, kcu.column_name;

-- Verificações importantes:
-- ✅ therapists.user_id → users.id
-- ✅ appointments.patient_id → patients.id
-- ✅ appointments.therapist_id → therapists.id

-- =====================================================
-- 6. Verificar índices únicos
-- =====================================================

SELECT
  t.tablename,
  i.indexname,
  array_agg(a.attname ORDER BY a.attnum) AS column_names,
  i.indexdef
FROM pg_indexes i
JOIN pg_class c ON c.relname = i.indexname
JOIN pg_index ix ON ix.indexrelid = c.oid
JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = ANY(ix.indkey)
JOIN pg_tables t ON t.tablename = i.tablename
WHERE t.schemaname = 'public'
  AND i.tablename IN ('users', 'therapists')
  AND ix.indisunique = true
GROUP BY t.tablename, i.indexname, i.indexdef
ORDER BY t.tablename, i.indexname;

-- Verificar:
-- ✅ users deve ter índice único em auth_id
-- ✅ users deve ter índice único em email
-- ✅ therapists deve ter índice único em user_id ou email

-- =====================================================
-- 7. Verificar RLS (Row Level Security)
-- =====================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'therapists', 'appointments')
ORDER BY tablename;

-- RLS deve estar habilitado (rowsecurity = true) para:
-- ✅ appointments
-- ✅ patients (se usar)
-- Pode estar desabilitado temporariamente em dev para users/therapists

-- =====================================================
-- 8. Verificar políticas RLS existentes
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'therapists', 'appointments')
ORDER BY tablename, cmd, policyname;

-- Deve incluir políticas para appointments que permitam
-- operações para roles: admin, manager, therapist, receptionist

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

-- ✅ Todas as 4 tabelas existem
-- ✅ Tabela users tem coluna auth_id (uuid)
-- ✅ Tabela therapists tem coluna user_id (uuid)
-- ✅ Foreign keys estão configuradas
-- ✅ RLS está habilitado em appointments
-- ✅ Políticas RLS permitem operações para staff

-- =====================================================
-- SE ALGUMA TABELA NÃO EXISTIR
-- =====================================================

-- Execute a migration principal:
-- Arquivo: supabase/migrations/20250117000002_core_tables.sql
-- 
-- Ou execute via Supabase CLI:
-- supabase db push
-- 
-- Ou manualmente via Dashboard:
-- https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql

-- ✅ FIM DA VERIFICAÇÃO

