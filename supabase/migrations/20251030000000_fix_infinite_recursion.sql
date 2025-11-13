-- ============================================================================
-- FIX: Infinite Recursion in Users Table RLS Policies
-- Date: 2025-10-30
-- Issue: Policies on users table causing infinite recursion error
-- Solution: Use SECURITY DEFINER functions and simple policies without JOINs
-- ============================================================================

BEGIN;
-- ============================================================================
-- STEP 1: Drop all existing policies on users table
-- ============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;
-- ============================================================================
-- STEP 2: Create SECURITY DEFINER functions to check roles
-- These functions run with elevated privileges and don't cause recursion
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get role from users table using auth.uid()
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = auth.uid()
    LIMIT 1;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
-- Function to check if current user is therapist
CREATE OR REPLACE FUNCTION public.is_therapist()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_user_role() = 'therapist');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
-- Function to check if current user is staff (admin, manager, or therapist)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager', 'therapist'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
-- ============================================================================
-- STEP 3: Create simple, non-recursive policies
-- ============================================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "users_view_own"
ON public.users
FOR SELECT
USING (auth_id = auth.uid());
-- Policy 2: Users can update their own profile
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
USING (auth_id = auth.uid());
-- Policy 3: Staff can view all users
CREATE POLICY "staff_view_all"
ON public.users
FOR SELECT
USING (public.is_staff());
-- Policy 4: Admins can insert new users
CREATE POLICY "admins_insert_users"
ON public.users
FOR INSERT
WITH CHECK (public.is_admin());
-- Policy 5: Admins can update all users
CREATE POLICY "admins_update_users"
ON public.users
FOR UPDATE
USING (public.is_admin());
-- Policy 6: Admins can delete users
CREATE POLICY "admins_delete_users"
ON public.users
FOR DELETE
USING (public.is_admin());
-- ============================================================================
-- STEP 4: Grant execute permissions on functions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_therapist() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
-- ============================================================================
-- STEP 5: Add helpful comments
-- ============================================================================

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin or manager';
COMMENT ON FUNCTION public.is_therapist() IS 'Returns true if current user is therapist';
COMMENT ON FUNCTION public.is_staff() IS 'Returns true if current user is admin, manager, or therapist';
COMMENT ON POLICY "users_view_own" ON public.users IS 'Users can view their own profile';
COMMENT ON POLICY "users_update_own" ON public.users IS 'Users can update their own profile';
COMMENT ON POLICY "staff_view_all" ON public.users IS 'Staff members can view all users';
COMMENT ON POLICY "admins_insert_users" ON public.users IS 'Admins can create new users';
COMMENT ON POLICY "admins_update_users" ON public.users IS 'Admins can update any user';
COMMENT ON POLICY "admins_delete_users" ON public.users IS 'Admins can delete users';
COMMIT;
-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;
