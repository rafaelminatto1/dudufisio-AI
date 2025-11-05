-- Migration: WhatsApp Messages Log
-- MoocaFisio - Log de todas mensagens WhatsApp enviadas
-- Data: 04/11/2025

-- Tabela para log de mensagens enviadas
CREATE TABLE IF NOT EXISTS public.whatsapp_messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'text', 'template', 'reminder', 'confirmation', etc.
  template_id TEXT,
  message_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  whatsapp_message_id TEXT, -- ID retornado pela Meta API
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_patient ON public.whatsapp_messages_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone ON public.whatsapp_messages_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON public.whatsapp_messages_log(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON public.whatsapp_messages_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_whatsapp_id ON public.whatsapp_messages_log(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.whatsapp_messages_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Staff can view all logs" ON public.whatsapp_messages_log;
CREATE POLICY "Staff can view all logs"
  ON public.whatsapp_messages_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );

DROP POLICY IF EXISTS "Staff can insert logs" ON public.whatsapp_messages_log;
CREATE POLICY "Staff can insert logs"
  ON public.whatsapp_messages_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );

DROP POLICY IF EXISTS "System can update logs" ON public.whatsapp_messages_log;
CREATE POLICY "System can update logs"
  ON public.whatsapp_messages_log
  FOR UPDATE
  USING (true);

-- Função para atualizar status de mensagem via webhook
CREATE OR REPLACE FUNCTION update_whatsapp_message_status(
  p_whatsapp_message_id TEXT,
  p_status TEXT,
  p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.whatsapp_messages_log
  SET
    status = p_status,
    delivered_at = CASE WHEN p_status = 'delivered' THEN p_timestamp ELSE delivered_at END,
    read_at = CASE WHEN p_status = 'read' THEN p_timestamp ELSE read_at END
  WHERE whatsapp_message_id = p_whatsapp_message_id;
END;
$$;

-- Comentários
COMMENT ON TABLE public.whatsapp_messages_log IS 'Log de todas mensagens WhatsApp enviadas via Meta Business API';
COMMENT ON COLUMN public.whatsapp_messages_log.patient_id IS 'Referência ao paciente (pode ser NULL para mensagens sem vínculo)';
COMMENT ON COLUMN public.whatsapp_messages_log.message_type IS 'Tipo de mensagem enviada';
COMMENT ON COLUMN public.whatsapp_messages_log.template_id IS 'ID do template se type = template';
COMMENT ON COLUMN public.whatsapp_messages_log.status IS 'Status da mensagem no WhatsApp';
COMMENT ON COLUMN public.whatsapp_messages_log.whatsapp_message_id IS 'ID retornado pela Meta API para rastreamento';

-- Verificar resultado
SELECT
  'Tabela whatsapp_messages_log criada com sucesso!' as status,
  COUNT(*) as total_logs
FROM public.whatsapp_messages_log;
