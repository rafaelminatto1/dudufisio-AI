-- ============================================================================
-- ATUALIZAR USUÁRIOS - Após ver a estrutura correta
-- ============================================================================

-- PRIMEIRO: Ver estrutura para saber quais colunas existem
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Ver dados atuais dos usuários criados
SELECT * FROM users WHERE email LIKE '%@dudufisio.com';

-- Possíveis nomes de colunas (aplicar conforme o que existe):
-- UPDATE users SET full_name = 'Administrador' WHERE email = 'admin@dudufisio.com';
-- UPDATE users SET display_name = 'Administrador' WHERE email = 'admin@dudufisio.com';
-- UPDATE users SET first_name = 'Administrador' WHERE email = 'admin@dudufisio.com';
-- UPDATE users SET user_name = 'Administrador' WHERE email = 'admin@dudufisio.com';

-- Ou se for JSON
-- UPDATE users SET metadata = '{"name": "Administrador"}'::jsonb WHERE email = 'admin@dudufisio.com';

