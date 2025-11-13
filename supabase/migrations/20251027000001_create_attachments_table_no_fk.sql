-- Create attachments table for file storage metadata (without foreign keys)
-- Migration: 20251027000001_create_attachments_table_no_fk.sql

-- Create attachments table without foreign key constraints
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document', 'other')),
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL CHECK (size > 0 AND size <= 10485760), -- Max 10MB
  mime_type VARCHAR(100) NOT NULL,

  -- Relations (no foreign keys for now - will add when other tables exist)
  session_id UUID,
  patient_id UUID,
  uploaded_by UUID,

  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attachments_session_id ON public.attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_attachments_patient_id ON public.attachments(patient_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON public.attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON public.attachments(type);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON public.attachments(uploaded_at DESC);
-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Add trigger for updated_at
DROP TRIGGER IF EXISTS set_attachments_updated_at ON public.attachments;
CREATE TRIGGER set_attachments_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Enable Row Level Security
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
-- RLS Policies

-- Users can only see attachments they uploaded
CREATE POLICY "Users can view their own attachments"
  ON public.attachments
  FOR SELECT
  USING (auth.uid() = uploaded_by);
-- Users can insert attachments
CREATE POLICY "Users can insert attachments"
  ON public.attachments
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);
-- Users can update their own attachments
CREATE POLICY "Users can update their own attachments"
  ON public.attachments
  FOR UPDATE
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);
-- Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
  ON public.attachments
  FOR DELETE
  USING (auth.uid() = uploaded_by);
-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO service_role;
-- Add comments for documentation
COMMENT ON TABLE public.attachments IS 'Stores metadata for files uploaded to Supabase Storage';
COMMENT ON COLUMN public.attachments.id IS 'Unique identifier for the attachment';
COMMENT ON COLUMN public.attachments.name IS 'Original filename';
COMMENT ON COLUMN public.attachments.type IS 'Type of file: image, video, audio, document, other';
COMMENT ON COLUMN public.attachments.url IS 'Signed URL to access the file';
COMMENT ON COLUMN public.attachments.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN public.attachments.size IS 'File size in bytes (max 10MB)';
COMMENT ON COLUMN public.attachments.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN public.attachments.session_id IS 'Optional: Associated SOAP note session';
COMMENT ON COLUMN public.attachments.patient_id IS 'Optional: Associated patient';
COMMENT ON COLUMN public.attachments.uploaded_by IS 'User who uploaded the file';
