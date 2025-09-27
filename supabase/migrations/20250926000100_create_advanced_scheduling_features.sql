-- Migração: Funcionalidades Avançadas de Agenda (Templates, Bloqueios, Fila, Alertas)

BEGIN;

-- Tabela de templates recorrentes
CREATE TABLE IF NOT EXISTS recurrence_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  recurrence_rule JSONB NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurrence_templates_therapist
  ON recurrence_templates(therapist_id)
  WHERE is_active;

-- Ajustes na tabela de appointments para suportar recorrência e metadados
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS series_id UUID,
  ADD COLUMN IF NOT EXISTS recurrence_template_id UUID REFERENCES recurrence_templates(id),
  ADD COLUMN IF NOT EXISTS recurrence_rule JSONB,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS value NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_appointments_series_id ON appointments(series_id);

-- Bloqueios de agenda
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  block_type TEXT NOT NULL DEFAULT 'ausencia',
  recurrence_rule JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_blocks_therapist_time
  ON schedule_blocks(therapist_id, start_at, end_at);

-- Fila de espera automática
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  preferred_start_from TIMESTAMPTZ,
  preferred_start_to TIMESTAMPTZ,
  preferred_days INTEGER[],
  preferred_time_ranges JSONB,
  urgency SMALLINT DEFAULT 2 CHECK (urgency BETWEEN 1 AND 5),
  no_show_risk NUMERIC(4,3),
  status TEXT NOT NULL DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status
  ON waitlist_entries(status, created_at);

-- Histórico de alertas de agenda
CREATE TABLE IF NOT EXISTS scheduling_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scheduling_alerts_active
  ON scheduling_alerts(alert_type)
  WHERE resolved = FALSE;

COMMIT;

