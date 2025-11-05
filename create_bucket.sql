-- Criar bucket progress-photos programaticamente
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'progress-photos',
  'progress-photos',
  false, -- não público
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se foi criado
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'progress-photos';

