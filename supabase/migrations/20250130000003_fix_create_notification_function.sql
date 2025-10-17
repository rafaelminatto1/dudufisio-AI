-- =====================================================
-- Fix create_notification function
-- Ajusta para usar notification_type ao invés de type
-- =====================================================

-- Recriar função com coluna correta
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  p_channels TEXT[] DEFAULT ARRAY['in_app']
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_user_prefs JSONB;
BEGIN
  -- Buscar preferências do usuário
  SELECT notification_preferences INTO v_user_prefs
  FROM users WHERE id = p_user_id;

  -- Verificar se usuário permite este tipo de notificação
  IF v_user_prefs IS NOT NULL AND v_user_prefs ? p_type AND (v_user_prefs ->> p_type)::boolean = false THEN
    RETURN NULL; -- Usuário não quer receber
  END IF;

  -- Inserir notificação (usando notification_type se a coluna type não existir)
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data,
    scheduled_for,
    sent_via,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    COALESCE(p_data, '{}'::jsonb),
    COALESCE(p_scheduled_for, NOW()),
    COALESCE(p_channels, ARRAY['in_app']),
    NOW()
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION create_notification IS 'Cria notificação respeitando preferências do usuário';
