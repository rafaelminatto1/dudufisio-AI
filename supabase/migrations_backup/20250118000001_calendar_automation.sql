-- Migration: Calendar Automation Triggers
-- Description: Triggers para auto-gerar links e enviar notificações

-- Function para gerar link automaticamente ao criar appointment
CREATE OR REPLACE FUNCTION auto_generate_calendar_link()
RETURNS TRIGGER AS $$
DECLARE
  patient_prefs JSONB;
  ics_link TEXT;
  google_link TEXT;
  outlook_link TEXT;
  yahoo_link TEXT;
  appointment_title TEXT;
BEGIN
  -- Buscar preferências do paciente
  SELECT 
    COALESCE(
      (SELECT row_to_json(cp.*) FROM communication_preferences cp WHERE cp.patient_id = NEW.patient_id),
      '{"auto_send_calendar_invite": true}'::jsonb
    ) INTO patient_prefs;
  
  -- Se auto_send = true (padrão), gerar link
  IF (patient_prefs->>'auto_send_calendar_invite')::BOOLEAN IS NOT FALSE THEN
    -- Gerar URLs
    ics_link := format('https://dudufisio.vercel.app/api/calendar/%s.ics', NEW.id);
    
    -- Google Calendar link
    google_link := format(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consulta&dates=%s/%s',
      to_char(NEW.start_time, 'YYYYMMDD"T"HH24MISS'),
      to_char(NEW.end_time, 'YYYYMMDD"T"HH24MISS')
    );
    
    -- Outlook Calendar link
    outlook_link := format(
      'https://outlook.live.com/calendar/0/deeplink/compose?subject=Consulta&startdt=%s&enddt=%s',
      to_char(NEW.start_time AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"'),
      to_char(NEW.end_time AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"')
    );
    
    -- Yahoo Calendar link
    yahoo_link := format(
      'https://calendar.yahoo.com/?v=60&view=d&type=20&title=Consulta&st=%s',
      to_char(NEW.start_time, 'YYYYMMDD"T"HH24MISS')
    );
    
    -- Título do evento
    appointment_title := COALESCE(NEW.title, 'Consulta');
    
    -- Inserir na tabela
    INSERT INTO calendar_links (
      appointment_id,
      patient_id,
      universal_link,
      google_link,
      outlook_link,
      yahoo_link,
      apple_ics_link,
      event_title,
      event_date
    ) VALUES (
      NEW.id,
      NEW.patient_id,
      ics_link,
      google_link,
      outlook_link,
      yahoo_link,
      ics_link,
      appointment_title,
      NEW.start_time
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao inserir appointment
DROP TRIGGER IF EXISTS on_appointment_create_calendar_link ON appointments;
CREATE TRIGGER on_appointment_create_calendar_link
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_calendar_link();

-- Function para atualizar link quando appointment é atualizado
CREATE OR REPLACE FUNCTION update_calendar_link_on_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  ics_link TEXT;
  google_link TEXT;
  outlook_link TEXT;
  yahoo_link TEXT;
BEGIN
  -- Se horário ou título mudou, atualizar links
  IF (OLD.start_time IS DISTINCT FROM NEW.start_time) OR 
     (OLD.end_time IS DISTINCT FROM NEW.end_time) OR
     (OLD.title IS DISTINCT FROM NEW.title) THEN
    
    -- Gerar novos URLs
    ics_link := format('https://dudufisio.vercel.app/api/calendar/%s.ics', NEW.id);
    
    google_link := format(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=%s&dates=%s/%s',
      COALESCE(NEW.title, 'Consulta'),
      to_char(NEW.start_time, 'YYYYMMDD"T"HH24MISS'),
      to_char(NEW.end_time, 'YYYYMMDD"T"HH24MISS')
    );
    
    outlook_link := format(
      'https://outlook.live.com/calendar/0/deeplink/compose?subject=%s&startdt=%s&enddt=%s',
      COALESCE(NEW.title, 'Consulta'),
      to_char(NEW.start_time AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"'),
      to_char(NEW.end_time AT TIME ZONE 'UTC', 'YYYYMMDD"T"HH24MISS"Z"')
    );
    
    yahoo_link := format(
      'https://calendar.yahoo.com/?v=60&view=d&type=20&title=%s&st=%s',
      COALESCE(NEW.title, 'Consulta'),
      to_char(NEW.start_time, 'YYYYMMDD"T"HH24MISS')
    );
    
    -- Atualizar links
    UPDATE calendar_links
    SET
      universal_link = ics_link,
      google_link = google_link,
      outlook_link = outlook_link,
      yahoo_link = yahoo_link,
      apple_ics_link = ics_link,
      event_title = COALESCE(NEW.title, 'Consulta'),
      event_date = NEW.start_time,
      updated_at = NOW()
    WHERE appointment_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao atualizar appointment
DROP TRIGGER IF EXISTS on_appointment_update_calendar_link ON appointments;
CREATE TRIGGER on_appointment_update_calendar_link
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_link_on_appointment_change();

-- Function para deletar links quando appointment é cancelado/deletado
CREATE OR REPLACE FUNCTION cleanup_calendar_link_on_appointment_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Deletar links relacionados
  DELETE FROM calendar_links WHERE appointment_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger ao deletar appointment
DROP TRIGGER IF EXISTS on_appointment_delete_calendar_link ON appointments;
CREATE TRIGGER on_appointment_delete_calendar_link
  AFTER DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_calendar_link_on_appointment_delete();

-- Add comments
COMMENT ON FUNCTION auto_generate_calendar_link IS 'Auto-gera links de calendário ao criar appointment';
COMMENT ON FUNCTION update_calendar_link_on_appointment_change IS 'Atualiza links quando appointment é modificado';
COMMENT ON FUNCTION cleanup_calendar_link_on_appointment_delete IS 'Remove links quando appointment é deletado';

