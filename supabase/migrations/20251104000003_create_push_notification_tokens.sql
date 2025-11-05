-- Migration: Push Notification Tokens Table
-- MoocaFisio - Sistema de Notificações Push
-- Data: 2025-11-04
-- Descrição: Cria tabela para armazenar tokens FCM dos dispositivos dos usuários

-- ============================================================================
-- Criar tabela de tokens
-- ============================================================================

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

-- ============================================================================
-- Indexes para performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id 
  ON public.push_notification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_push_tokens_enabled 
  ON public.push_notification_tokens(enabled) 
  WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_push_tokens_token 
  ON public.push_notification_tokens(token);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_enabled 
  ON public.push_notification_tokens(user_id, enabled);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem visualizar seus próprios tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can view their own tokens"
  ON public.push_notification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios tokens
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can insert their own tokens"
  ON public.push_notification_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios tokens
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can update their own tokens"
  ON public.push_notification_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios tokens
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can delete their own tokens"
  ON public.push_notification_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger para atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS push_tokens_updated_at ON public.push_notification_tokens;
CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- ============================================================================
-- Função para limpar tokens antigos (opcional - manutenção)
-- ============================================================================

CREATE OR REPLACE FUNCTION clean_old_push_tokens()
RETURNS void AS $$
BEGIN
  -- Remove tokens que não foram usados nos últimos 90 dias
  DELETE FROM public.push_notification_tokens
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    OR (last_used_at IS NULL AND created_at < NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments para documentação
-- ============================================================================

COMMENT ON TABLE public.push_notification_tokens IS 
  'Armazena tokens FCM (Firebase Cloud Messaging) para push notifications dos usuários';

COMMENT ON COLUMN public.push_notification_tokens.user_id IS 
  'Referência ao usuário no auth.users';

COMMENT ON COLUMN public.push_notification_tokens.token IS 
  'Token FCM único do dispositivo';

COMMENT ON COLUMN public.push_notification_tokens.device_type IS 
  'Tipo do dispositivo: mobile ou desktop';

COMMENT ON COLUMN public.push_notification_tokens.browser IS 
  'Navegador do usuário (Chrome, Firefox, Safari, etc.)';

COMMENT ON COLUMN public.push_notification_tokens.os IS 
  'Sistema operacional do dispositivo';

COMMENT ON COLUMN public.push_notification_tokens.enabled IS 
  'Indica se o usuário quer receber notificações neste dispositivo';

COMMENT ON COLUMN public.push_notification_tokens.last_used_at IS 
  'Última vez que este token foi usado para enviar uma notificação';

COMMENT ON FUNCTION clean_old_push_tokens() IS 
  'Remove tokens que não foram usados nos últimos 90 dias (executar via cron job)';

-- ============================================================================
-- Fim da migration
-- ============================================================================

