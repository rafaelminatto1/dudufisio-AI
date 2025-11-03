-- =====================================================
-- Fix: Remover appointments e suas dependências
-- Problema: appointments com patient_id inválido + appointment_requests relacionados
-- =====================================================

-- IDs dos appointments que serão removidos:
-- 41ebbc92-1a58-43c2-bd7d-1672a144355b
-- 7b38db0f-2ab6-4e39-8302-d761012537bf

-- Patient ID inválido: 183bf3f6-1218-495b-bb0d-a58c2f75c8d2

BEGIN;

-- 1. Verificar appointments que serão removidos
SELECT 
    id,
    patient_id,
    therapist_id,
    start_time,
    status,
    'Este appointment será removido (patient_id inválido)' as observacao
FROM appointments 
WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

-- 2. Verificar appointment_requests relacionados (se a tabela existir)
-- DESCOMENTAR se appointment_requests existir:
-- SELECT 
--     ar.id,
--     ar.appointment_id,
--     'Este appointment_request será removido' as observacao
-- FROM appointment_requests ar
-- WHERE ar.appointment_id IN (
--     SELECT id FROM appointments 
--     WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2'
-- );

-- 3. Remover appointment_requests relacionados PRIMEIRO
-- DESCOMENTAR para executar:
-- DELETE FROM appointment_requests
-- WHERE appointment_id IN (
--     SELECT id FROM appointments 
--     WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2'
-- );

-- 4. Remover appointments órfãos
-- DESCOMENTAR para executar:
-- DELETE FROM appointments 
-- WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

-- 5. Verificar resultado (deve retornar 0 linhas)
-- SELECT COUNT(*) as appointments_restantes 
-- FROM appointments 
-- WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

-- Se tudo estiver OK, executar COMMIT
-- Caso contrário, executar ROLLBACK
ROLLBACK; -- Mudar para COMMIT quando estiver pronto para aplicar

