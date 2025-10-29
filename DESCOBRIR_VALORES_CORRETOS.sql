-- ============================================================================
-- DESCROBRIR VALORES CORRETOS DO ENUM user_role
-- ============================================================================

-- Ver todos os valores do enum user_role
SELECT unnest(enum_range(NULL::user_role)) as valor_correto;

-- OU se a tabela já tem dados
SELECT DISTINCT role as valores_atuais FROM users WHERE role IS NOT NULL;

-- Ver estrutura completa da tabela users
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Ver alguns registros existentes para referência
SELECT id, email, name, role, created_at 
FROM users 
LIMIT 5;

