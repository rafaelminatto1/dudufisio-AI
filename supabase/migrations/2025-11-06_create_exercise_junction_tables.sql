-- Migration: Create junction tables for exercises relations
-- Date: 2025-11-06
-- Purpose: Replace JSONB exercise lists with normalized junction tables

-- NOTE: Adjust FK target table names if your schema uses different names
-- Expected tables: public.exercises, public.exercise_protocols, public.conduct_templates,
--                  public.patient_exercise_prescriptions, public.session_evolutions

-- Enable pgcrypto if not enabled (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) protocol_exercises: exercise_protocols <-> exercises
CREATE TABLE IF NOT EXISTS public.protocol_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES public.exercise_protocols(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  hold_time_seconds INTEGER,
  rest_time_seconds INTEGER,
  frequency_per_week INTEGER,
  intensity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_protocol_exercises_protocol ON public.protocol_exercises(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_exercises_exercise ON public.protocol_exercises(exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_protocol_exercises_unique ON public.protocol_exercises(protocol_id, exercise_id, position);

-- 2) template_exercises: conduct_templates <-> exercises
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.conduct_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  hold_time_seconds INTEGER,
  rest_time_seconds INTEGER,
  frequency_per_week INTEGER,
  intensity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_template_exercises_template ON public.template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_exercise ON public.template_exercises(exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_template_exercises_unique ON public.template_exercises(template_id, exercise_id, position);

-- 3) prescription_exercises: patient_exercise_prescriptions <-> exercises
CREATE TABLE IF NOT EXISTS public.prescription_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.patient_exercise_prescriptions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  hold_time_seconds INTEGER,
  rest_time_seconds INTEGER,
  frequency_per_week INTEGER,
  intensity TEXT,
  adherence_target_percent INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prescription_exercises_prescription ON public.prescription_exercises(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_exercises_exercise ON public.prescription_exercises(exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_prescription_exercises_unique ON public.prescription_exercises(prescription_id, exercise_id, position);

-- 4) evolution_prescribed_exercises: session_evolutions <-> exercises
CREATE TABLE IF NOT EXISTS public.evolution_prescribed_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evolution_id UUID NOT NULL REFERENCES public.session_evolutions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL DEFAULT 0,
  sets INTEGER,
  reps INTEGER,
  hold_time_seconds INTEGER,
  rest_time_seconds INTEGER,
  intensity TEXT,
  performed BOOLEAN,
  pain_score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_evolution_prescribed_exercises_evolution ON public.evolution_prescribed_exercises(evolution_id);
CREATE INDEX IF NOT EXISTS idx_evolution_prescribed_exercises_exercise ON public.evolution_prescribed_exercises(exercise_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_evolution_prescribed_exercises_unique ON public.evolution_prescribed_exercises(evolution_id, exercise_id, position);

-- RLS (optional, adapt to your security model)
ALTER TABLE public.protocol_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_prescribed_exercises ENABLE ROW LEVEL SECURITY;

-- Basic policies for authenticated users (adjust as needed)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'protocol_exercises' AND policyname = 'Authenticated select protocol_exercises') THEN
    CREATE POLICY "Authenticated select protocol_exercises" ON public.protocol_exercises FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'protocol_exercises' AND policyname = 'Authenticated modify protocol_exercises') THEN
    CREATE POLICY "Authenticated modify protocol_exercises" ON public.protocol_exercises FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Authenticated update protocol_exercises" ON public.protocol_exercises FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'template_exercises' AND policyname = 'Authenticated select template_exercises') THEN
    CREATE POLICY "Authenticated select template_exercises" ON public.template_exercises FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'template_exercises' AND policyname = 'Authenticated modify template_exercises') THEN
    CREATE POLICY "Authenticated modify template_exercises" ON public.template_exercises FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Authenticated update template_exercises" ON public.template_exercises FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prescription_exercises' AND policyname = 'Authenticated select prescription_exercises') THEN
    CREATE POLICY "Authenticated select prescription_exercises" ON public.prescription_exercises FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'prescription_exercises' AND policyname = 'Authenticated modify prescription_exercises') THEN
    CREATE POLICY "Authenticated modify prescription_exercises" ON public.prescription_exercises FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Authenticated update prescription_exercises" ON public.prescription_exercises FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evolution_prescribed_exercises' AND policyname = 'Authenticated select evolution_prescribed_exercises') THEN
    CREATE POLICY "Authenticated select evolution_prescribed_exercises" ON public.evolution_prescribed_exercises FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'evolution_prescribed_exercises' AND policyname = 'Authenticated modify evolution_prescribed_exercises') THEN
    CREATE POLICY "Authenticated modify evolution_prescribed_exercises" ON public.evolution_prescribed_exercises FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Authenticated update evolution_prescribed_exercises" ON public.evolution_prescribed_exercises FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Grants (adjust according to your roles)
GRANT SELECT, INSERT, UPDATE ON public.protocol_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.template_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.prescription_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.evolution_prescribed_exercises TO authenticated;
GRANT ALL ON public.protocol_exercises TO service_role;
GRANT ALL ON public.template_exercises TO service_role;
GRANT ALL ON public.prescription_exercises TO service_role;
GRANT ALL ON public.evolution_prescribed_exercises TO service_role;

-- TODO: Data backfill from JSONB fields can be scripted separately once JSON structure is confirmed.
