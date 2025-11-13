-- Migration: Create notification_schedules table
-- Description: Tabela para agendar lembretes automáticos de consultas
-- Date: 2025-11-05

-- Create notification_schedules table
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('reminder_24h', 'reminder_2h', 'confirmation', 'cancellation', 'update')),
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_schedules_appointment_id
  ON public.notification_schedules(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_id
  ON public.notification_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_scheduled_for
  ON public.notification_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_sent
  ON public.notification_schedules(sent);
-- Index composto para buscar lembretes pendentes
CREATE INDEX IF NOT EXISTS idx_notification_schedules_pending
  ON public.notification_schedules(sent, scheduled_for)
  WHERE sent = false;
-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_notification_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER notification_schedules_updated_at
  BEFORE UPDATE ON public.notification_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notification_schedules_updated_at();
-- Enable Row Level Security
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;
-- RLS Policies

-- Users can view their own notification schedules
CREATE POLICY "Users can view their own notification schedules"
  ON public.notification_schedules
  FOR SELECT
  USING (auth.uid() = user_id);
-- System/Service role can manage all notification schedules
CREATE POLICY "Service role can manage all notification schedules"
  ON public.notification_schedules
  FOR ALL
  USING (auth.role() = 'service_role');
-- Authenticated users with proper permissions can insert schedules
DROP POLICY IF EXISTS "Authenticated users can create notification schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Users can update their own notification schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Users can delete their own notification schedules" ON public.notification_schedules;

DO $policies$
DECLARE
  has_user_roles boolean := to_regclass('public.user_roles') IS NOT NULL;
BEGIN
  IF has_user_roles THEN
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create notification schedules"
      ON public.notification_schedules
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND (
          auth.uid() = user_id
          OR EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'terapeuta')
          )
        )
      );
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can update their own notification schedules"
      ON public.notification_schedules
      FOR UPDATE
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'terapeuta')
        )
      );
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can delete their own notification schedules"
      ON public.notification_schedules
      FOR DELETE
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'terapeuta')
        )
      );
    $policy$;
  ELSE
    EXECUTE $policy$
      CREATE POLICY "Authenticated users can create notification schedules"
      ON public.notification_schedules
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND auth.uid() = user_id
      );
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can update their own notification schedules"
      ON public.notification_schedules
      FOR UPDATE
      USING (auth.uid() = user_id);
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "Users can delete their own notification schedules"
      ON public.notification_schedules
      FOR DELETE
      USING (auth.uid() = user_id);
    $policy$;
  END IF;
END
$policies$;
-- Add comments for documentation
COMMENT ON TABLE public.notification_schedules IS 'Agendamento de lembretes automáticos de consultas (24h e 2h antes)';
COMMENT ON COLUMN public.notification_schedules.appointment_id IS 'ID do agendamento relacionado';
COMMENT ON COLUMN public.notification_schedules.user_id IS 'ID do usuário que receberá a notificação';
COMMENT ON COLUMN public.notification_schedules.scheduled_for IS 'Data e hora para enviar a notificação';
COMMENT ON COLUMN public.notification_schedules.notification_type IS 'Tipo de notificação: reminder_24h, reminder_2h, confirmation, cancellation, update';
COMMENT ON COLUMN public.notification_schedules.sent IS 'Indica se a notificação já foi enviada';
COMMENT ON COLUMN public.notification_schedules.sent_at IS 'Data e hora em que a notificação foi enviada';
COMMENT ON COLUMN public.notification_schedules.metadata IS 'Dados adicionais da notificação (JSON)';
