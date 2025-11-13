-- =====================================================
-- CLEANUP: Drop duplicate functions before applying migrations
-- =====================================================

-- Drop all versions of create_notification function
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, JSONB, TIMESTAMPTZ, TEXT[]);
DROP FUNCTION IF EXISTS create_notification CASCADE;
-- Now the correct version will be created by subsequent migrations;
