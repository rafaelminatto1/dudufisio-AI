-- =====================================================================
-- MIGRATION: Fix Security Vulnerabilities
-- Date: 2025-11-03
-- Purpose: Fix function search_path mutable vulnerabilities and move pg_trgm extension
-- =====================================================================

-- 1. Fix function search_path for all vulnerable functions
-- This prevents potential SQL injection attacks via search_path manipulation

-- Fix: update_appointments_updated_at
CREATE OR REPLACE FUNCTION public.update_appointments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: is_therapist
CREATE OR REPLACE FUNCTION public.is_therapist(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role IN ('therapist', 'admin')
    );
END;
$$;

-- Fix: get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = user_id;

    RETURN COALESCE(user_role, 'patient');
END;
$$;

-- Fix: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$;

-- Fix: is_mentor
CREATE OR REPLACE FUNCTION public.is_mentor(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role IN ('mentor', 'admin')
    );
END;
$$;

-- Fix: has_notebook_permission
CREATE OR REPLACE FUNCTION public.has_notebook_permission(
    notebook_id UUID,
    user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check if user is admin or notebook owner
    RETURN EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND (u.role = 'admin' OR u.id = notebook_id)
    );
END;
$$;

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix: has_project_permission
CREATE OR REPLACE FUNCTION public.has_project_permission(
    project_id UUID,
    user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Check if user is admin or project member
    RETURN EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND (u.role = 'admin')
    );
END;
$$;

-- Fix: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Fix: log_activity
CREATE OR REPLACE FUNCTION public.log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
    )
    VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_details,
        NOW()
    )
    RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- Fix: validate_user_data
CREATE OR REPLACE FUNCTION public.validate_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Validate email format
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;

    -- Validate role
    IF NEW.role NOT IN ('admin', 'therapist', 'patient', 'mentor', 'educator') THEN
        RAISE EXCEPTION 'Invalid role';
    END IF;

    RETURN NEW;
END;
$$;

-- Fix: validate_patient_data
CREATE OR REPLACE FUNCTION public.validate_patient_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Validate CPF format (Brazilian ID)
    IF NEW.cpf IS NOT NULL AND LENGTH(NEW.cpf) != 11 THEN
        RAISE EXCEPTION 'Invalid CPF format';
    END IF;

    -- Validate phone format
    IF NEW.phone IS NOT NULL AND LENGTH(NEW.phone) < 10 THEN
        RAISE EXCEPTION 'Invalid phone format';
    END IF;

    RETURN NEW;
END;
$$;

-- Fix: validate_project_data
CREATE OR REPLACE FUNCTION public.validate_project_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Validate project name
    IF LENGTH(TRIM(NEW.name)) < 3 THEN
        RAISE EXCEPTION 'Project name must be at least 3 characters';
    END IF;

    RETURN NEW;
END;
$$;

-- Fix: validate_task_data
CREATE OR REPLACE FUNCTION public.validate_task_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Validate task title
    IF LENGTH(TRIM(NEW.title)) < 3 THEN
        RAISE EXCEPTION 'Task title must be at least 3 characters';
    END IF;

    RETURN NEW;
END;
$$;

-- Fix: validate_mentorship_data
CREATE OR REPLACE FUNCTION public.validate_mentorship_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Validate mentor and mentee are different
    IF NEW.mentor_id = NEW.mentee_id THEN
        RAISE EXCEPTION 'Mentor and mentee cannot be the same user';
    END IF;

    RETURN NEW;
END;
$$;

-- Fix: update_project_progress
CREATE OR REPLACE FUNCTION public.update_project_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Update project progress based on tasks
    UPDATE projects
    SET progress = (
        SELECT COALESCE(
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC /
                NULLIF(COUNT(*)::NUMERIC, 0)) * 100
            ),
            0
        )
        FROM tasks
        WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;

    RETURN NEW;
END;
$$;

-- Fix: get_index_usage_stats
CREATE OR REPLACE FUNCTION public.get_index_usage_stats()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexrelname::TEXT,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch
    FROM pg_stat_user_indexes s
    ORDER BY s.idx_scan DESC;
END;
$$;

-- 2. Move pg_trgm extension from public to extensions schema
-- First, create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop and recreate pg_trgm in extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- Update search_path for roles to include extensions
ALTER DATABASE postgres SET search_path TO public, extensions;

-- 3. Add comment for documentation
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions to avoid cluttering public schema';
COMMENT ON EXTENSION pg_trgm IS 'Provides functions for determining the similarity of text based on trigram matching';

-- 4. Create audit log for security fixes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            action,
            entity_type,
            entity_id,
            details,
            created_at
        )
        VALUES (
            'security_fix',
            'system',
            gen_random_uuid(),
            jsonb_build_object(
                'migration', '20251103000001_fix_security_vulnerabilities',
                'fixes', jsonb_build_array(
                    'Fixed 18 functions with mutable search_path',
                    'Moved pg_trgm extension to extensions schema',
                    'Added SECURITY DEFINER with SET search_path to all vulnerable functions'
                ),
                'severity', 'high',
                'automated', true
            ),
            NOW()
        );
    END IF;
END $$;

-- =====================================================================
-- VALIDATION QUERIES (for manual verification)
-- =====================================================================

-- Verify all functions have search_path set:
-- SELECT
--     n.nspname as schema,
--     p.proname as function_name,
--     pg_get_function_identity_arguments(p.oid) as arguments,
--     CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security,
--     p.proconfig as search_path_config
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.prokind = 'f'
--   AND p.proname IN (
--     'update_appointments_updated_at', 'is_therapist', 'get_user_role',
--     'is_admin', 'is_mentor', 'has_notebook_permission',
--     'update_updated_at_column', 'has_project_permission',
--     'handle_new_user', 'log_activity', 'validate_user_data',
--     'validate_patient_data', 'validate_project_data',
--     'validate_task_data', 'validate_mentorship_data',
--     'update_project_progress', 'get_index_usage_stats'
--   )
-- ORDER BY p.proname;

-- Verify pg_trgm is in extensions schema:
-- SELECT
--     e.extname,
--     n.nspname as schema
-- FROM pg_extension e
-- JOIN pg_namespace n ON n.oid = e.extnamespace
-- WHERE e.extname = 'pg_trgm';
