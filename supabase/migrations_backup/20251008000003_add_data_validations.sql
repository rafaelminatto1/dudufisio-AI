-- ============================================================================
-- MIGRAÇÃO: VALIDAÇÕES E CONSTRAINTS ADICIONAIS
-- Data: 2025-10-08
-- Descrição: Adiciona constraints de validação para garantir integridade de dados
-- ============================================================================

BEGIN;

-- 1. Validações em patients
DO $$ 
BEGIN
  -- Email válido
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patients_valid_email'
  ) THEN
    ALTER TABLE patients
      ADD CONSTRAINT patients_valid_email 
      CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Telefone válido
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patients_valid_phone'
  ) THEN
    ALTER TABLE patients
      ADD CONSTRAINT patients_valid_phone 
      CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');
  END IF;

  -- Data de nascimento lógica
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patients_logical_birth_date'
  ) THEN
    ALTER TABLE patients
      ADD CONSTRAINT patients_logical_birth_date 
      CHECK (birth_date IS NULL OR (birth_date <= CURRENT_DATE AND birth_date >= '1900-01-01'));
  END IF;

  -- Created_at não pode ser no futuro
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'patients_future_created_at'
  ) THEN
    ALTER TABLE patients
      ADD CONSTRAINT patients_future_created_at 
      CHECK (created_at <= NOW() + INTERVAL '1 hour'); -- margem de 1h para diferença de timezone
  END IF;
END $$;

-- 2. Validações em appointments
DO $$ 
BEGIN
  -- Scheduled_at deve ser após created_at (se coluna existir)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'scheduled_at')
     AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_logical_scheduled_time'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_logical_scheduled_time 
      CHECK (scheduled_at >= created_at - INTERVAL '1 day'); -- permite ajustes retroativos de 1 dia
  END IF;

  -- Status válido (se coluna existir)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status')
     AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_valid_status'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_valid_status 
      CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'));
  END IF;

  -- Payment status válido (se coluna existir)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'payment_status')
     AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_valid_payment_status'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_valid_payment_status 
      CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled'));
  END IF;

  -- Value positivo (se coluna existir)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'value')
     AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_positive_value'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_positive_value 
      CHECK (value IS NULL OR value >= 0);
  END IF;
END $$;

-- 3. Validações em clinical_documents
DO $$ 
BEGIN
  -- Documento assinado deve ter dados de assinatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clinical_docs_signed_has_signature'
  ) THEN
    ALTER TABLE clinical_documents
      ADD CONSTRAINT clinical_docs_signed_has_signature 
      CHECK (
        (is_signed = FALSE) OR 
        (is_signed = TRUE AND signature_data IS NOT NULL AND signed_at IS NOT NULL AND signed_by IS NOT NULL)
      );
  END IF;

  -- Versão positiva
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clinical_docs_positive_version'
  ) THEN
    ALTER TABLE clinical_documents
      ADD CONSTRAINT clinical_docs_positive_version 
      CHECK (version > 0);
  END IF;
END $$;

-- 4. Validações em exercises
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_positive_duration'
  ) THEN
    ALTER TABLE exercises
      ADD CONSTRAINT exercises_positive_duration 
      CHECK (duration_minutes IS NULL OR duration_minutes > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_positive_repetitions'
  ) THEN
    ALTER TABLE exercises
      ADD CONSTRAINT exercises_positive_repetitions 
      CHECK (repetitions IS NULL OR repetitions > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'exercises_positive_sets'
  ) THEN
    ALTER TABLE exercises
      ADD CONSTRAINT exercises_positive_sets 
      CHECK (sets IS NULL OR sets > 0);
  END IF;
END $$;

-- 5. Validações em patient_exercise_prescriptions
DO $$ 
BEGIN
  -- End_date após start_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prescriptions_logical_date_range'
  ) THEN
    ALTER TABLE patient_exercise_prescriptions
      ADD CONSTRAINT prescriptions_logical_date_range 
      CHECK (end_date IS NULL OR end_date >= start_date);
  END IF;

  -- Sets positivos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prescriptions_positive_sets'
  ) THEN
    ALTER TABLE patient_exercise_prescriptions
      ADD CONSTRAINT prescriptions_positive_sets 
      CHECK (sets > 0);
  END IF;

  -- Repetitions positivas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prescriptions_positive_repetitions'
  ) THEN
    ALTER TABLE patient_exercise_prescriptions
      ADD CONSTRAINT prescriptions_positive_repetitions 
      CHECK (repetitions > 0);
  END IF;

  -- Frequência semanal válida
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'prescriptions_valid_frequency'
  ) THEN
    ALTER TABLE patient_exercise_prescriptions
      ADD CONSTRAINT prescriptions_valid_frequency 
      CHECK (frequency_per_week > 0 AND frequency_per_week <= 7);
  END IF;
END $$;

-- 6. Validações em payments (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
    -- Amount positivo
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payments_positive_amount' AND table_name = 'payments'
    ) THEN
      ALTER TABLE payments
        ADD CONSTRAINT payments_positive_amount 
        CHECK (amount > 0);
    END IF;

    -- Paid_at lógico
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payments_logical_paid_date' AND table_name = 'payments'
    ) THEN
      ALTER TABLE payments
        ADD CONSTRAINT payments_logical_paid_date 
        CHECK (paid_at IS NULL OR paid_at >= created_at - INTERVAL '1 day');
    END IF;
  END IF;
END $$;

-- 7. Validações em patient_exercise_executions
DO $$ 
BEGIN
  -- Sets completed não negativo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'executions_valid_sets'
  ) THEN
    ALTER TABLE patient_exercise_executions
      ADD CONSTRAINT executions_valid_sets 
      CHECK (sets_completed >= 0);
  END IF;

  -- Repetitions completed não negativo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'executions_valid_repetitions'
  ) THEN
    ALTER TABLE patient_exercise_executions
      ADD CONSTRAINT executions_valid_repetitions 
      CHECK (repetitions_completed >= 0);
  END IF;
END $$;

-- 8. Comentários
COMMENT ON CONSTRAINT patients_valid_email ON patients IS 'Valida formato de email usando regex';
COMMENT ON CONSTRAINT appointments_valid_status ON appointments IS 'Apenas statuses permitidos: scheduled, confirmed, in_progress, completed, cancelled, no_show';
COMMENT ON CONSTRAINT clinical_docs_signed_has_signature ON clinical_documents IS 'Documentos assinados devem ter signature_data, signed_at e signed_by';

COMMIT;
