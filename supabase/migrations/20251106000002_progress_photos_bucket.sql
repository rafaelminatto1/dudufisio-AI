-- ============================================================================
-- Migration: Progress Photos Storage Bucket
-- Descrição: Configura bucket para fotos de progresso dos pacientes
-- Data: 2025-11-06
-- ============================================================================

-- Nota: A criação de buckets no Supabase Storage geralmente é feita via Dashboard
-- ou via código. Este arquivo documenta a configuração necessária.

-- ============================================================================
-- INSTRUÇÕES PARA CONFIGURAÇÃO MANUAL VIA SUPABASE DASHBOARD:
-- ============================================================================
--
-- 1. Acesse: https://supabase.com/dashboard/project/[PROJECT_ID]/storage/buckets
--
-- 2. Clique em "Create Bucket" (Criar bucket)
--
-- 3. Configure o bucket com as seguintes opções:
--    - Name: progress-photos
--    - Public: NO (deixe desmarcado para acesso autenticado)
--    - File size limit: 2MB (2097152 bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- 4. Clique em "Create bucket"
--
-- ============================================================================

-- Criar políticas de acesso para o bucket progress-photos
-- (Execute após criar o bucket via Dashboard)

-- NOTA: As políticas de storage devem ser criadas via Dashboard após criar o bucket
-- ou usando a API do Supabase. A tabela storage.policies pode não estar disponível
-- em ambientes locais sem storage configurado.

-- Policies a serem configuradas via Dashboard:
-- 1. Name: "Therapists can upload progress photos"
--    Operation: INSERT
--    Policy definition: bucket_id = 'progress-photos' AND auth.role() = 'authenticated'
--
-- 2. Name: "Therapists can view progress photos"  
--    Operation: SELECT
--    Policy definition: bucket_id = 'progress-photos' AND auth.role() = 'authenticated'
--
-- 3. Name: "Therapists can delete progress photos"
--    Operation: DELETE
--    Policy definition: bucket_id = 'progress-photos' AND auth.role() = 'authenticated'

-- ============================================================================
-- Função helper para criar bucket programaticamente (se necessário)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_progress_photos_bucket()
RETURNS VOID AS $$
BEGIN
  -- Verificar se o bucket já existe
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'progress-photos'
  ) THEN
    -- Inserir bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'progress-photos',
      'progress-photos',
      false, -- não público
      2097152, -- 2MB
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    
    RAISE NOTICE 'Bucket progress-photos criado com sucesso';
  ELSE
    RAISE NOTICE 'Bucket progress-photos já existe';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION create_progress_photos_bucket IS 
  'Cria o bucket progress-photos para armazenar fotos de progresso dos pacientes';

-- ============================================================================
-- Executar criação do bucket (descomente se quiser criar via SQL)
-- ============================================================================
-- SELECT create_progress_photos_bucket();

-- ============================================================================
-- Documentação adicional
-- ============================================================================

-- NOTA: Não é possível adicionar comentários na tabela storage.buckets sem permissões especiais
-- O bucket progress-photos armazena fotos de progresso dos pacientes 
-- organizadas por patientId/sessionId/filename

