-- =====================================================
-- MIGRATION: Update Rafael to Admin
-- Description: Ensure rafael.minatto@yahoo.com.br has full admin privileges
-- Created: 2025-10-31 12:10
-- =====================================================

-- Update existing user to admin if exists
UPDATE public.users
SET
  role = 'admin',
  status = 'active',
  is_active = TRUE,
  email_verified = TRUE,
  email_verified_at = COALESCE(email_verified_at, NOW()),
  full_name = COALESCE(full_name, 'Rafael Minatto'),
  permissions = '["*"]'::jsonb,
  updated_at = NOW()
WHERE email = 'rafael.minatto@yahoo.com.br';
-- If user doesn't exist in public.users but exists in auth.users, create it
INSERT INTO public.users (
  auth_id,
  email,
  full_name,
  email_verified,
  email_verified_at,
  role,
  status,
  is_active,
  permissions
)
SELECT
  au.id,
  au.email,
  'Rafael Minatto',
  TRUE,
  NOW(),
  'admin',
  'active',
  TRUE,
  '["*"]'::jsonb
FROM auth.users au
WHERE au.email = 'rafael.minatto@yahoo.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.auth_id = au.id
  )
ON CONFLICT (auth_id) DO UPDATE
SET
  role = 'admin',
  status = 'active',
  is_active = TRUE,
  email_verified = TRUE,
  email_verified_at = NOW(),
  full_name = 'Rafael Minatto',
  permissions = '["*"]'::jsonb,
  updated_at = NOW();
-- Verify the update
DO $$
DECLARE
  admin_user RECORD;
BEGIN
  SELECT u.id, u.email, u.role, u.permissions
  INTO admin_user
  FROM public.users u
  WHERE u.email = 'rafael.minatto@yahoo.com.br';
  
  IF FOUND THEN
    RAISE NOTICE 'Admin user updated successfully:';
    RAISE NOTICE '  Email: %', admin_user.email;
    RAISE NOTICE '  Role: %', admin_user.role;
    RAISE NOTICE '  Permissions: %', admin_user.permissions;
  ELSE
    RAISE WARNING 'User not found in public.users';
  END IF;
END $$;
-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE public.users IS 'Users table - rafael.minatto@yahoo.com.br configured as admin with full privileges';
