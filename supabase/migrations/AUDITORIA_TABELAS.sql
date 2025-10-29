-- =====================================================
-- AUDITORIA COMPLETA DAS TABELAS DO SUPABASE
-- Script para verificar todas as tabelas necessárias
-- =====================================================

-- 1. Listar todas as tabelas existentes
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_name IN (
      'users', 'user_profiles', 'patients', 'appointments', 'therapists',
      'soap_notes', 'sessions', 'session_evolutions', 'body_map_sessions', 'body_map_pain_regions',
      'surgeries', 'patient_goals', 'pathologies', 'mandatory_test_alerts', 'tests', 'test_results',
      'exercises', 'exercise_protocols', 'patient_exercises', 'exercise_completions',
      'clinical_materials', 'clinical_material_media', 'clinical_material_tasks', 'clinical_material_links',
      'suppliers', 'supplies', 'stock_movements', 'purchase_orders', 'purchase_order_items', 'supply_alerts',
      'communication_logs', 'notifications', 'waitlist', 'schedule_blocks',
      'attachments'
    ) THEN '✅ NECESSÁRIA'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY 
  CASE 
    WHEN table_name IN ('users', 'user_profiles', 'patients', 'appointments') THEN 1
    WHEN table_name LIKE '%session%' OR table_name LIKE '%body_map%' THEN 2
    WHEN table_name IN ('soap_notes', 'surgeries', 'patient_goals', 'pathologies') THEN 3
    WHEN table_name LIKE '%exercise%' THEN 4
    WHEN table_name LIKE '%clinical%' THEN 5
    WHEN table_name LIKE '%suppl%' OR table_name LIKE '%stock%' OR table_name LIKE '%purchase%' THEN 6
    WHEN table_name IN ('notifications', 'waitlist', 'schedule_blocks', 'communication_logs') THEN 7
    ELSE 8
  END,
  table_name;

-- 2. Verificar tabelas críticas que podem estar faltando
WITH required_tables AS (
  SELECT unnest(ARRAY[
    'users', 'user_profiles', 'patients', 'appointments', 'therapists',
    'soap_notes', 'surgeries', 'patient_goals', 'pathologies', 'mandatory_test_alerts',
    'body_map_sessions', 'body_map_pain_regions', 'notifications', 'waitlist', 'schedule_blocks'
  ]) as table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
)
SELECT 
  rt.table_name,
  CASE 
    WHEN et.table_name IS NOT NULL THEN '✅ EXISTE'
    ELSE '❌ FALTANDO'
  END as status
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name
ORDER BY 
  CASE 
    WHEN et.table_name IS NOT NULL THEN 1
    ELSE 2
  END,
  rt.table_name;

-- 3. Verificar estrutura das tabelas core
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('patients', 'appointments', 'users')
ORDER BY table_name, ordinal_position;

-- 4. Verificar RLS nas tabelas importantes
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'patients', 'appointments', 'users', 'body_map_sessions', 'body_map_pain_regions',
  'soap_notes', 'surgeries', 'patient_goals', 'pathologies'
)
ORDER BY tablename, policyname;

-- 5. Verificar Storage Buckets
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY created_at;
