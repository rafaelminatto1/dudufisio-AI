-- Migration: WhatsApp Interactions Table
-- Armazena interações via WhatsApp para auditoria

CREATE TABLE IF NOT EXISTS public.whatsapp_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  -- Interação
  message_type TEXT NOT NULL CHECK (message_type IN ('reminder', 'confirmation', 'cancellation', 'birthday', 'campaign', 'other')),
  message TEXT NOT NULL,
  response TEXT,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  
  -- Metadados
  phone_number TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('twilio', 'whatsapp_business')),
  message_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_patient_id ON public.whatsapp_interactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_appointment_id ON public.whatsapp_interactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_created_at ON public.whatsapp_interactions(created_at DESC);

ALTER TABLE public.whatsapp_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view WhatsApp interactions for their patients"
  ON public.whatsapp_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = whatsapp_interactions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create WhatsApp interactions"
  ON public.whatsapp_interactions
  FOR INSERT
  WITH CHECK (true); -- Permite inserção via webhook

