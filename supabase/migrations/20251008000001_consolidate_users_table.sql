-- ============================================================================
-- MIGRAÇÃO: CONSOLIDAÇÃO DE TABELAS DE USUÁRIOS
-- Data: 2025-10-08
-- Descrição: Une users e user_profiles em uma estrutura consistente
-- ============================================================================

BEGIN;

-- 1. Criar tabela consolidada (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.unified_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'patient', 'educador_fisico', 'partner')),
  phone TEXT,
  avatar_url TEXT,
  
  -- Informações profissionais
  professional_registration TEXT, -- CREFITO, CRM, etc
  specialties TEXT[],
  
  -- Permissões e configurações
  permissions JSONB DEFAULT '[]'::jsonb,
  profile_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status e auditoria
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- 2. Índices otimizados
CREATE INDEX IF NOT EXISTS idx_unified_users_email ON unified_users(email);
CREATE INDEX IF NOT EXISTS idx_unified_users_role_active ON unified_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_unified_users_auth_id ON unified_users(auth_id);

-- 3. Migrar dados existentes de user_profiles
INSERT INTO unified_users (id, auth_id, email, full_name, role, phone, avatar_url, created_at)
SELECT 
  up.id,
  up.id, -- usar o mesmo ID como auth_id
  up.email,
  up.name,
  up.role,
  up.phone,
  up.avatar_url,
  COALESCE(up.created_at, NOW())
FROM user_profiles up
ON CONFLICT (email) DO NOTHING;

-- 4. RLS Policies
ALTER TABLE unified_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_profile" ON unified_users;
CREATE POLICY "users_view_own_profile" ON unified_users
  FOR SELECT USING (id = auth.uid() OR auth_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON unified_users;
CREATE POLICY "users_update_own_profile" ON unified_users
  FOR UPDATE USING (id = auth.uid() OR auth_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON unified_users;
CREATE POLICY "users_insert_own_profile" ON unified_users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- 5. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_unified_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS unified_users_updated_at ON unified_users;
CREATE TRIGGER unified_users_updated_at
  BEFORE UPDATE ON unified_users
  FOR EACH ROW EXECUTE FUNCTION update_unified_users_updated_at();

-- 6. Comentários da tabela
COMMENT ON TABLE unified_users IS 'Tabela consolidada de usuários do sistema, unindo users e user_profiles';
COMMENT ON COLUMN unified_users.auth_id IS 'Referência ao usuário do Supabase Auth';
COMMENT ON COLUMN unified_users.professional_registration IS 'Registro profissional (CREFITO, CRM, CREF, etc)';
COMMENT ON COLUMN unified_users.permissions IS 'Array JSON de permissões específicas do usuário';

COMMIT;
