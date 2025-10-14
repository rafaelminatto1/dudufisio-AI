-- ============================================================================
-- MIGRATION: Seed Test Data for Body Map
-- Data: 2025-10-14
-- Descrição: Inserir dados de teste para o sistema de mapa corporal
-- ============================================================================

-- Inserir sessão de teste para o paciente patient-1 (PAT-001)
INSERT INTO body_map_sessions (
  id,
  patient_id,
  session_date,
  main_complaint_region,
  main_complaint_description,
  overall_pain_level,
  pain_free,
  notes,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'patient-1',
  NOW() - INTERVAL '7 days',
  'lombar',
  'Dor lombar após exercício de levantamento de peso',
  6,
  false,
  'Paciente relata dor intensa ao realizar movimentos de flexão. Iniciado protocolo de fortalecimento da musculatura do core.',
  'mock-admin-1',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
) ON CONFLICT DO NOTHING;

-- Inserir segunda sessão (evolução após 5 dias)
INSERT INTO body_map_sessions (
  id,
  patient_id,
  session_date,
  main_complaint_region,
  main_complaint_description,
  overall_pain_level,
  pain_free,
  notes,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'patient-1',
  NOW() - INTERVAL '2 days',
  'lombar',
  'Melhora significativa da dor lombar',
  3,
  false,
  'Paciente apresenta evolução positiva. Dor diminuiu consideravelmente. Continuar protocolo.',
  'mock-admin-1',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
) ON CONFLICT DO NOTHING;

-- Inserir terceira sessão (última - sem dor)
INSERT INTO body_map_sessions (
  id,
  patient_id,
  session_date,
  main_complaint_region,
  main_complaint_description,
  overall_pain_level,
  pain_free,
  notes,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'patient-1',
  NOW(),
  NULL,
  'Paciente relata ausência completa de dor',
  0,
  true,
  'Excelente evolução! Paciente sem queixas álgicas. Alta programada para próxima sessão.',
  'mock-admin-1',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ Dados de teste inseridos para body_map_sessions';
  RAISE NOTICE '   - 3 sessões criadas para patient-1 (PAT-001)';
  RAISE NOTICE '   - Evolução de dor nível 6 → 3 → 0';
END $$;

