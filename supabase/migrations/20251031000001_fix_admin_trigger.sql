-- =====================================================
-- MIGRATION: Fix Admin User Trigger
-- Description: Remove problematic trigger and create admin user manually
-- Created: 2025-10-31
-- =====================================================

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS auto_setup_admin_user ON public.users;
DROP FUNCTION IF EXISTS setup_admin_user();

-- Temporarily disable triggers to avoid recursion
SET session_replication_role = replica;

-- Create or update admin user in public.users
INSERT INTO public.users (
  auth_id,
  email,
  full_name,
  role,
  status,
  is_active,
  email_verified,
  email_verified_at,
  permissions,
  created_at,
  updated_at
)
SELECT
  '780c3d8c-8914-4563-bea3-2025c4b45f9d'::uuid,
  'rafael.minatto@yahoo.com.br',
  'Rafael Minatto',
  'admin'::user_role,
  'active'::user_status,
  TRUE,
  TRUE,
  NOW(),
  '["*"]'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'rafael.minatto@yahoo.com.br'
)
ON CONFLICT (email) DO UPDATE
SET
  auth_id = '780c3d8c-8914-4563-bea3-2025c4b45f9d'::uuid,
  role = 'admin'::user_role,
  status = 'active'::user_status,
  is_active = TRUE,
  email_verified = TRUE,
  email_verified_at = NOW(),
  full_name = 'Rafael Minatto',
  permissions = '["*"]'::jsonb,
  updated_at = NOW();

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE public.users IS 'Admin user rafael.minatto@yahoo.com.br created successfully';

