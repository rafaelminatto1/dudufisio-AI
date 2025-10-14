-- ============================================================================
-- 🔍 BUSCAR ID DO PACIENTE PARA TESTAR
-- ============================================================================
-- 
-- Execute este SQL no Supabase Dashboard para pegar o ID de um paciente
-- 
-- Copie o "id" da primeira linha e use no frontend!
-- ============================================================================

SELECT 
  p.id,
  p.full_name as nome,
  p.email,
  p.phone as telefone,
  p.birth_date as nascimento,
  COUNT(bms.id) as total_sessoes_body_map,
  MAX(bms.session_date) as ultima_sessao
FROM patients p
LEFT JOIN body_map_sessions bms ON bms.patient_id = p.id
WHERE bms.id IS NOT NULL
GROUP BY p.id, p.full_name, p.email, p.phone, p.birth_date
ORDER BY COUNT(bms.id) DESC, p.created_at DESC
LIMIT 5;

-- ============================================================================
-- 📋 INSTRUÇÕES:
-- ============================================================================
-- 
-- 1. Copie o 'id' do primeiro paciente (é um UUID longo)
-- 2. Cole em pages/PatientDetailPage.tsx linha 31
-- 3. Ou acesse: http://localhost:5175/patients/[COLE-O-ID-AQUI]
-- 
-- ============================================================================

