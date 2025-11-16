-- ============================================================================
-- ATUALIZAR ROLES - Versão Direta e Simples
-- Execute no Supabase SQL Editor
-- ============================================================================

BEGIN;

-- Primeiro, ver estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'role';

-- Ver se há valores existentes na coluna role
SELECT DISTINCT role FROM users WHERE role IS NOT NULL LIMIT 10;

-- Atualizar apenas os campos que podemos
UPDATE users 
SET name = 'Administrador'
WHERE email = 'admin@dudufisio.com';

UPDATE users 
SET name = 'Dr. Carlos Silva'
WHERE email = 'therapist@dudufisio.com';

UPDATE users 
SET name = 'Maria Santos'
WHERE email = 'patient@dudufisio.com';

UPDATE users 
SET name = 'João Educador'
WHERE email = 'educator@dudufisio.com';

-- Ver resultado
SELECT email, name, role FROM users WHERE email LIKE '%@dudufisio.com';

COMMIT;

