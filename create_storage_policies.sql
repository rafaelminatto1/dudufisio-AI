-- Criar políticas de acesso para o bucket progress-photos

-- 1. Política SELECT: Terapeutas autenticados podem visualizar fotos
INSERT INTO storage.objects_policies (
  name,
  bucket_id,
  operation,
  definition
) VALUES (
  'Therapists can view progress photos',
  'progress-photos',
  'SELECT',
  '(bucket_id = ''progress-photos''::text AND (auth.role() = ''authenticated''::text))'
)
ON CONFLICT DO NOTHING;

-- 2. Política INSERT: Terapeutas autenticados podem fazer upload
INSERT INTO storage.objects_policies (
  name,
  bucket_id,
  operation,
  definition
) VALUES (
  'Therapists can upload progress photos',
  'progress-photos',
  'INSERT',
  '(bucket_id = ''progress-photos''::text AND (auth.role() = ''authenticated''::text))'
)
ON CONFLICT DO NOTHING;

-- 3. Política UPDATE: Terapeutas autenticados podem atualizar
INSERT INTO storage.objects_policies (
  name,
  bucket_id,
  operation,
  definition
) VALUES (
  'Therapists can update progress photos',
  'progress-photos',
  'UPDATE',
  '(bucket_id = ''progress-photos''::text AND (auth.role() = ''authenticated''::text))'
)
ON CONFLICT DO NOTHING;

-- 4. Política DELETE: Terapeutas autenticados podem deletar fotos
INSERT INTO storage.objects_policies (
  name,
  bucket_id,
  operation,
  definition
) VALUES (
  'Therapists can delete progress photos',
  'progress-photos',
  'DELETE',
  '(bucket_id = ''progress-photos''::text AND (auth.role() = ''authenticated''::text))'
)
ON CONFLICT DO NOTHING;

-- Verificar políticas criadas
SELECT name, bucket_id, operation FROM storage.objects_policies WHERE bucket_id = 'progress-photos';

