-- =====================================================
-- MIGRATION: Storage Policies para App de Pacientes
-- Data: 2025-11-06
-- Descrição: Policies para bucket exercise-videos
-- =====================================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-videos',
  'exercise-videos',
  TRUE,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']::text[];

-- Storage policies para exercise-videos bucket

-- Terapeutas podem fazer upload
DROP POLICY IF EXISTS "Therapists can upload videos" ON storage.objects;
CREATE POLICY "Therapists can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-videos' AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Qualquer pessoa pode visualizar vídeos (bucket público)
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'exercise-videos');

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can manage videos" ON storage.objects;
CREATE POLICY "Service role can manage videos"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'exercise-videos');

-- Terapeutas podem atualizar seus vídeos
DROP POLICY IF EXISTS "Therapists can update their videos" ON storage.objects;
CREATE POLICY "Therapists can update their videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exercise-videos' AND
    (owner_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'therapist'))
  );

-- Terapeutas podem deletar seus vídeos
DROP POLICY IF EXISTS "Therapists can delete their videos" ON storage.objects;
CREATE POLICY "Therapists can delete their videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exercise-videos' AND
    (owner_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'therapist'))
  );

