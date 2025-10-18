-- Fix appointments foreign key constraints to allow test users
-- Solution: Make foreign keys reference public.users instead of auth.users

BEGIN;

-- 1. Drop existing foreign key constraints on appointments table
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_therapist_id_fkey;

-- 2. Add new foreign key constraints that reference public.users
-- This allows us to use test users that exist in public.users but not in auth.users
ALTER TABLE appointments
  ADD CONSTRAINT appointments_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_therapist_id_fkey
  FOREIGN KEY (therapist_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- 3. Do the same for other tables that reference users

-- Fix teleconsultas
ALTER TABLE teleconsultas DROP CONSTRAINT IF EXISTS teleconsultas_patient_id_fkey;
ALTER TABLE teleconsultas DROP CONSTRAINT IF EXISTS teleconsultas_therapist_id_fkey;

ALTER TABLE teleconsultas
  ADD CONSTRAINT teleconsultas_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE teleconsultas
  ADD CONSTRAINT teleconsultas_therapist_id_fkey
  FOREIGN KEY (therapist_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Fix patient_messages
ALTER TABLE patient_messages DROP CONSTRAINT IF EXISTS patient_messages_sender_id_fkey;
ALTER TABLE patient_messages DROP CONSTRAINT IF EXISTS patient_messages_recipient_id_fkey;

ALTER TABLE patient_messages
  ADD CONSTRAINT patient_messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE patient_messages
  ADD CONSTRAINT patient_messages_recipient_id_fkey
  FOREIGN KEY (recipient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Fix appointment_requests
ALTER TABLE appointment_requests DROP CONSTRAINT IF EXISTS appointment_requests_patient_id_fkey;
ALTER TABLE appointment_requests DROP CONSTRAINT IF EXISTS appointment_requests_therapist_id_fkey;
ALTER TABLE appointment_requests DROP CONSTRAINT IF EXISTS appointment_requests_responded_by_fkey;

ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_therapist_id_fkey
  FOREIGN KEY (therapist_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_responded_by_fkey
  FOREIGN KEY (responded_by)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Fix payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_patient_id_fkey;

ALTER TABLE payments
  ADD CONSTRAINT payments_patient_id_fkey
  FOREIGN KEY (patient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

COMMIT;
