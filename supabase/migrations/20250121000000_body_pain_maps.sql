-- Migration: Body Pain Maps Table
-- Cria tabela para armazenar mapas de dor corporais

CREATE TABLE IF NOT EXISTS public.body_pain_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.session_evolutions(id) ON DELETE SET NULL,
  
  -- Vista do mapa (front/back)
  view TEXT NOT NULL CHECK (view IN ('front', 'back')),
  
  -- Pontos de dor (JSONB array)
  points JSONB DEFAULT '[]' NOT NULL,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_patient_id ON public.body_pain_maps(patient_id);
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_session_id ON public.body_pain_maps(session_id);
CREATE INDEX IF NOT EXISTS idx_body_pain_maps_created_at ON public.body_pain_maps(created_at DESC);

-- RLS Policies
ALTER TABLE public.body_pain_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patients' pain maps"
  ON public.body_pain_maps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = body_pain_maps.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pain maps for their patients"
  ON public.body_pain_maps
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = body_pain_maps.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their patients' pain maps"
  ON public.body_pain_maps
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = body_pain_maps.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their patients' pain maps"
  ON public.body_pain_maps
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = body_pain_maps.patient_id
      AND patients.user_id = auth.uid()
    )
  );

