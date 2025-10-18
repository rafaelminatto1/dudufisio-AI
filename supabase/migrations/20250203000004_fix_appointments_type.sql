-- Fix appointments type check constraint

BEGIN;

-- Drop existing constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_type_check;

-- Add new constraint with 'consultation'
ALTER TABLE appointments ADD CONSTRAINT appointments_type_check
CHECK (type IN ('consultation', 'assessment', 'follow_up', 'therapy', 'treatment'));

COMMIT;
