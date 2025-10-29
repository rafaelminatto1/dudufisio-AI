-- ============================================================================
-- MIGRATION: Adicionar 'educator' ao enum user_role
-- ============================================================================

-- Adicionar 'educator' ao enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'educator';

-- Comentário atualizado
COMMENT ON TYPE user_role IS 'Roles: admin, manager, therapist, receptionist, patient, partner, educator';

