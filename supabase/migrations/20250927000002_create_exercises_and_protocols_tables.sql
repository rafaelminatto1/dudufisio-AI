-- Migração: Tabelas para Exercícios e Protocolos
-- Data: 2025-09-27

BEGIN;

-- Tabela de exercícios - Criar se não existir
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  instructions TEXT[] DEFAULT '{}',
  precautions TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  video_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para exercícios
CREATE INDEX IF NOT EXISTS idx_exercises_category
  ON exercises(category);

CREATE INDEX IF NOT EXISTS idx_exercises_difficulty
  ON exercises(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups
  ON exercises USING GIN(muscle_groups);

CREATE INDEX IF NOT EXISTS idx_exercises_equipment
  ON exercises USING GIN(equipment);

CREATE INDEX IF NOT EXISTS idx_exercises_tags
  ON exercises USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_exercises_active
  ON exercises(is_active);

-- Tabela de protocolos de exercícios
CREATE TABLE IF NOT EXISTS exercise_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  pathology TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('acute', 'subacute', 'chronic', 'maintenance')),
  duration_weeks INTEGER NOT NULL,
  frequency_per_week INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para protocolos
CREATE INDEX IF NOT EXISTS idx_exercise_protocols_category
  ON exercise_protocols(category);

CREATE INDEX IF NOT EXISTS idx_exercise_protocols_pathology
  ON exercise_protocols(pathology);

CREATE INDEX IF NOT EXISTS idx_exercise_protocols_phase
  ON exercise_protocols(phase);

CREATE INDEX IF NOT EXISTS idx_exercise_protocols_active
  ON exercise_protocols(is_active);

-- Tabela de exercícios dentro dos protocolos
CREATE TABLE IF NOT EXISTS protocol_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES exercise_protocols(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_position INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  repetitions INTEGER NOT NULL,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(protocol_id, exercise_id)
);

-- Índices para protocol_exercises
CREATE INDEX IF NOT EXISTS idx_protocol_exercises_protocol
  ON protocol_exercises(protocol_id);

CREATE INDEX IF NOT EXISTS idx_protocol_exercises_exercise
  ON protocol_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_protocol_exercises_order
  ON protocol_exercises(protocol_id, order_position);

-- Tabela para prescrições de exercícios para pacientes
CREATE TABLE IF NOT EXISTS patient_exercise_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  protocol_id UUID REFERENCES exercise_protocols(id) ON DELETE SET NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  prescription_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'protocol'
  sets INTEGER NOT NULL,
  repetitions INTEGER NOT NULL,
  duration_seconds INTEGER,
  rest_seconds INTEGER,
  frequency_per_week INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para prescrições
CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_patient
  ON patient_exercise_prescriptions(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_therapist
  ON patient_exercise_prescriptions(therapist_id);

CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_status
  ON patient_exercise_prescriptions(status);

CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_dates
  ON patient_exercise_prescriptions(start_date, end_date);

-- Tabela para execução/progresso dos exercícios pelos pacientes
CREATE TABLE IF NOT EXISTS patient_exercise_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES patient_exercise_prescriptions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  repetitions_completed INTEGER NOT NULL DEFAULT 0,
  duration_seconds_completed INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10), -- Escala de Borg
  pain_level_before INTEGER CHECK (pain_level_before BETWEEN 0 AND 10),
  pain_level_after INTEGER CHECK (pain_level_after BETWEEN 0 AND 10),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para execuções
CREATE INDEX IF NOT EXISTS idx_exercise_executions_prescription
  ON patient_exercise_executions(prescription_id);

CREATE INDEX IF NOT EXISTS idx_exercise_executions_patient
  ON patient_exercise_executions(patient_id);

CREATE INDEX IF NOT EXISTS idx_exercise_executions_date
  ON patient_exercise_executions(execution_date);

-- Dados de exemplo removidos para evitar conflitos com estrutura existente

COMMIT;