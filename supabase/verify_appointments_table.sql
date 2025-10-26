-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO DA TABELA APPOINTMENTS
-- ============================================================================
-- Execute este script no Supabase Dashboard → SQL Editor
-- para verificar se a tabela appointments está corretamente configurada
-- ============================================================================

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'appointments';

-- 2. Verificar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'appointments'
  AND schemaname = 'public'
ORDER BY indexname;

-- 4. Verificar foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'appointments'
  AND tc.table_schema = 'public';

-- 5. Verificar RLS (Row Level Security)
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'appointments'
  AND schemaname = 'public';

-- 6. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'appointments'
  AND schemaname = 'public';

-- 7. Verificar realtime
SELECT * 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename = 'appointments';

-- 8. Testar inserção (rollback automático)
BEGIN;
  -- Tentar inserir um agendamento de teste
  INSERT INTO appointments (
    patient_id,
    therapist_id,
    start_time,
    end_time,
    duration,
    title,
    status,
    type
  ) 
  SELECT 
    (SELECT id FROM users WHERE role = 'patient' LIMIT 1),
    (SELECT id FROM users WHERE role = 'therapist' LIMIT 1),
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    60,
    'Teste de Inserção',
    'scheduled',
    'regular'
  WHERE EXISTS (SELECT 1 FROM users WHERE role = 'patient')
    AND EXISTS (SELECT 1 FROM users WHERE role = 'therapist');
    
  -- Verificar se inseriu
  SELECT 
    COUNT(*) as test_insert_count,
    'Se este número for 1, a inserção funcionou!' as message
  FROM appointments 
  WHERE title = 'Teste de Inserção';
  
ROLLBACK; -- Desfaz a inserção de teste

-- 9. Contar agendamentos existentes
SELECT 
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM appointments;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- 1. Tabela deve existir (appointments | BASE TABLE)
-- 2. Deve ter colunas: id, patient_id, therapist_id, start_time, end_time, etc.
-- 3. Deve ter índices para performance
-- 4. Foreign keys devem apontar para users(id)
-- 5. RLS deve estar habilitado (rowsecurity = t)
-- 6. Deve ter políticas RLS configuradas
-- 7. Realtime deve estar habilitado
-- 8. Inserção de teste deve funcionar
-- ============================================================================

