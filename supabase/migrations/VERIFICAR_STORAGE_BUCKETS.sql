-- =====================================================
-- VERIFICAR E CRIAR STORAGE BUCKETS NECESSÁRIOS
-- =====================================================

-- 1. Verificar buckets existentes
SELECT 
  id,
  name,
  public,
  created_at,
  CASE 
    WHEN name IN ('clinical-materials', 'attachments', 'patient-files', 'exercises') THEN '✅ NECESSÁRIO'
    ELSE '⚠️ VERIFICAR'
  END as status
FROM storage.buckets
ORDER BY created_at;

-- 2. Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  -- Bucket para materiais clínicos (público)
  (
    'clinical-materials',
    'clinical-materials', 
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain']
  ),
  -- Bucket para anexos gerais (privado)
  (
    'attachments',
    'attachments',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  ),
  -- Bucket para arquivos de pacientes (privado)
  (
    'patient-files',
    'patient-files',
    false,
    104857600, -- 100MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  ),
  -- Bucket para exercícios (público)
  (
    'exercises',
    'exercises',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar políticas de storage existentes
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;

-- 4. Criar políticas básicas para os buckets (se não existirem)

-- Política para clinical-materials (público)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'clinical-materials-public-read',
  'clinical-materials',
  'true',
  'true'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'clinical-materials-authenticated-upload',
  'clinical-materials',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated'''
) ON CONFLICT (name) DO NOTHING;

-- Política para attachments (apenas autenticados)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'attachments-authenticated-access',
  'attachments',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated'''
) ON CONFLICT (name) DO NOTHING;

-- Política para patient-files (apenas terapeutas e admins)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'patient-files-therapist-access',
  'patient-files',
  'auth.uid() IN (SELECT id FROM users WHERE role IN (''therapist'', ''admin'', ''manager''))',
  'auth.uid() IN (SELECT id FROM users WHERE role IN (''therapist'', ''admin'', ''manager''))'
) ON CONFLICT (name) DO NOTHING;

-- Política para exercises (público)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'exercises-public-read',
  'exercises',
  'true',
  'true'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'exercises-authenticated-upload',
  'exercises',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated'''
) ON CONFLICT (name) DO NOTHING;

-- 5. Verificar resultado final
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE name IN ('clinical-materials', 'attachments', 'patient-files', 'exercises')
ORDER BY name;
