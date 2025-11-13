-- =====================================================
-- MIGRATION: 001 - Auth Setup and Enhanced Users Table
-- Description: Setup authentication system with roles and permissions
-- Created: 2025-01-17
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- =====================================================
-- 1. ENUMS
-- =====================================================

-- User roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'manager',
    'therapist',
    'receptionist',
    'patient',
    'partner'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
-- User status enum
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
-- =====================================================
-- 2. USERS TABLE (Enhanced)
-- =====================================================

-- Drop existing users table if exists (backup first in production!)
DROP TABLE IF EXISTS users CASCADE;
-- Create enhanced users table
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication (linked to Supabase Auth)
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,

  -- Profile Information
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Role and Status
  role user_role DEFAULT 'patient',
  status user_status DEFAULT 'pending_verification',
  is_active BOOLEAN DEFAULT TRUE,

  -- Permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Settings (JSONB for flexibility)
  profile_settings JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "push": true,
    "whatsapp": false
  }'::jsonb,

  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Session Management
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  last_ip_address INET,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Soft Delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);
-- =====================================================
-- 3. INDEXES for Performance
-- =====================================================

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login_at);
-- GIN index for JSONB fields
CREATE INDEX idx_users_permissions ON users USING GIN(permissions);
CREATE INDEX idx_users_profile_settings ON users USING GIN(profile_settings);
-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = auth_id);
-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);
-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
    )
  );
-- Policy: Admins can manage all users
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
    )
  );
-- Policy: Therapists can view their patients
CREATE POLICY "Therapists can view patients"
  ON users
  FOR SELECT
  USING (
    role = 'patient'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('therapist', 'manager', 'admin')
      AND is_active = TRUE
    )
  );
-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Function: Create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name, email_verified, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function: Update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    last_login_at = NOW(),
    last_activity_at = NOW(),
    failed_login_attempts = 0
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function: Soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    is_active = FALSE,
    status = 'inactive'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function: Check user permissions
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT permissions INTO user_permissions
  FROM users
  WHERE id = user_id AND is_active = TRUE;

  RETURN user_permissions ? permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on user changes
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Trigger: Create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- Trigger: Update last login on successful auth
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();
-- =====================================================
-- 7. SEED DEFAULT ADMIN USER
-- =====================================================

-- Note: This will be created via application signup
-- with the first user having admin role assigned manually

-- =====================================================
-- 8. GRANTS
-- =====================================================

-- Grant usage on custom types
GRANT USAGE ON TYPE user_role TO authenticated;
GRANT USAGE ON TYPE user_status TO authenticated;
-- Grant access to functions
GRANT EXECUTE ON FUNCTION soft_delete_user TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission TO authenticated;
-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- Add comment to migration
COMMENT ON TABLE users IS 'Enhanced users table with authentication, roles, permissions, and security features';
