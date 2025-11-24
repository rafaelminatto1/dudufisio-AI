-- supabase/migrations/20251118033100_create_audit_logs_table.sql

CREATE TABLE public.audit_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Secure the table with Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be defined in a separate documentation file (supabase/rls_policies.md)
-- Example policy:
-- CREATE POLICY "Allow admins to read all audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));

COMMENT ON TABLE public.audit_logs IS 'Records critical activities and events for auditing purposes.';
COMMENT ON COLUMN public.audit_logs.activity_type IS 'The type of activity being logged (e.g., ''user_login'', ''patient_record_updated'').';
COMMENT ON COLUMN public.audit_logs.details IS 'A JSON object containing specific details about the logged activity.';
