-- =====================================================
-- MIGRATION: 001 - Fix Patients RLS for Development
-- Description: Allow patient creation without authentication for development
-- Created: 2025-01-21
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Therapists can view assigned patients" ON patients;
DROP POLICY IF EXISTS "Staff can manage patients" ON patients;

-- Create new policies that allow operations for development
CREATE POLICY "Allow all operations on patients for development"
  ON patients FOR ALL
  USING (true)
  WITH CHECK (true);

-- Also fix therapists table if needed
DROP POLICY IF EXISTS "Therapists can view own data" ON therapists;
DROP POLICY IF EXISTS "Staff can manage therapists" ON therapists;

CREATE POLICY "Allow all operations on therapists for development"
  ON therapists FOR ALL
  USING (true)
  WITH CHECK (true);
