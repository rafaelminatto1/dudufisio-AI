-- Create attachments bucket in Supabase Storage
-- Migration: 20251027000008_create_attachments_bucket.sql

-- Create the attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false, -- bucket privado (private)
  10485760, -- 10MB max file size
  ARRAY[
    'image/*', 
    'video/*', 
    'audio/*', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;
-- RLS Policies for storage.objects

-- Policy: Authenticated users can upload attachments
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );
-- Policy: Users can view their own attachments
-- Files are stored as: attachments/{user_id}/{filename}
CREATE POLICY "Users can view their own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
-- Policy: Users can update their own attachments (optional, for metadata updates)
CREATE POLICY "Users can update their own attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
