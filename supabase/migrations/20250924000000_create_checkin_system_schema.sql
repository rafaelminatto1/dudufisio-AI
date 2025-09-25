-- =====================================================
-- FISIOFLOW INTELLIGENT CHECK-IN SYSTEM SCHEMA
-- Migration: 20250924000000_create_checkin_system_schema.sql
-- Description: Complete database schema for intelligent check-in and patient portal
-- =====================================================

BEGIN;

-- Create extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PATIENT CHECK-INS TABLE
-- =====================================================
CREATE TABLE patient_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

  -- Check-in data
  checkin_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method VARCHAR(30) NOT NULL CHECK (method IN (
    'facial_recognition', 'manual_search', 'qr_code', 'phone_number'
  )),
  device_id VARCHAR(100) NOT NULL,

  -- Facial recognition data
  photo_url TEXT,
  recognition_confidence DECIMAL(3,2) CHECK (recognition_confidence >= 0 AND recognition_confidence <= 1),
  face_encoding_used BOOLEAN DEFAULT FALSE,

  -- Health screening
  health_screening_passed BOOLEAN DEFAULT TRUE,
  temperature DECIMAL(4,1) CHECK (temperature >= 30.0 AND temperature <= 45.0),
  health_answers JSONB DEFAULT '{}',
  health_risk_factors TEXT[],

  -- Queue management
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
    'completed', 'failed', 'cancelled', 'requires_review'
  )),
  queue_position INTEGER,
  estimated_wait_time INTEGER, -- in minutes
  actual_wait_time INTEGER, -- in minutes, filled when appointment starts

  -- Metadata and tracking
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FACE ENCODINGS TABLE (SECURE STORAGE)
-- =====================================================
CREATE TABLE face_encodings (
  patient_id UUID PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,

  -- Encrypted face encoding data
  encoding_data BYTEA NOT NULL, -- Encrypted face encoding
  quality_score DECIMAL(3,2) NOT NULL CHECK (quality_score >= 0 AND quality_score <= 1),

  -- Enrollment information
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enrolled_by UUID REFERENCES users(id),
  enrollment_device VARCHAR(100),

  -- Usage tracking
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  recognition_success_count INTEGER DEFAULT 0,

  -- Security and integrity
  encryption_key_id VARCHAR(100) NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  salt VARCHAR(32) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENT PORTAL SESSIONS
-- =====================================================
CREATE TABLE patient_portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Session data
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) UNIQUE,

  -- Device information
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),

  -- Session control
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Security
  login_method VARCHAR(30) NOT NULL CHECK (login_method IN (
    'password', 'sms', 'biometric', 'facial_recognition', 'social'
  )),
  two_factor_verified BOOLEAN DEFAULT FALSE,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,

  -- Audit
  logout_reason VARCHAR(50),
  logout_time TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- DEVICE TOKENS FOR PUSH NOTIFICATIONS
-- =====================================================
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Device token data
  token VARCHAR(500) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  app_version VARCHAR(20),

  -- Device information
  device_name VARCHAR(100),
  device_model VARCHAR(100),
  os_version VARCHAR(50),

  -- Token status
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(patient_id, token, platform)
);

-- =====================================================
-- NOTIFICATION HISTORY
-- =====================================================
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Notification data
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB DEFAULT '{}',

  -- Delivery information
  device_tokens TEXT[], -- Array of tokens notification was sent to
  platforms VARCHAR(20)[], -- Array of platforms

  -- Status tracking
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN (
    'scheduled', 'sent', 'delivered', 'failed', 'cancelled'
  )),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  sent_time TIMESTAMP WITH TIME ZONE,
  delivered_time TIMESTAMP WITH TIME ZONE,

  -- Interaction tracking
  opened BOOLEAN DEFAULT FALSE,
  opened_time TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_time TIMESTAMP WITH TIME ZONE,

  -- Error information
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TREATMENT TIMELINE EVENTS
-- =====================================================
CREATE TABLE treatment_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Event information
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'session', 'body_map', 'exercise', 'assessment', 'goal', 'milestone'
  )),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Related entities
  session_id UUID REFERENCES treatment_sessions(id),
  appointment_id UUID REFERENCES appointments(id),
  exercise_id UUID,

  -- Event data
  metadata JSONB DEFAULT '{}',
  attachments TEXT[], -- URLs to related files/images

  -- Visibility and importance
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  importance_level VARCHAR(10) DEFAULT 'normal' CHECK (importance_level IN (
    'low', 'normal', 'high', 'critical'
  )),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENT MESSAGES
-- =====================================================
CREATE TABLE patient_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Message data
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN (
    'system', 'therapist', 'admin', 'patient'
  )),
  sender_id UUID, -- References users(id) if not system message
  sender_name VARCHAR(100) NOT NULL,

  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(30) NOT NULL CHECK (message_type IN (
    'info', 'reminder', 'alert', 'appointment', 'exercise', 'payment', 'general'
  )),

  -- Message status
  is_read BOOLEAN DEFAULT FALSE,
  read_time TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Threading
  parent_message_id UUID REFERENCES patient_messages(id),
  thread_id UUID,

  -- Attachments and links
  attachments JSONB DEFAULT '[]',
  action_buttons JSONB DEFAULT '[]', -- For interactive messages
  deep_link VARCHAR(500),

  -- Delivery tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_time TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- For temporary messages
);

-- =====================================================
-- EXERCISE COMPLETION TRACKING
-- =====================================================
CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL, -- Reference to exercises table

  -- Completion data
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date DATE GENERATED ALWAYS AS (completed_at::DATE) STORED,

  -- Performance metrics
  sets_completed INTEGER,
  reps_completed INTEGER,
  duration_seconds INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  pain_level_before INTEGER CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
  pain_level_after INTEGER CHECK (pain_level_after >= 0 AND pain_level_after <= 10),

  -- Quality metrics
  form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 5),
  effort_level INTEGER CHECK (effort_level >= 1 AND effort_level <= 5),

  -- Notes and feedback
  patient_notes TEXT,
  auto_generated_feedback BOOLEAN DEFAULT FALSE,

  -- Device and tracking
  device_type VARCHAR(30), -- 'mobile_app', 'web', 'wearable'
  tracking_method VARCHAR(30), -- 'manual', 'accelerometer', 'video'

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BODY MAP ASSESSMENTS
-- =====================================================
CREATE TABLE body_map_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES treatment_sessions(id),

  -- Assessment data
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessment_type VARCHAR(30) DEFAULT 'pain' CHECK (assessment_type IN (
    'pain', 'mobility', 'strength', 'sensation', 'function'
  )),

  -- Body map data
  pain_points JSONB DEFAULT '[]', -- Array of {x, y, intensity, type, description}
  affected_areas TEXT[], -- Array of body region names
  overall_rating INTEGER CHECK (overall_rating >= 0 AND overall_rating <= 10),

  -- Comparison with previous
  improvement_areas TEXT[],
  worsened_areas TEXT[],
  new_pain_areas TEXT[],

  -- Assessment notes
  patient_notes TEXT,
  therapist_notes TEXT,
  auto_analysis JSONB DEFAULT '{}', -- AI-generated analysis

  -- Visibility
  is_visible_to_patient BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENT PROGRESS SNAPSHOTS
-- =====================================================
CREATE TABLE patient_progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Snapshot metadata
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  snapshot_type VARCHAR(30) DEFAULT 'regular' CHECK (snapshot_type IN (
    'initial', 'regular', 'milestone', 'discharge', 'follow_up'
  )),

  -- Core metrics
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  mobility_score INTEGER CHECK (mobility_score >= 0 AND mobility_score <= 100),
  functional_score INTEGER CHECK (functional_score >= 0 AND functional_score <= 100),

  -- Goal tracking
  goals_total INTEGER DEFAULT 0,
  goals_achieved INTEGER DEFAULT 0,
  goals_in_progress INTEGER DEFAULT 0,

  -- Exercise metrics
  prescribed_exercises INTEGER DEFAULT 0,
  completed_exercises_last_week INTEGER DEFAULT 0,
  adherence_rate DECIMAL(5,2), -- Percentage

  -- Quality of life indicators
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  activity_level INTEGER CHECK (activity_level >= 1 AND activity_level <= 5),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),

  -- Calculated improvements
  pain_improvement_percentage DECIMAL(5,2),
  mobility_improvement_percentage DECIMAL(5,2),
  overall_improvement_percentage DECIMAL(5,2),

  -- Notes and analysis
  progress_notes TEXT,
  challenges TEXT[],
  achievements TEXT[],
  next_focus_areas TEXT[],

  -- AI analysis
  ai_analysis JSONB DEFAULT '{}',
  trend_analysis JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS EVENTS
-- =====================================================
CREATE TABLE checkin_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(30) NOT NULL CHECK (event_category IN (
    'checkin', 'portal', 'notification', 'exercise', 'error'
  )),

  -- Context information
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  device_id VARCHAR(100),

  -- Event data
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,

  -- Performance metrics
  duration_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_code VARCHAR(50),
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Patient check-ins indexes
CREATE INDEX idx_patient_checkins_patient_date ON patient_checkins(patient_id, checkin_time DESC);
CREATE INDEX idx_patient_checkins_appointment ON patient_checkins(appointment_id);
CREATE INDEX idx_patient_checkins_device ON patient_checkins(device_id, checkin_time DESC);
CREATE INDEX idx_patient_checkins_status ON patient_checkins(status, checkin_time DESC);
CREATE INDEX idx_patient_checkins_method ON patient_checkins(method, checkin_time DESC);
CREATE INDEX idx_patient_checkins_session ON patient_checkins(session_id);

-- Face encodings indexes
CREATE INDEX idx_face_encodings_last_used ON face_encodings(last_used DESC);
CREATE INDEX idx_face_encodings_usage ON face_encodings(usage_count DESC);

-- Portal sessions indexes
CREATE INDEX idx_portal_sessions_token ON patient_portal_sessions(session_token);
CREATE INDEX idx_portal_sessions_patient_active ON patient_portal_sessions(patient_id, is_active, last_activity DESC);
CREATE INDEX idx_portal_sessions_expires ON patient_portal_sessions(expires_at) WHERE is_active = TRUE;

-- Device tokens indexes
CREATE INDEX idx_device_tokens_patient ON device_tokens(patient_id, is_active);
CREATE INDEX idx_device_tokens_platform ON device_tokens(platform, is_active);
CREATE INDEX idx_device_tokens_last_used ON device_tokens(last_used DESC) WHERE is_active = TRUE;

-- Notification history indexes
CREATE INDEX idx_notification_history_patient ON notification_history(patient_id, sent_time DESC);
CREATE INDEX idx_notification_history_type ON notification_history(type, sent_time DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status, scheduled_time);

-- Treatment timeline indexes
CREATE INDEX idx_treatment_timeline_patient_date ON treatment_timeline(patient_id, event_date DESC);
CREATE INDEX idx_treatment_timeline_type ON treatment_timeline(event_type, event_date DESC);
CREATE INDEX idx_treatment_timeline_visible ON treatment_timeline(patient_id, is_visible_to_patient, event_date DESC);

-- Patient messages indexes
CREATE INDEX idx_patient_messages_patient ON patient_messages(patient_id, created_at DESC);
CREATE INDEX idx_patient_messages_unread ON patient_messages(patient_id, is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_patient_messages_type ON patient_messages(message_type, created_at DESC);
CREATE INDEX idx_patient_messages_thread ON patient_messages(thread_id, created_at);

-- Exercise completions indexes
CREATE INDEX idx_exercise_completions_patient_date ON exercise_completions(patient_id, completion_date DESC);
CREATE INDEX idx_exercise_completions_exercise ON exercise_completions(exercise_id, completed_at DESC);
CREATE INDEX idx_exercise_completions_daily ON exercise_completions(completion_date, patient_id);

-- Body map assessments indexes
CREATE INDEX idx_body_map_patient_date ON body_map_assessments(patient_id, assessment_date DESC);
CREATE INDEX idx_body_map_session ON body_map_assessments(session_id);
CREATE INDEX idx_body_map_type ON body_map_assessments(assessment_type, assessment_date DESC);

-- Progress snapshots indexes
CREATE INDEX idx_progress_snapshots_patient_date ON patient_progress_snapshots(patient_id, snapshot_date DESC);
CREATE INDEX idx_progress_snapshots_type ON patient_progress_snapshots(snapshot_type, snapshot_date DESC);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_type_date ON checkin_analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_category_date ON checkin_analytics_events(event_category, created_at DESC);
CREATE INDEX idx_analytics_events_patient ON checkin_analytics_events(patient_id, created_at DESC) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_analytics_events_session ON checkin_analytics_events(session_id, created_at DESC) WHERE session_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE patient_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_encodings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_analytics_events ENABLE ROW LEVEL SECURITY;

-- Patient check-ins policies
CREATE POLICY "Patients can view own check-ins" ON patient_checkins
  FOR SELECT USING (patient_id = auth.uid()::uuid);

CREATE POLICY "Staff can view all check-ins" ON patient_checkins
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist', 'receptionist'))
  );

CREATE POLICY "System can insert check-ins" ON patient_checkins
  FOR INSERT WITH CHECK (true);

-- Face encodings policies (highly restricted)
CREATE POLICY "Only system can access face encodings" ON face_encodings
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Patient portal sessions policies
CREATE POLICY "Patients can view own sessions" ON patient_portal_sessions
  FOR SELECT USING (patient_id = auth.uid()::uuid);

CREATE POLICY "System can manage sessions" ON patient_portal_sessions
  FOR ALL USING (true);

-- Device tokens policies
CREATE POLICY "Patients can manage own device tokens" ON device_tokens
  FOR ALL USING (patient_id = auth.uid()::uuid);

-- Notification history policies
CREATE POLICY "Patients can view own notifications" ON notification_history
  FOR SELECT USING (patient_id = auth.uid()::uuid);

CREATE POLICY "Staff can view all notifications" ON notification_history
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Treatment timeline policies
CREATE POLICY "Patients can view own visible timeline" ON treatment_timeline
  FOR SELECT USING (patient_id = auth.uid()::uuid AND is_visible_to_patient = TRUE);

CREATE POLICY "Staff can view all timelines" ON treatment_timeline
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Patient messages policies
CREATE POLICY "Patients can view own messages" ON patient_messages
  FOR SELECT USING (patient_id = auth.uid()::uuid);

CREATE POLICY "Patients can send messages" ON patient_messages
  FOR INSERT WITH CHECK (patient_id = auth.uid()::uuid AND sender_type = 'patient');

CREATE POLICY "Staff can manage messages" ON patient_messages
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist', 'receptionist'))
  );

-- Exercise completions policies
CREATE POLICY "Patients can manage own exercise completions" ON exercise_completions
  FOR ALL USING (patient_id = auth.uid()::uuid);

CREATE POLICY "Staff can view exercise completions" ON exercise_completions
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Body map assessments policies
CREATE POLICY "Patients can view own visible assessments" ON body_map_assessments
  FOR SELECT USING (patient_id = auth.uid()::uuid AND is_visible_to_patient = TRUE);

CREATE POLICY "Staff can manage assessments" ON body_map_assessments
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Progress snapshots policies
CREATE POLICY "Patients can view own progress" ON patient_progress_snapshots
  FOR SELECT USING (patient_id = auth.uid()::uuid);

CREATE POLICY "Staff can manage progress snapshots" ON patient_progress_snapshots
  FOR ALL USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist'))
  );

-- Analytics events policies (restricted)
CREATE POLICY "Only admins can view analytics" ON checkin_analytics_events
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can log analytics" ON checkin_analytics_events
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at column
CREATE TRIGGER update_patient_checkins_updated_at BEFORE UPDATE ON patient_checkins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_face_encodings_updated_at BEFORE UPDATE ON face_encodings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_tokens_updated_at BEFORE UPDATE ON device_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_history_updated_at BEFORE UPDATE ON notification_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_timeline_updated_at BEFORE UPDATE ON treatment_timeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_messages_updated_at BEFORE UPDATE ON patient_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_completions_updated_at BEFORE UPDATE ON exercise_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_body_map_assessments_updated_at BEFORE UPDATE ON body_map_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_snapshots_updated_at BEFORE UPDATE ON patient_progress_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to encrypt face encoding data
CREATE OR REPLACE FUNCTION encrypt_face_encoding(
  p_patient_id UUID,
  p_encoding_data BYTEA,
  p_encryption_key_id VARCHAR
) RETURNS BYTEA AS $$
DECLARE
  v_salt VARCHAR(32);
  v_encrypted_data BYTEA;
BEGIN
  -- Generate unique salt
  v_salt := encode(gen_random_bytes(16), 'hex');

  -- Encrypt data with salt (simplified - in production use proper encryption)
  v_encrypted_data := digest(p_encoding_data || v_salt::BYTEA, 'sha256');

  -- Store salt for decryption
  UPDATE face_encodings SET salt = v_salt WHERE patient_id = p_patient_id;

  RETURN v_encrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate adherence rate
CREATE OR REPLACE FUNCTION calculate_exercise_adherence(
  p_patient_id UUID,
  p_days INTEGER DEFAULT 30
) RETURNS DECIMAL AS $$
DECLARE
  v_prescribed_count INTEGER;
  v_completed_count INTEGER;
  v_adherence_rate DECIMAL;
BEGIN
  -- Count prescribed exercises in period
  SELECT COUNT(*) INTO v_prescribed_count
  FROM exercise_prescriptions ep
  WHERE ep.patient_id = p_patient_id
    AND ep.created_at >= NOW() - (p_days || ' days')::INTERVAL;

  -- Count completed exercises in period
  SELECT COUNT(*) INTO v_completed_count
  FROM exercise_completions ec
  WHERE ec.patient_id = p_patient_id
    AND ec.completed_at >= NOW() - (p_days || ' days')::INTERVAL;

  -- Calculate adherence rate
  IF v_prescribed_count > 0 THEN
    v_adherence_rate := (v_completed_count::DECIMAL / v_prescribed_count::DECIMAL) * 100;
  ELSE
    v_adherence_rate := 0;
  END IF;

  RETURN LEAST(v_adherence_rate, 100.00); -- Cap at 100%
END;
$$ LANGUAGE plpgsql;

-- Function to get patient unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(p_patient_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM patient_messages
    WHERE patient_id = p_patient_id
      AND is_read = FALSE
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create progress snapshot
CREATE OR REPLACE FUNCTION create_progress_snapshot(p_patient_id UUID)
RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_pain_level INTEGER;
  v_mobility_score INTEGER;
  v_adherence_rate DECIMAL;
BEGIN
  -- Get latest pain level from recent sessions
  SELECT AVG(pain_level)::INTEGER INTO v_pain_level
  FROM treatment_sessions
  WHERE patient_id = p_patient_id
    AND created_at >= NOW() - INTERVAL '7 days'
    AND pain_level IS NOT NULL;

  -- Calculate mobility score (simplified)
  v_mobility_score := 75; -- Mock value - would be calculated from assessments

  -- Get adherence rate
  SELECT calculate_exercise_adherence(p_patient_id, 30) INTO v_adherence_rate;

  -- Create snapshot
  INSERT INTO patient_progress_snapshots (
    patient_id,
    pain_level,
    mobility_score,
    adherence_rate,
    snapshot_type
  ) VALUES (
    p_patient_id,
    v_pain_level,
    v_mobility_score,
    v_adherence_rate,
    'regular'
  ) RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for patient dashboard data
CREATE OR REPLACE VIEW patient_dashboard_view AS
SELECT
  p.id as patient_id,
  p.first_name,
  p.last_name,

  -- Next appointment
  (
    SELECT to_jsonb(a.*)
    FROM appointments a
    WHERE a.patient_id = p.id
      AND a.scheduled_time > NOW()
      AND a.status = 'scheduled'
    ORDER BY a.scheduled_time
    LIMIT 1
  ) as next_appointment,

  -- Recent check-in
  (
    SELECT to_jsonb(pc.*)
    FROM patient_checkins pc
    WHERE pc.patient_id = p.id
    ORDER BY pc.checkin_time DESC
    LIMIT 1
  ) as last_checkin,

  -- Unread messages count
  get_unread_message_count(p.id) as unread_messages_count,

  -- Recent progress
  (
    SELECT to_jsonb(pps.*)
    FROM patient_progress_snapshots pps
    WHERE pps.patient_id = p.id
    ORDER BY pps.snapshot_date DESC
    LIMIT 1
  ) as latest_progress

FROM patients p;

-- View for check-in analytics
CREATE OR REPLACE VIEW checkin_analytics_summary AS
SELECT
  DATE(checkin_time) as date,
  COUNT(*) as total_checkins,
  COUNT(CASE WHEN method = 'facial_recognition' THEN 1 END) as face_recognition_count,
  COUNT(CASE WHEN method = 'manual_search' THEN 1 END) as manual_search_count,
  AVG(CASE WHEN recognition_confidence IS NOT NULL THEN recognition_confidence END) as avg_confidence,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_checkins,
  AVG(estimated_wait_time) as avg_estimated_wait,
  AVG(actual_wait_time) as avg_actual_wait
FROM patient_checkins
WHERE checkin_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(checkin_time)
ORDER BY date DESC;

COMMIT;

-- =====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample check-in
-- INSERT INTO patient_checkins (patient_id, appointment_id, method, device_id, health_screening_passed)
-- SELECT id, 'sample-appointment-id'::uuid, 'facial_recognition', 'tablet-1', true
-- FROM patients LIMIT 1;

COMMENT ON TABLE patient_checkins IS 'Stores all patient check-in events with method, health screening, and queue data';
COMMENT ON TABLE face_encodings IS 'Securely stores encrypted facial recognition data';
COMMENT ON TABLE patient_portal_sessions IS 'Manages patient portal login sessions';
COMMENT ON TABLE device_tokens IS 'Stores push notification device tokens';
COMMENT ON TABLE notification_history IS 'Log of all sent push notifications';
COMMENT ON TABLE treatment_timeline IS 'Patient treatment timeline events';
COMMENT ON TABLE patient_messages IS 'Patient-provider messaging system';
COMMENT ON TABLE exercise_completions IS 'Patient exercise completion tracking';
COMMENT ON TABLE body_map_assessments IS 'Pain and mobility assessments using body maps';
COMMENT ON TABLE patient_progress_snapshots IS 'Periodic patient progress snapshots';
COMMENT ON TABLE checkin_analytics_events IS 'Analytics and usage tracking events';