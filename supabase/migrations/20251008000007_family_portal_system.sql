-- =====================================================
-- MIGRATION: Family Portal System
-- Data: 2025-10-08
-- Descrição: Tabelas para Portal da Família
-- =====================================================

-- Tabela de membros da família
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT NOT NULL CHECK (relationship IN ('spouse', 'parent', 'child', 'sibling', 'caregiver', 'other')),
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  emergency_contact BOOLEAN NOT NULL DEFAULT false,
  can_schedule BOOLEAN NOT NULL DEFAULT false,
  can_view_medical BOOLEAN NOT NULL DEFAULT false,
  can_receive_updates BOOLEAN NOT NULL DEFAULT true,
  can_message_therapist BOOLEAN NOT NULL DEFAULT false,
  can_view_exercises BOOLEAN NOT NULL DEFAULT false,
  can_view_billing BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_access TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_members_patient ON family_members(patient_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_active ON family_members(is_active);

-- Tabela de log de acessos (LGPD)
CREATE TABLE IF NOT EXISTS family_portal_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_accessed TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_portal_access_member ON family_portal_access_log(family_member_id);
CREATE INDEX idx_family_portal_access_date ON family_portal_access_log(accessed_at DESC);

-- RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_portal_access_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE family_members IS 'Membros da família com acesso ao portal do paciente';
COMMENT ON TABLE family_portal_access_log IS 'Log de acessos ao portal da família (LGPD compliance)';

