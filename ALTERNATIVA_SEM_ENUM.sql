-- ============================================================================
-- ALTERNATIVA: Converter role para TEXT se ENUM está causando problemas
-- ============================================================================

-- Se o enum está causando muitos problemas, podemos converter para TEXT

-- 1. Adicionar coluna temporária
ALTER TABLE users ADD COLUMN role_text TEXT;

-- 2. Copiar valores atuais
UPDATE users SET role_text = role::TEXT;

-- 3. Deletar coluna antiga
ALTER TABLE users DROP COLUMN role CASCADE;

-- 4. Renomear coluna nova
ALTER TABLE users RENAME COLUMN role_text TO role;

-- 5. Agora atualizar com valores livres
UPDATE users SET role = 'Admin', name = 'Administrador' WHERE email = 'admin@dudufisio.com';
UPDATE users SET role = 'Therapist', name = 'Dr. Carlos Silva' WHERE email = 'therapist@dudufisio.com';
UPDATE users SET role = 'Patient', name = 'Maria Santos' WHERE email = 'patient@dudufisio.com';
UPDATE users SET role = 'EducadorFisico', name = 'João Educador' WHERE email = 'educator@dudufisio.com';

-- Verificar
SELECT email, name, role FROM users WHERE email LIKE '%@dudufisio.com';

-- ATENÇÃO: Esta solução remove o ENUM e usa TEXT puro
-- Use apenas se realmente necessário!

