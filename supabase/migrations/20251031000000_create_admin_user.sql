-- =====================================================
-- MIGRATION: Prepare Admin User Role
-- Description: Setup admin role for user rafael.minatto@yahoo.com.br
-- Note: User must be created via Supabase Dashboard or API first
-- Created: 2025-10-31
-- =====================================================

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Create a function to update user role when the user is created
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches our admin user
  IF NEW.email = 'rafael.minatto@yahoo.com.br' THEN
    -- Update the user role to admin
    UPDATE public.users
    SET
      role = 'admin',
      status = 'active',
      is_active = TRUE,
      email_verified = TRUE,
      email_verified_at = NOW(),
      full_name = 'Rafael Minatto',
      permissions = '["*"]'::jsonb
    WHERE auth_id = NEW.auth_id OR email = NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger to automatically promote to admin on first login
CREATE OR REPLACE TRIGGER auto_setup_admin_user
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION setup_admin_user();
-- If user already exists in public.users, update immediately
UPDATE public.users
SET
  role = 'admin',
  status = 'active',
  is_active = TRUE,
  email_verified = TRUE,
  email_verified_at = NOW(),
  full_name = 'Rafael Minatto',
  permissions = '["*"]'::jsonb
WHERE email = 'rafael.minatto@yahoo.com.br';
-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON FUNCTION setup_admin_user() IS 'Automatically setup admin role for rafael.minatto@yahoo.com.br';
