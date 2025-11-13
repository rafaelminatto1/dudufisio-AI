-- Add missing Stripe columns to payments table
-- and create test users

BEGIN;
-- 1. Add missing columns to payments table (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN stripe_payment_intent_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN stripe_customer_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;
END $$;
-- 2. Create test users if they don't exist

-- Create therapist user
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    phone,
    created_at
)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'terapeuta@dudufisio.com',
    'Dr. João Silva',
    'therapist',
    '(11) 98765-4321',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
-- Create patient user
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    phone,
    created_at
)
VALUES (
    'c0000000-0000-0000-0000-000000000002',
    'paciente@dudufisio.com',
    'Maria Santos',
    'patient',
    '(11) 91234-5678',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
-- Create admin user
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    phone,
    created_at
)
VALUES (
    'c0000000-0000-0000-0000-000000000003',
    'admin@dudufisio.com',
    'Admin Sistema',
    'admin',
    '(11) 99999-9999',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
COMMIT;
