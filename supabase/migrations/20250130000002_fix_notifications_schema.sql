-- =====================================================
-- Fix notifications table schema
-- Adiciona colunas faltantes
-- =====================================================

-- Adicionar colunas faltantes
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_via TEXT[] DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Fazer type NOT NULL após adicionar
UPDATE notifications SET type = 'system_announcement' WHERE type IS NULL;
ALTER TABLE notifications ALTER COLUMN type SET NOT NULL;

-- Fazer title NOT NULL após adicionar
UPDATE notifications SET title = 'Notificação' WHERE title IS NULL;
ALTER TABLE notifications ALTER COLUMN title SET NOT NULL;

-- Fazer message NOT NULL após adicionar
UPDATE notifications SET message = '' WHERE message IS NULL;
ALTER TABLE notifications ALTER COLUMN message SET NOT NULL;

-- Adicionar constraint de tipo
DO $$ BEGIN
  ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'appointment_reminder_24h',
    'appointment_reminder_2h',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_rescheduled',
    'payment_received',
    'payment_due',
    'exercise_assigned',
    'message_received',
    'system_announcement',
    'achievement_unlocked'
  ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Comentários
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação (appointment_reminder_24h, system_announcement, etc)';
COMMENT ON COLUMN notifications.data IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN notifications.sent_via IS 'Canais pelos quais a notificação foi enviada (email, sms, whatsapp, push, in_app)';
