-- ============================================================================
-- SEED: Criar dados de demonstração para usuários
-- ============================================================================

-- Atualizar profiles dos usuários criados no Supabase Dashboard
-- Os usuários devem ser criados primeiro via Dashboard em auth.users

-- Admin
UPDATE users 
SET 
  full_name = 'Administrador do Sistema',
  role = 'admin',
  status = 'active',
  email_verified = true
WHERE email = 'admin@dudufisio.com';

-- Therapist (usando email existente)
UPDATE users 
SET 
  full_name = 'Dr. João Silva',
  role = 'therapist',
  status = 'active',
  email_verified = true
WHERE email = 'terapeuta@dudufisio.com';

-- Patient (usando email existente)
UPDATE users 
SET 
  full_name = 'Maria Santos',
  role = 'patient',
  status = 'active',
  email_verified = true
WHERE email = 'paciente@dudufisio.com';

-- Patient Teste Payment (atualizar também)
UPDATE users 
SET 
  full_name = 'Paciente Teste Pagamentos',
  role = 'patient',
  status = 'active',
  email_verified = true
WHERE email = 'teste-payment@dudufisio.com';

-- Educator (se não existir, será criado quando o usuário for criado no Dashboard)
UPDATE users 
SET 
  full_name = 'João Educador Físico',
  role = 'educator',
  status = 'active',
  email_verified = true
WHERE email = 'educator@dudufisio.com';

-- Verificar resultado
SELECT 
  email, 
  full_name, 
  role, 
  status, 
  email_verified 
FROM users 
WHERE email LIKE '%@dudufisio.com'
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'therapist' THEN 2
    WHEN 'educator' THEN 3
    WHEN 'patient' THEN 4
  END;

