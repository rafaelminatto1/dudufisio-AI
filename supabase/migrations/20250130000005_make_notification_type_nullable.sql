-- =====================================================
-- Make notification_type nullable or sync with type
-- =====================================================

-- Opção 1: Fazer notification_type nullable
ALTER TABLE notifications ALTER COLUMN notification_type DROP NOT NULL;

-- Opção 2: Criar trigger para sincronizar type -> notification_type
CREATE OR REPLACE FUNCTION sync_notification_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Se type foi definido mas notification_type não, copiar
  IF NEW.type IS NOT NULL AND NEW.notification_type IS NULL THEN
    NEW.notification_type := NEW.type;
  END IF;

  -- Se notification_type foi definido mas type não, copiar
  IF NEW.notification_type IS NOT NULL AND NEW.type IS NULL THEN
    NEW.type := NEW.notification_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_notification_type_trigger ON notifications;
CREATE TRIGGER sync_notification_type_trigger
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_notification_type();

-- Atualizar registros existentes para sincronizar
UPDATE notifications SET notification_type = type WHERE notification_type IS NULL AND type IS NOT NULL;
UPDATE notifications SET type = notification_type WHERE type IS NULL AND notification_type IS NOT NULL;

COMMENT ON TRIGGER sync_notification_type_trigger ON notifications IS 'Sincroniza automaticamente as colunas type e notification_type';
