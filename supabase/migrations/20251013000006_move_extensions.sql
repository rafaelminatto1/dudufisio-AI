-- Migration: Move Extensions to Proper Schema
-- Description: Move pg_trgm extension from public to extensions schema for security
-- Date: 2025-10-13

-- ====================================
-- Create extensions schema if not exists
-- ====================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- ====================================
-- Move pg_trgm extension
-- ====================================
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- ====================================
-- Grant usage on extensions schema
-- ====================================
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- ====================================
-- Update search_path for database
-- ====================================
-- Note: This is already configured in supabase/config.toml
-- extra_search_path = ["public", "extensions"]

-- ====================================
-- Comments for audit trail
-- ====================================
COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions - Moved pg_trgm on 2025-10-13';


