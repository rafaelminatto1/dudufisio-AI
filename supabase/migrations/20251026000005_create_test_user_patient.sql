-- ============================================================================
-- CRIAR USUÁRIO/PACIENTE DE TESTE NA TABELA USERS
-- ============================================================================
-- Migração: Cria o paciente RAFAEL na tabela users
-- Data: 2025-10-26
-- Descrição: Como appointments.patient_id referencia users(id), 
--            precisamos criar o paciente lá
-- ============================================================================

-- Inserir paciente na tabela users
INSERT INTO users (id, email, full_name, role, is_active, created_at)
VALUES (
  '1a6f8210-be2d-436b-b023-3a89dd21fa25'::uuid,
  'rafael@teste.com',
  'RAFAEL MINATTO DE MARTINO',
  'patient',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
-- Criar mais alguns usuários de teste se necessário
INSERT INTO users (email, full_name, role, is_active, created_at)
SELECT 
  'paciente' || i || '@teste.com',
  'Paciente Teste ' || i,
  'patient',
  TRUE,
  NOW()
FROM generate_series(1, 5) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'patient' AND email LIKE 'paciente%@teste.com' LIMIT 5
);
-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================;
