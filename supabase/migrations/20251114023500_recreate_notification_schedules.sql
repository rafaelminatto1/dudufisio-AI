-- Migration: Recreate notification_schedules table (fallback v2)
-- Date: 2025-11-14

CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('reminder_24h', 'reminder_2h', 'confirmation', 'cancellation', 'update')
  ),
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_schedules_appointment_id
  ON public.notification_schedules(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_id
  ON public.notification_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_scheduled_for
  ON public.notification_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_sent
  ON public.notification_schedules(sent);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_pending
  ON public.notification_schedules(sent, scheduled_for)
  WHERE sent = false;

CREATE OR REPLACE FUNCTION public.handle_notification_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_schedules_updated_at ON public.notification_schedules;
CREATE TRIGGER notification_schedules_updated_at
  BEFORE UPDATE ON public.notification_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notification_schedules_updated_at();

ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification schedules" ON public.notification_schedules;
CREATE POLICY "Users can view their own notification schedules"
  ON public.notification_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all notification schedules" ON public.notification_schedules;
CREATE POLICY "Service role can manage all notification schedules"
  ON public.notification_schedules
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated users can create notification schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Users can update their own notification schedules" ON public.notification_schedules;
DROP POLICY IF EXISTS "Users can delete their own notification schedules" ON public.notification_schedules;

CREATE POLICY "Authenticated users can create notification schedules"
  ON public.notification_schedules
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own notification schedules"
  ON public.notification_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification schedules"
  ON public.notification_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.notification_schedules IS
  'Agendamento de lembretes automáticos de consultas (24h e 2h antes, etc.)';

