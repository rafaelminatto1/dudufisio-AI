-- Migration: Fix RLS Infinite Recursion on users table
-- Date: 2025-01-29
-- Issue: RLS policies were self-referencing causing infinite recursion
-- Solution: Use auth.jwt() claims to check roles without querying users table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;
-- Create helper function to get user role from JWT claims
-- This avoids querying the users table, preventing recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'patient'  -- default role
  );
$$;
-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() = 'admin';
$$;
-- Create helper function to check if user is therapist
CREATE OR REPLACE FUNCTION public.is_therapist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() IN ('therapist', 'admin');
$$;
-- Recreate RLS policies using helper functions (no recursion)

-- SELECT policy: Users can see their own data, admins can see all
CREATE POLICY "users_select_policy" ON users
FOR SELECT
USING (
  auth.uid() = id OR public.is_admin()
);
-- INSERT policy: Only admins can create users (or allow self-registration)
CREATE POLICY "users_insert_policy" ON users
FOR INSERT
WITH CHECK (
  public.is_admin() OR auth.uid() = id
);
-- UPDATE policy: Users can update their own data, admins can update all
CREATE POLICY "users_update_policy" ON users
FOR UPDATE
USING (
  auth.uid() = id OR public.is_admin()
)
WITH CHECK (
  auth.uid() = id OR public.is_admin()
);
-- DELETE policy: Only admins can delete users
CREATE POLICY "users_delete_policy" ON users
FOR DELETE
USING (
  public.is_admin()
);
-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_therapist() TO authenticated;
-- Add comment explaining the fix
COMMENT ON POLICY "users_select_policy" ON users IS
'Fixed: Uses auth.jwt() claims instead of querying users table to prevent infinite recursion';
COMMENT ON POLICY "users_insert_policy" ON users IS
'Fixed: Uses auth.jwt() claims instead of querying users table to prevent infinite recursion';
COMMENT ON POLICY "users_update_policy" ON users IS
'Fixed: Uses auth.jwt() claims instead of querying users table to prevent infinite recursion';
COMMENT ON POLICY "users_delete_policy" ON users IS
'Fixed: Uses auth.jwt() claims instead of querying users table to prevent infinite recursion';
