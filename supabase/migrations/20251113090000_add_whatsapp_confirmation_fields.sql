-- Migration: Add WhatsApp confirmation fields
-- Data: 13/11/2025

-- 1) Ajustes na tabela de agendamentos (appointments)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_sent_7d TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_sent_24h TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_sent_2h TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_conversation_id TEXT;
ALTER TABLE public.appointments
  ALTER COLUMN confirmed SET DEFAULT FALSE;
ALTER TABLE public.appointments
  ALTER COLUMN confirmed SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed ON public.appointments (confirmed);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_at ON public.appointments (confirmed_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_7d ON public.appointments (reminder_sent_7d);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON public.appointments (reminder_sent_24h);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h ON public.appointments (reminder_sent_2h);
-- 2) Padronização do log de mensagens WhatsApp
DO $$
BEGIN
  IF to_regclass('public.whatsapp_messages') IS NULL THEN
    CREATE TABLE public.whatsapp_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
      patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
      clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
      direction TEXT CHECK (direction IN ('outbound', 'inbound')) NOT NULL,
      channel TEXT NOT NULL DEFAULT 'whatsapp',
      message_type TEXT NOT NULL,
      message TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::JSONB,
      status TEXT NOT NULL DEFAULT 'pending',
      message_id TEXT,
      sent_at TIMESTAMPTZ DEFAULT NOW(),
      delivered_at TIMESTAMPTZ,
      read_at TIMESTAMPTZ,
      replied_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  ELSE
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'message_body'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages RENAME COLUMN message_body TO message';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'message_category'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages RENAME COLUMN message_category TO message_type';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'metadata'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages RENAME COLUMN metadata TO payload';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'whatsapp_message_id'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages RENAME COLUMN whatsapp_message_id TO message_id';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'message_template'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages DROP COLUMN message_template';
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'whatsapp_messages' AND column_name = 'message_preview'
    ) THEN
      EXECUTE 'ALTER TABLE public.whatsapp_messages DROP COLUMN message_preview';
    END IF;
  END IF;
END $$;
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'whatsapp';
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT;
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS message_id TEXT;
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE public.whatsapp_messages SET channel = 'whatsapp' WHERE channel IS NULL;
UPDATE public.whatsapp_messages SET payload = '{}'::JSONB WHERE payload IS NULL;
UPDATE public.whatsapp_messages SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE public.whatsapp_messages SET message_type = 'info' WHERE message_type IS NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN channel SET DEFAULT 'whatsapp';
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN channel SET NOT NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN message SET NOT NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN message_type SET NOT NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE public.whatsapp_messages
  ALTER COLUMN sent_at SET DEFAULT NOW();
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'whatsapp_messages_status_check'
      AND conrelid = 'public.whatsapp_messages'::regclass
  ) THEN
    ALTER TABLE public.whatsapp_messages DROP CONSTRAINT whatsapp_messages_status_check;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'whatsapp_messages_message_category_check'
      AND conrelid = 'public.whatsapp_messages'::regclass
  ) THEN
    ALTER TABLE public.whatsapp_messages DROP CONSTRAINT whatsapp_messages_message_category_check;
  END IF;
END $$;
ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_message_type_check
  CHECK (message_type IN ('reminder', 'confirmation', 'cancellation', 'reschedule', 'info'));
ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_status_check
  CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'processed'));
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_patient ON public.whatsapp_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_appointment ON public.whatsapp_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON public.whatsapp_messages(message_id) WHERE message_id IS NOT NULL;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Staff can view whatsapp messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );
DROP POLICY IF EXISTS "Staff can insert whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Staff can insert whatsapp messages"
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );
DROP POLICY IF EXISTS "System can update whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "System can update whatsapp messages"
  ON public.whatsapp_messages
  FOR UPDATE
  USING (true);
COMMENT ON TABLE public.whatsapp_messages IS 'Log estruturado de mensagens trocadas via WhatsApp com pacientes';
COMMENT ON COLUMN public.whatsapp_messages.direction IS 'Sentido da mensagem (outbound = enviada, inbound = recebida)';
COMMENT ON COLUMN public.whatsapp_messages.channel IS 'Canal utilizado para o envio (ex.: whatsapp)';
COMMENT ON COLUMN public.whatsapp_messages.message_type IS 'Categoria da mensagem (lembrete, confirmação, cancelamento, reagendamento, informativa)';
COMMENT ON COLUMN public.whatsapp_messages.payload IS 'Conteúdo auxiliar (JSON) para rastrear contexto da mensagem';
COMMENT ON COLUMN public.whatsapp_messages.status IS 'Status operacional da mensagem junto à API do WhatsApp';
COMMENT ON COLUMN public.whatsapp_messages.message_id IS 'Identificador externo retornado pela API do WhatsApp';
