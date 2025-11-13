-- ============================================================================
-- POPULAR PACIENTES FALTANTES NA TABELA USERS
-- ============================================================================
-- Migração: Cria usuários para todos os patient_id que existem em appointments
-- Data: 2025-10-26
-- Descrição: Garante que todos os appointments têm um paciente válido em users
-- ============================================================================

-- Inserir pacientes faltantes baseado nos IDs dos appointments
-- Para cada patient_id único em appointments que não existe em users
INSERT INTO users (id, email, full_name, role, is_active, created_at)
SELECT DISTINCT
  a.patient_id,
  'paciente_' || LEFT(a.patient_id::text, 8) || '@gerado.com',
  'Paciente ' || LEFT(a.patient_id::text, 8),
  'patient'::user_role,
  TRUE,
  NOW()
FROM appointments a
WHERE a.patient_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = a.patient_id
  );
-- Atualizar o paciente RAFAEL se já existir com nome genérico
UPDATE users
SET full_name = 'RAFAEL MINATTO DE MARTINO',
    email = 'rafael@teste.com'
WHERE id = '1a6f8210-be2d-436b-b023-3a89dd21fa25'::uuid;
-- Fazer o mesmo para therapists que estão nos appointments
INSERT INTO users (id, email, full_name, role, is_active, created_at)
SELECT DISTINCT
  a.therapist_id,
  'terapeuta_' || LEFT(a.therapist_id::text, 8) || '@gerado.com',
  'Terapeuta ' || LEFT(a.therapist_id::text, 8),
  'therapist'::user_role,
  TRUE,
  NOW()
FROM appointments a
WHERE a.therapist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = a.therapist_id
  );
-- Verificar quantos foram criados
SELECT COUNT(*) as total_users_created FROM users WHERE email LIKE '%@gerado.com';
-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================;
