-- Migration: Enhance patients table with missing fields
-- Adds: marital_status, photo_url, patient_origin, whatsapp

-- Add missing columns to patients table
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS patient_origin TEXT, -- origem do paciente (indicação, instagram, google, etc)
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS rg TEXT;

-- Create index for patient_origin for marketing analytics
CREATE INDEX IF NOT EXISTS idx_patients_origin ON public.patients(patient_origin) WHERE deleted_at IS NULL;

-- Create table for patient pre-registrations
CREATE TABLE IF NOT EXISTS public.patient_pre_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT,
  birth_date DATE,
  data JSONB DEFAULT '{}'::jsonb, -- Additional data from pre-registration form
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMPTZ,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for pre-registrations
CREATE INDEX IF NOT EXISTS idx_pre_registrations_token ON public.patient_pre_registrations(token);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_status ON public.patient_pre_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pre_registrations_expires_at ON public.patient_pre_registrations(expires_at);

-- Function to generate unique token
CREATE OR REPLACE FUNCTION generate_pre_registration_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a random token
  token := encode(gen_random_bytes(32), 'base64');
  -- Remove special characters and make URL-safe
  token := replace(replace(token, '+', '-'), '/', '_');
  token := replace(token, '=', '');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- RLS for pre-registrations (public read for token validation, admin write)
ALTER TABLE public.patient_pre_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pre-registrations are publicly readable by token"
  ON public.patient_pre_registrations
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pre-registrations"
  ON public.patient_pre_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_patient_pre_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_pre_registrations_updated_at
  BEFORE UPDATE ON public.patient_pre_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_pre_registrations_updated_at();

