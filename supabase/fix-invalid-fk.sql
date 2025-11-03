-- =====================================================
-- Fix: Remover appointments com foreign keys inválidas
-- Problema: 2 appointments referenciam patient_id inexistente
-- Patient ID: 183bf3f6-1218-495b-bb0d-a58c2f75c8d2 (não existe)
-- =====================================================

-- Verificar os appointments que serão removidos
SELECT 
    id,
    patient_id,
    therapist_id,
    start_time,
    status,
    'Este appointment será removido (patient_id inválido)' as observacao
FROM appointments 
WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

-- DESCOMENTAR A LINHA ABAIXO PARA EXECUTAR A LIMPEZA:
-- DELETE FROM appointments WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

-- Verificar resultado (deve retornar 0 linhas após DELETE)
-- SELECT COUNT(*) FROM appointments WHERE patient_id = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

