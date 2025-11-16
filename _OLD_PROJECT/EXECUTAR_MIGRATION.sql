-- ============================================================================
-- MIGRATION: Push Notification Tokens
-- EXECUTE ESTE SQL NO SUPABASE DASHBOARD
-- Link: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql/new
-- ============================================================================

-- Criar tabela de tokens
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop')),
  browser TEXT,
  os TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id 
  ON public.push_notification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_push_tokens_enabled 
  ON public.push_notification_tokens(enabled) 
  WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_push_tokens_token 
  ON public.push_notification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_enabled 
  ON public.push_notification_tokens(user_id, enabled);

-- RLS
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens"
  ON public.push_notification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.push_notification_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.push_notification_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON public.push_notification_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- Função de limpeza
CREATE OR REPLACE FUNCTION clean_old_push_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.push_notification_tokens
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    OR (last_used_at IS NULL AND created_at < NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.push_notification_tokens IS 'Armazena tokens FCM para push notifications';
COMMENT ON COLUMN public.push_notification_tokens.token IS 'Token FCM único do dispositivo';
COMMENT ON COLUMN public.push_notification_tokens.enabled IS 'Se o usuário quer receber notificações';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Se tudo correu bem, você deve ver: "Success. No rows returned"

