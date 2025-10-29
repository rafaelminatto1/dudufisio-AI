-- ============================================================================
-- CORREÇÃO COMPLETA: Atualizar Roles dos Usuários
-- Execute este SQL DEPOIS de verificar os valores corretos do enum
-- ============================================================================

-- PRIMEIRO: Verificar estrutura atual
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%role%'
ORDER BY t.typname, e.enumsortorder;

-- Verificar coluna role na tabela users
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'role';

-- ============================================================================
-- POSSIBILIDADE 1: Se role é TEXT ao invés de ENUM
-- ============================================================================

-- Atualizar usando valores string simples
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@dudufisio.com'
AND EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role' 
            AND data_type = 'text');

UPDATE users 
SET role = 'therapist' 
WHERE email = 'therapist@dudufisio.com'
AND EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role' 
            AND data_type = 'text');

UPDATE users 
SET role = 'patient' 
WHERE email = 'patient@dudufisio.com'
AND EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role' 
            AND data_type = 'text');

UPDATE users 
SET role = 'educadorfisico' 
WHERE email = 'educator@dudufisio.com'
AND EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role' 
            AND data_type = 'text');

-- ============================================================================
-- POSSIBILIDADE 2: Se role é JSONB ou JSON
-- ============================================================================

UPDATE users 
SET role = '"admin"'::jsonb
WHERE email = 'admin@dudufisio.com'
AND EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'role' 
            AND data_type = 'jsonb');

-- ============================================================================
-- POSSIBILIDADE 3: Atualizar usando COALESCE para evitar erro
-- ============================================================================

-- Atualizar apenas se o valor atual for NULL ou diferente
UPDATE users 
SET 
  role = COALESCE(NULLIF(role, role), 'admin'),
  name = COALESCE(NULLIF(name, ''), 'Administrador')
WHERE email = 'admin@dudufisio.com';

-- ============================================================================
-- VERIFICAR RESULTADO
-- ============================================================================

SELECT 
  email,
  name,
  role,
  created_at
FROM users
WHERE email LIKE '%@dudufisio.com'
ORDER BY email;

