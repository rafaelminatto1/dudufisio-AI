-- Executar função para criar bucket progress-photos
SELECT create_progress_photos_bucket();

-- Verificar se foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'progress-photos';

