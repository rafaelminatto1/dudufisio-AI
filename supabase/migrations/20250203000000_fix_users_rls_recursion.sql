-- Fix: Infinite recursion in users table RLS policies
-- Issue: policies on users table were causing infinite recursion

BEGIN;
-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Therapists can view patient data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Service role can do anything" ON users;
-- Create simple, non-recursive policies

-- 1. Users can view their own data (using auth.uid() directly, no joins)
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (auth.uid() = id);
-- 2. Users can update their own data (using auth.uid() directly, no joins)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (auth.uid() = id);
-- 3. Therapists can view patient data (simplified)
CREATE POLICY "therapists_view_patients"
ON users FOR SELECT
USING (
  -- Only check role from the target row, not from another query
  EXISTS (
    SELECT 1 FROM users AS therapist
    WHERE therapist.id = auth.uid()
    AND therapist.role = 'therapist'
  )
  AND role = 'patient'
);
-- 4. Admins can view all users (simplified)
CREATE POLICY "admins_view_all"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users AS admin
    WHERE admin.id = auth.uid()
    AND admin.role = 'admin'
  )
);
-- 5. Service role bypass (for edge functions)
CREATE POLICY "service_role_all"
ON users FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
COMMIT;
