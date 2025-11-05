-- Migration: Create notifications table
-- Description: Tabela central para armazenar todas as notificações enviadas aos usuários
-- Date: 2025-11-05

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
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
  icon TEXT DEFAULT '/logo.png',
  url TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_via TEXT[] DEFAULT ARRAY['push'], -- ['push', 'email', 'whatsapp']
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
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
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users with proper permissions can insert notifications
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

-- Create view for notification statistics per user
CREATE OR REPLACE VIEW public.notification_stats AS
SELECT
  user_id,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count,
  COUNT(CASE WHEN read = true THEN 1 END) as read_count,
  COUNT(CASE WHEN type = 'appointment_reminder_24h' THEN 1 END) as reminder_24h_count,
  COUNT(CASE WHEN type = 'appointment_reminder_2h' THEN 1 END) as reminder_2h_count,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_count,
  MAX(created_at) as last_notification_at
FROM public.notifications
GROUP BY user_id;

-- Grant access to view
GRANT SELECT ON public.notification_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.notifications IS 'Tabela central de notificações - armazena todas as notificações enviadas aos usuários';
COMMENT ON COLUMN public.notifications.user_id IS 'ID do usuário que recebe a notificação';
COMMENT ON COLUMN public.notifications.title IS 'Título da notificação';
COMMENT ON COLUMN public.notifications.body IS 'Corpo/mensagem da notificação';
COMMENT ON COLUMN public.notifications.type IS 'Tipo da notificação para categorização';
COMMENT ON COLUMN public.notifications.icon IS 'URL do ícone da notificação';
COMMENT ON COLUMN public.notifications.url IS 'URL para navegar ao clicar na notificação';
COMMENT ON COLUMN public.notifications.data IS 'Dados adicionais da notificação (JSON)';
COMMENT ON COLUMN public.notifications.read IS 'Indica se a notificação foi lida';
COMMENT ON COLUMN public.notifications.read_at IS 'Data/hora em que foi lida';
COMMENT ON COLUMN public.notifications.sent_via IS 'Canais pelos quais a notificação foi enviada (push, email, whatsapp)';
COMMENT ON COLUMN public.notifications.priority IS 'Prioridade da notificação (low, normal, high, urgent)';
COMMENT ON COLUMN public.notifications.expires_at IS 'Data/hora de expiração (para limpeza automática)';

-- Insert initial test notification for admin (optional)
-- Uncomment to create a test notification
/*
INSERT INTO public.notifications (user_id, title, body, type, url, priority)
SELECT
  id,
  '🎉 Bem-vindo ao Centro de Notificações!',
  'Agora você receberá lembretes de consultas, atualizações e muito mais.',
  'system',
  '/notifications',
  'normal'
FROM auth.users
WHERE email = 'admin@dudufisio.com'
LIMIT 1;
*/
