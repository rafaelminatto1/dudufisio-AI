-- ============================================================================
-- ATUALIZAR ROLES - Versão Segura
-- Primeiro execute DESCOBRIR_VALORES_CORRETOS.sql para ver os valores
-- ============================================================================

-- Ver valores corretos do enum
SELECT unnest(enum_range(NULL::user_role)) as valor_valido;

-- Depois use um dos valores retornados acima
-- Exemplo baseado nos valores comuns:

-- Se o enum tem: 'admin', 'therapist', 'patient'
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@dudufisio.com';

UPDATE users 
SET role = 'therapist' 
WHERE email = 'therapist@dudufisio.com';

UPDATE users 
SET role = 'patient' 
WHERE email = 'patient@dudufisio.com';

-- O educador pode não existir no enum, usar uma alternativa:
UPDATE users 
SET role = 'therapist'  -- ou outro valor válido
WHERE email = 'educator@dudufisio.com';

-- OU verificar se existe 'partner' ou 'educador'
-- UPDATE users SET role = 'partner' WHERE email = 'educator@dudufisio.com';

-- Verificar resultado
SELECT email, name, role 
FROM users 
WHERE email LIKE '%@dudufisio.com';

