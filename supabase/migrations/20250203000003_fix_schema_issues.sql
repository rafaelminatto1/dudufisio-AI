-- Fix schema issues found in tests

BEGIN;
-- 1. Fix payments status check constraint
-- Allow 'completed' status
DO $$
BEGIN
    -- Drop existing constraint
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

    -- Add new constraint with 'completed'
    ALTER TABLE payments ADD CONSTRAINT payments_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'));
END $$;
-- 2. Add missing columns to patient_messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'patient_messages' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE patient_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'patient_messages' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE patient_messages ADD COLUMN read_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'patient_messages' AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE patient_messages ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'patient_messages' AND column_name = 'parent_message_id'
    ) THEN
        ALTER TABLE patient_messages ADD COLUMN parent_message_id UUID REFERENCES patient_messages(id);
    END IF;
END $$;
-- 3. Make appointments.duration nullable (not all appointments have duration until they're completed)
ALTER TABLE appointments ALTER COLUMN duration DROP NOT NULL;
-- 4. Set default duration to 60 minutes for new appointments
ALTER TABLE appointments ALTER COLUMN duration SET DEFAULT 60;
COMMIT;
