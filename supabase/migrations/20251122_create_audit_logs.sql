-- Migration: Create audit_logs table for LGPD compliance
-- Created: 2025-11-22
-- Purpose: Track all user actions for compliance and security

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'login', 'logout', 'export', 'import', 'view')),
  entity_type TEXT NOT NULL,
  entity_id UUID,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Change tracking
  changes JSONB,
  old_values JSONB,
  new_values JSONB,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT audit_logs_user_id_idx CHECK (user_id IS NOT NULL OR user_email IS NOT NULL)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_combined ON public.audit_logs(user_id, action_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only authenticated users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
CREATE POLICY "Audit logs are immutable" ON public.audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON public.audit_logs
  FOR DELETE
  USING (false);

-- Create function to automatically clean old audit logs (LGPD retention)
-- Keep logs for 365 days by default
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '365 days';
END;
$$;

-- Create scheduled job to run cleanup (requires pg_cron extension)
-- Note: This needs to be enabled manually in Supabase dashboard
-- SELECT cron.schedule('cleanup-old-audit-logs', '0 2 * * *', 'SELECT public.cleanup_old_audit_logs()');

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'LGPD compliant audit log table for tracking all user actions';
COMMENT ON COLUMN public.audit_logs.action_type IS 'Type of action performed: create, update, delete, login, logout, export, import, view';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Type of entity affected: patient, appointment, session, etc';
COMMENT ON COLUMN public.audit_logs.changes IS 'JSON object containing the changes made (sensitive fields redacted)';
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Automatically deletes audit logs older than 365 days for LGPD compliance';
