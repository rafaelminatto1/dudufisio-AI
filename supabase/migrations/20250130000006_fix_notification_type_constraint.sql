-- =====================================================
-- Remove ou atualiza check constraint de notification_type
-- =====================================================

-- Remover constraint antigo
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

-- Adicionar novo constraint que aceita os mesmos valores
ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check CHECK (
  notification_type IS NULL OR notification_type IN (
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
  )
);

-- Também garantir que type tenha o mesmo constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IS NULL OR type IN (
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
  )
);
