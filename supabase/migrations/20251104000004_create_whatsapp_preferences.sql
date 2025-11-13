-- Migration: WhatsApp Preferences
-- MoocaFisio - Gerenciamento de opt-in/opt-out para WhatsApp
-- Data: 04/11/2025

-- Tabela para gerenciar preferências de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  opted_in BOOLEAN DEFAULT true NOT NULL,
  opted_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  opt_out_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Garantir um registro por paciente
  UNIQUE(patient_id),
  -- Garantir um registro por número
  UNIQUE(phone_number)
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_prefs_patient ON public.whatsapp_preferences(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_prefs_phone ON public.whatsapp_preferences(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_prefs_opted_in ON public.whatsapp_preferences(opted_in) WHERE opted_in = true;
-- Habilitar RLS
ALTER TABLE public.whatsapp_preferences ENABLE ROW LEVEL SECURITY;
-- Políticas RLS
DROP POLICY IF EXISTS "Staff can view all preferences" ON public.whatsapp_preferences;
CREATE POLICY "Staff can view all preferences"
  ON public.whatsapp_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );
DROP POLICY IF EXISTS "Staff can insert preferences" ON public.whatsapp_preferences;
CREATE POLICY "Staff can insert preferences"
  ON public.whatsapp_preferences
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );
DROP POLICY IF EXISTS "Staff can update preferences" ON public.whatsapp_preferences;
CREATE POLICY "Staff can update preferences"
  ON public.whatsapp_preferences
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'therapist')
    )
  );
-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_prefs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS whatsapp_prefs_updated_at ON public.whatsapp_preferences;
CREATE TRIGGER whatsapp_prefs_updated_at
  BEFORE UPDATE ON public.whatsapp_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_prefs_updated_at();
-- Comentários
COMMENT ON TABLE public.whatsapp_preferences IS 'Preferências de opt-in/opt-out para WhatsApp Business';
COMMENT ON COLUMN public.whatsapp_preferences.patient_id IS 'Referência ao paciente';
COMMENT ON COLUMN public.whatsapp_preferences.phone_number IS 'Número de telefone normalizado';
COMMENT ON COLUMN public.whatsapp_preferences.opted_in IS 'Se o paciente quer receber mensagens no WhatsApp';
COMMENT ON COLUMN public.whatsapp_preferences.opt_out_reason IS 'Motivo do opt-out (se fornecido)';
-- Verificar resultado
SELECT
  'Tabela whatsapp_preferences criada com sucesso!' as status,
  COUNT(*) as total_preferences
FROM public.whatsapp_preferences;
