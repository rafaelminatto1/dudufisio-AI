-- Migration: Adicionar confirmações WhatsApp e log detalhado
-- Data: 13/11/2025

-- 1) Novos campos na tabela de consultas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'confirmed'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN confirmed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN confirmed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'whatsapp_conversation_id'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN whatsapp_conversation_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'reminder_sent_7d'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN reminder_sent_7d timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'appointments'
        AND column_name = 'reminder_sent_24h'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN reminder_sent_24h timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'appointments'
        AND column_name = 'reminder_sent_2h'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN reminder_sent_2h timestamptz;
  END IF;
END $$;
-- Índices auxiliares para consultas por confirmação e lembretes
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed
  ON public.appointments (confirmed);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_at
  ON public.appointments (confirmed_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_7d
  ON public.appointments (reminder_sent_7d);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h
  ON public.appointments (reminder_sent_24h);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h
  ON public.appointments (reminder_sent_2h);
-- 2) Tabela de log detalhado de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics (id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments (id) ON DELETE SET NULL,
  patient_id uuid REFERENCES public.patients (id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  message_category text NOT NULL CHECK (
    message_category IN ('reminder', 'confirmation', 'cancellation', 'reschedule', 'follow_up', 'generic')
  ),
  message_template text,
  message_preview text,
  message_body text NOT NULL,
  whatsapp_message_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'acknowledged')
  ),
  sent_at timestamptz DEFAULT NOW(),
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_clinic
  ON public.whatsapp_messages (clinic_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_patient
  ON public.whatsapp_messages (patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_appointment
  ON public.whatsapp_messages (appointment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status
  ON public.whatsapp_messages (status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at
  ON public.whatsapp_messages (created_at DESC);
-- 3) RLS e políticas básicas
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatsapp_messages'
      AND policyname = 'Staff can read whatsapp messages'
  ) THEN
    DROP POLICY "Staff can read whatsapp messages" ON public.whatsapp_messages;
  END IF;
END $$;
CREATE POLICY "Staff can read whatsapp messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist', 'staff')
    )
  );
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatsapp_messages'
      AND policyname = 'System can insert whatsapp messages'
  ) THEN
    DROP POLICY "System can insert whatsapp messages" ON public.whatsapp_messages;
  END IF;
END $$;
CREATE POLICY "System can insert whatsapp messages"
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (true);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'whatsapp_messages'
      AND policyname = 'System can update whatsapp messages'
  ) THEN
    DROP POLICY "System can update whatsapp messages" ON public.whatsapp_messages;
  END IF;
END $$;
CREATE POLICY "System can update whatsapp messages"
  ON public.whatsapp_messages
  FOR UPDATE
  USING (true);
COMMENT ON TABLE public.whatsapp_messages IS 'Log estruturado de mensagens WhatsApp para confirmações automáticas de consultas';
COMMENT ON COLUMN public.whatsapp_messages.message_category IS 'Categoria da mensagem (reminder, confirmation, cancellation, etc)';
COMMENT ON COLUMN public.whatsapp_messages.message_template IS 'Identificador de template ou prompt utilizado';
COMMENT ON COLUMN public.whatsapp_messages.message_preview IS 'Resumo curto exibido em dashboards';
COMMENT ON COLUMN public.whatsapp_messages.message_body IS 'Conteúdo completo enviado/recebido';
COMMENT ON COLUMN public.whatsapp_messages.metadata IS 'Metadados adicionais (IDs de envio, payloads, etc)';
-- 4) Função utilitária para atualizar status via webhook
CREATE OR REPLACE FUNCTION public.update_whatsapp_message_status(
  p_whatsapp_message_id text,
  p_status text,
  p_timestamp timestamptz DEFAULT NOW()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.whatsapp_messages
  SET
    status = p_status,
    delivered_at = CASE WHEN p_status = 'delivered' THEN COALESCE(p_timestamp, delivered_at) ELSE delivered_at END,
    read_at = CASE WHEN p_status = 'read' THEN COALESCE(p_timestamp, read_at) ELSE read_at END
  WHERE whatsapp_message_id = p_whatsapp_message_id;
END;
$$;
