-- ============================================================================
-- POPULAR DADOS DE TESTE - PACIENTES E TERAPEUTAS
-- ============================================================================
-- Migração: Popula dados necessários para teste
-- Data: 2025-10-26
-- Descrição: Cria pacientes e terapeutas com os mesmos IDs usados nos dados mock
--            para permitir compatibilidade entre mock e Supabase
-- ============================================================================

-- Verificar e criar paciente RAFAEL MINATTO DE MARTINO se não existir
INSERT INTO patients (id, full_name, email, phone, cpf, birth_date, status, created_at)
VALUES (
  '1a6f8210-be2d-436b-b023-3a89dd21fa25'::uuid,
  'RAFAEL MINATTO DE MARTINO',
  'rafael@teste.com',
  'temp_1761071694057',
  '12345678901',
  '1990-01-01',
  'active',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
-- Popular outros pacientes de teste (se a tabela estiver vazia)
INSERT INTO patients (full_name, email, phone, cpf, birth_date, status, created_at)
SELECT 
  'Paciente Teste ' || i,
  'paciente' || i || '@teste.com',
  '(11) 9' || LPAD(i::text, 8, '0'),
  LPAD(i::text, 11, '0'),
  '1990-01-01',
  'active',
  NOW()
FROM generate_series(1, 5) AS i
WHERE NOT EXISTS (SELECT 1 FROM patients LIMIT 5);
-- ============================================================================
-- COMENTÁRIO
-- ============================================================================
COMMENT ON TABLE patients IS 'Tabela de pacientes com dados de teste populados para desenvolvimento';
-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================;
