-- Calendar Integration Schema for DuduFisio-AI
-- This migration creates the necessary tables for calendar integration tracking

-- Create enum for calendar integration status
CREATE TYPE calendar_integration_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'cancelled'
);

-- Create enum for calendar providers
CREATE TYPE calendar_provider AS ENUM (
  'google',
  'outlook',
  'apple',
  'ics'
);

-- Create enum for reminder methods
CREATE TYPE reminder_method AS ENUM (
  'email',
  'popup',
  'sms'
);

-- Calendar integrations tracking table
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  external_event_id VARCHAR(255),
  status calendar_integration_status NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar preferences for patients
CREATE TABLE calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
  preferred_provider calendar_provider DEFAULT 'ics',
  enable_reminders BOOLEAN DEFAULT true,
  reminder_times INTEGER[] DEFAULT ARRAY[1440, 60], -- 24 hours and 1 hour before in minutes
  auto_accept_invites BOOLEAN DEFAULT false,
  share_availability BOOLEAN DEFAULT false,
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar queue jobs table (for async processing)
CREATE TABLE calendar_queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL, -- 'send-invite', 'update-invite', 'cancel-invite', 'sync-availability'
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_email VARCHAR(255),
  provider_preference calendar_provider,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 5, -- Lower number = higher priority
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar metrics table (for monitoring and analytics)
CREATE TABLE calendar_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider calendar_provider NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'invite_sent', 'invite_delivered', 'invite_failed', 'response_time'
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar provider configurations (encrypted sensitive data)
CREATE TABLE calendar_provider_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider calendar_provider NOT NULL UNIQUE,
  config_data JSONB NOT NULL, -- Encrypted configuration data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_calendar_integrations_appointment ON calendar_integrations(appointment_id);
CREATE INDEX idx_calendar_integrations_patient ON calendar_integrations(patient_id);
CREATE INDEX idx_calendar_integrations_status ON calendar_integrations(status);
CREATE INDEX idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX idx_calendar_integrations_created_at ON calendar_integrations(created_at);

CREATE INDEX idx_calendar_preferences_patient ON calendar_preferences(patient_id);

CREATE INDEX idx_calendar_queue_jobs_status ON calendar_queue_jobs(status);
CREATE INDEX idx_calendar_queue_jobs_priority ON calendar_queue_jobs(priority);
CREATE INDEX idx_calendar_queue_jobs_scheduled_for ON calendar_queue_jobs(scheduled_for);
CREATE INDEX idx_calendar_queue_jobs_appointment ON calendar_queue_jobs(appointment_id);

CREATE INDEX idx_calendar_metrics_provider ON calendar_metrics(provider);
CREATE INDEX idx_calendar_metrics_type ON calendar_metrics(metric_type);
CREATE INDEX idx_calendar_metrics_recorded_at ON calendar_metrics(recorded_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_calendar_preferences_updated_at
  BEFORE UPDATE ON calendar_preferences
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_calendar_queue_jobs_updated_at
  BEFORE UPDATE ON calendar_queue_jobs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_calendar_provider_configs_updated_at
  BEFORE UPDATE ON calendar_provider_configs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_provider_configs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view their own calendar integrations" ON calendar_integrations
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can manage calendar integrations" ON calendar_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Admin', 'Fisioterapeuta')
    )
  );

CREATE POLICY "Users can manage their own calendar preferences" ON calendar_preferences
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view calendar preferences" ON calendar_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Admin', 'Fisioterapeuta')
    )
  );

CREATE POLICY "Only admins can manage queue jobs" ON calendar_queue_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Only admins can view metrics" ON calendar_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Only admins can manage provider configs" ON calendar_provider_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Functions for calendar integration management

-- Function to get calendar statistics
CREATE OR REPLACE FUNCTION get_calendar_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_invites_sent BIGINT,
  success_rate NUMERIC,
  avg_delivery_time NUMERIC,
  provider_stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      ci.provider,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE ci.status IN ('sent', 'delivered')) as successful,
      AVG(EXTRACT(EPOCH FROM (ci.updated_at - ci.created_at)) * 1000) as avg_duration
    FROM calendar_integrations ci
    WHERE ci.created_at BETWEEN start_date AND end_date
    GROUP BY ci.provider
  )
  SELECT
    SUM(s.total) as total_invites_sent,
    ROUND(
      CASE
        WHEN SUM(s.total) > 0 THEN (SUM(s.successful)::NUMERIC / SUM(s.total)) * 100
        ELSE 0
      END, 2
    ) as success_rate,
    ROUND(AVG(s.avg_duration), 2) as avg_delivery_time,
    jsonb_object_agg(
      s.provider,
      jsonb_build_object(
        'total_sent', s.total,
        'success_count', s.successful,
        'success_rate', ROUND((s.successful::NUMERIC / s.total) * 100, 2),
        'avg_delivery_time', ROUND(s.avg_duration, 2)
      )
    ) as provider_stats
  FROM stats s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old queue jobs
CREATE OR REPLACE FUNCTION cleanup_old_calendar_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM calendar_queue_jobs
  WHERE status IN ('completed', 'failed')
    AND updated_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get queue statistics
CREATE OR REPLACE FUNCTION get_queue_stats()
RETURNS TABLE (
  pending BIGINT,
  processing BIGINT,
  completed BIGINT,
  failed BIGINT,
  avg_processing_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'processing') as processing,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(
      AVG(
        CASE
          WHEN status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
          ELSE NULL
        END
      ), 2
    ) as avg_processing_time
  FROM calendar_queue_jobs
  WHERE created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default calendar preferences for existing patients
INSERT INTO calendar_preferences (patient_id)
SELECT id FROM patients
WHERE id NOT IN (SELECT patient_id FROM calendar_preferences);

-- Comments for documentation
COMMENT ON TABLE calendar_integrations IS 'Tracks calendar integration attempts and results for appointments';
COMMENT ON TABLE calendar_preferences IS 'Stores patient preferences for calendar integrations';
COMMENT ON TABLE calendar_queue_jobs IS 'Queue for asynchronous calendar integration processing';
COMMENT ON TABLE calendar_metrics IS 'Stores metrics for monitoring calendar integration performance';
COMMENT ON TABLE calendar_provider_configs IS 'Stores encrypted configuration for calendar providers';

COMMENT ON COLUMN calendar_integrations.external_event_id IS 'ID of the event in the external calendar system';
COMMENT ON COLUMN calendar_integrations.metadata IS 'Additional data specific to the calendar provider';
COMMENT ON COLUMN calendar_preferences.reminder_times IS 'Array of minutes before appointment to send reminders';
COMMENT ON COLUMN calendar_queue_jobs.priority IS 'Job priority (1-10, lower number = higher priority)';
COMMENT ON COLUMN calendar_metrics.metric_value IS 'Numeric value of the metric (response time in ms, count, etc.)';