-- Migration: Create notifications table
-- Description: Tabela central para armazenar todas as notificações enviadas aos usuários
-- Date: 2025-11-05

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'appointment_confirmation',
    'appointment_reminder_24h',
    'appointment_reminder_2h',
    'appointment_cancellation',
    'appointment_update',
    'payment_due',
    'payment_received',
    'evolution_added',
    'message_received',
    'system',
    'other'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  sent_via TEXT[] DEFAULT '{}',
  action_url TEXT,
  action_label TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
  ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);

-- Index composto para buscar não lidas por usuário (query mais comum)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, read, created_at DESC)
  WHERE read = false;

-- Index para limpar notificações expiradas
CREATE INDEX IF NOT EXISTS idx_notifications_expired
  ON public.notifications(expires_at)
  WHERE expires_at IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notifications_updated_at();

-- Function to auto-mark as read when read_at is set
CREATE OR REPLACE FUNCTION public.handle_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    NEW.read = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_auto_read ON public.notifications;
CREATE TRIGGER notification_auto_read
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notification_read();

-- Function to clean up expired notifications (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Admins and therapists can create notifications
DROP POLICY IF EXISTS "Admins and therapists can create notifications" ON public.notifications;

DO $policies$
DECLARE
  has_user_roles boolean := to_regclass('public.user_roles') IS NOT NULL;
BEGIN
  IF has_user_roles THEN
    EXECUTE $policy$
      CREATE POLICY "Admins and therapists can create notifications"
      ON public.notifications
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'terapeuta')
        )
      );
    $policy$;
  ELSE
    EXECUTE $policy$
      CREATE POLICY "Admins and therapists can create notifications"
      ON public.notifications
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = user_id
      );
    $policy$;
  END IF;
END
$policies$;

-- Create view for notification statistics per user
DROP VIEW IF EXISTS public.notification_stats;

CREATE OR REPLACE VIEW public.notification_stats AS
SELECT
  user_id,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count,
  COUNT(CASE WHEN read = true THEN 1 END) as read_count,
  COUNT(CASE WHEN type = 'appointment_reminder_24h' THEN 1 END) as reminder_24h_count,
  COUNT(CASE WHEN type = 'appointment_reminder_2h' THEN 1 END) as reminder_2h_count,
  COUNT(CASE WHEN type IN ('system', 'other') THEN 1 END) as urgent_count,
  MAX(created_at) as last_notification_at
FROM public.notifications
GROUP BY user_id;

-- Grant access to view
GRANT SELECT ON public.notification_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.notifications IS 'Tabela central de notificações - armazena todas as notificações enviadas aos usuários';
COMMENT ON COLUMN public.notifications.user_id IS 'ID do usuário que recebe a notificação';
COMMENT ON COLUMN public.notifications.title IS 'Título da notificação';
COMMENT ON COLUMN public.notifications.message IS 'Corpo/mensagem da notificação';
COMMENT ON COLUMN public.notifications.type IS 'Tipo da notificação para categorização';
COMMENT ON COLUMN public.notifications.action_url IS 'URL para navegar ao clicar na notificação';
COMMENT ON COLUMN public.notifications.action_label IS 'Texto do botão de ação';
COMMENT ON COLUMN public.notifications.data IS 'Dados adicionais da notificação (JSON)';
COMMENT ON COLUMN public.notifications.read IS 'Indica se a notificação foi lida';
COMMENT ON COLUMN public.notifications.read_at IS 'Data/hora em que foi lida';
COMMENT ON COLUMN public.notifications.sent_via IS 'Canais pelos quais a notificação foi enviada (push, email, whatsapp)';
COMMENT ON COLUMN public.notifications.expires_at IS 'Data/hora de expiração (para limpeza automática)';
