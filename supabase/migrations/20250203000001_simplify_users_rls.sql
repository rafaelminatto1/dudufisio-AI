-- Simplify users RLS to prevent infinite recursion
-- Solution: Use auth.uid() directly without JOINs to users table

BEGIN;
-- Drop ALL policies on users table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
END $$;
-- Create ultra-simple policies that don't cause recursion

-- 1. Allow users to view their own row ONLY
CREATE POLICY "users_own_data"
ON users
FOR SELECT
USING (id = auth.uid());
-- 2. Allow users to update their own row ONLY
CREATE POLICY "users_own_update"
ON users
FOR UPDATE
USING (id = auth.uid());
-- 3. Allow users to insert their own row (for registration)
CREATE POLICY "users_own_insert"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());
-- Note: We removed cross-table policies to avoid recursion
-- Therapists/admins viewing other users will be handled via service_role in edge functions

COMMIT;
