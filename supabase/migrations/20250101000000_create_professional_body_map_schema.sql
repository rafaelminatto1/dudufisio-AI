-- Professional Body Map Schema Migration
-- Implements enterprise-grade body mapping system
-- Author: DuduFisio-AI Engineering Team
-- Version: 2.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types for better data integrity
CREATE TYPE pain_type AS ENUM ('acute', 'chronic', 'intermittent', 'constant');
CREATE TYPE body_region AS ENUM (
  'cervical', 'thoracic', 'lumbar', 'sacral',
  'shoulder', 'elbow', 'wrist', 'hip',
  'knee', 'ankle', 'head', 'other'
);
CREATE TYPE body_side AS ENUM ('front', 'back');

-- Professional body_points table with comprehensive constraints
CREATE TABLE body_points (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Patient relationship
  patient_id UUID NOT NULL,

  -- Spatial coordinates (normalized 0-1 for responsiveness)
  coordinates JSONB NOT NULL CHECK (
    (coordinates->>'x')::float >= 0 AND (coordinates->>'x')::float <= 1 AND
    (coordinates->>'y')::float >= 0 AND (coordinates->>'y')::float <= 1
  ),

  -- Body mapping attributes
  body_side body_side NOT NULL,
  body_region body_region NOT NULL,

  -- Pain characteristics
  pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  pain_type pain_type NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 1000),
  symptoms TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(symptoms, 1) > 0),

  -- Session linking for treatment tracking
  session_id UUID,

  -- Metadata for extensibility and analytics
  metadata JSONB DEFAULT '{}',

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL,

  -- Soft delete support
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,

  -- Version control for conflict resolution
  version INTEGER DEFAULT 1 NOT NULL
);

-- Add comprehensive comments for documentation
COMMENT ON TABLE body_points IS 'Professional body mapping system for pain tracking and analysis';
COMMENT ON COLUMN body_points.coordinates IS 'Normalized coordinates (0-1) for responsive positioning';
COMMENT ON COLUMN body_points.metadata IS 'Extensible JSON field for custom attributes and analytics';
COMMENT ON COLUMN body_points.version IS 'Version counter for optimistic locking and conflict resolution';

-- Create optimized indexes for performance
CREATE INDEX idx_body_points_patient_date
  ON body_points(patient_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_body_points_session
  ON body_points(session_id, created_at DESC)
  WHERE session_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_body_points_pain_level
  ON body_points(pain_level, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_body_points_region_side
  ON body_points(body_region, body_side)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_body_points_pain_type
  ON body_points(pain_type, created_at DESC)
  WHERE deleted_at IS NULL;

-- GIN index for symptoms array and metadata JSONB
CREATE INDEX idx_body_points_symptoms
  ON body_points USING GIN(symptoms)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_body_points_metadata
  ON body_points USING GIN(metadata)
  WHERE deleted_at IS NULL;

-- Full-text search index for descriptions
CREATE INDEX idx_body_points_description_fts
  ON body_points USING GIN(to_tsvector('portuguese', description))
  WHERE deleted_at IS NULL;

-- Coordinates spatial index for region-based queries
CREATE INDEX idx_body_points_coordinates
  ON body_points USING GIN(coordinates)
  WHERE deleted_at IS NULL;

-- Analytics materialized view for performance
CREATE MATERIALIZED VIEW body_points_analytics AS
SELECT
  patient_id,
  body_region,
  body_side,
  pain_type,
  DATE_TRUNC('day', created_at) as date,

  -- Pain statistics
  COUNT(*) as point_count,
  AVG(pain_level)::NUMERIC(3,1) as avg_pain_level,
  MAX(pain_level) as max_pain_level,
  MIN(pain_level) as min_pain_level,
  STDDEV(pain_level)::NUMERIC(3,1) as pain_std_dev,

  -- Symptom analysis
  array_agg(DISTINCT unnest(symptoms)) as all_symptoms,
  array_length(array_agg(DISTINCT unnest(symptoms)), 1) as unique_symptoms_count,

  -- Temporal metrics
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence,
  MAX(created_at) - MIN(created_at) as duration,

  -- Metadata aggregation
  jsonb_agg(metadata) as aggregated_metadata

FROM body_points
WHERE deleted_at IS NULL
GROUP BY patient_id, body_region, body_side, pain_type, DATE_TRUNC('day', created_at);

-- Index for analytics view
CREATE UNIQUE INDEX idx_body_points_analytics_unique
  ON body_points_analytics(patient_id, body_region, body_side, pain_type, date);

CREATE INDEX idx_body_points_analytics_patient_date
  ON body_points_analytics(patient_id, date DESC);

-- Triggers for automatic maintenance

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_body_points_updated_at
  BEFORE UPDATE ON body_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics refresh trigger
CREATE OR REPLACE FUNCTION refresh_body_points_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh analytics view asynchronously for better performance
  PERFORM pg_notify('refresh_analytics', 'body_points');
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_refresh_body_points_analytics
  AFTER INSERT OR UPDATE OR DELETE ON body_points
  FOR EACH ROW EXECUTE FUNCTION refresh_body_points_analytics();

-- Data validation trigger
CREATE OR REPLACE FUNCTION validate_body_point_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate coordinate range
  IF (NEW.coordinates->>'x')::float NOT BETWEEN 0 AND 1 OR
     (NEW.coordinates->>'y')::float NOT BETWEEN 0 AND 1 THEN
    RAISE EXCEPTION 'Coordinates must be between 0 and 1';
  END IF;

  -- Validate pain level
  IF NEW.pain_level NOT BETWEEN 0 AND 10 THEN
    RAISE EXCEPTION 'Pain level must be between 0 and 10';
  END IF;

  -- Validate symptoms array is not empty
  IF array_length(NEW.symptoms, 1) IS NULL OR array_length(NEW.symptoms, 1) = 0 THEN
    RAISE EXCEPTION 'At least one symptom must be specified';
  END IF;

  -- Validate description length
  IF LENGTH(NEW.description) = 0 OR LENGTH(NEW.description) > 1000 THEN
    RAISE EXCEPTION 'Description must be between 1 and 1000 characters';
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_validate_body_point_data
  BEFORE INSERT OR UPDATE ON body_points
  FOR EACH ROW EXECUTE FUNCTION validate_body_point_data();

-- Row Level Security (RLS) for multi-tenant support
ALTER TABLE body_points ENABLE ROW LEVEL SECURITY;

-- Policy for users to access only their patients' data
CREATE POLICY body_points_patient_access ON body_points
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE created_by = auth.uid() OR assigned_therapist = auth.uid()
    )
  );

-- Policy for system administrators
CREATE POLICY body_points_admin_access ON body_points
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Utility functions for common operations

-- Function to get pain evolution for a patient
CREATE OR REPLACE FUNCTION get_pain_evolution(
  p_patient_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  avg_pain_level NUMERIC,
  max_pain_level INTEGER,
  min_pain_level INTEGER,
  point_count BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    DATE_TRUNC('day', created_at)::DATE as date,
    AVG(pain_level)::NUMERIC(3,1) as avg_pain_level,
    MAX(pain_level) as max_pain_level,
    MIN(pain_level) as min_pain_level,
    COUNT(*) as point_count
  FROM body_points
  WHERE
    patient_id = p_patient_id
    AND created_at >= NOW() - (p_days_back || ' days')::INTERVAL
    AND deleted_at IS NULL
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY date;
$$;

-- Function to get region pain distribution
CREATE OR REPLACE FUNCTION get_region_pain_distribution(
  p_patient_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  body_region body_region,
  body_side body_side,
  point_count BIGINT,
  avg_pain_level NUMERIC,
  most_common_symptoms TEXT[]
)
LANGUAGE sql STABLE
AS $$
  SELECT
    bp.body_region,
    bp.body_side,
    COUNT(*) as point_count,
    AVG(bp.pain_level)::NUMERIC(3,1) as avg_pain_level,
    array_agg(DISTINCT unnest(bp.symptoms) ORDER BY unnest(bp.symptoms)) as most_common_symptoms
  FROM body_points bp
  WHERE
    bp.patient_id = p_patient_id
    AND bp.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
    AND bp.deleted_at IS NULL
  GROUP BY bp.body_region, bp.body_side
  ORDER BY point_count DESC, avg_pain_level DESC;
$$;

-- Function to soft delete with audit trail
CREATE OR REPLACE FUNCTION soft_delete_body_point(
  p_point_id UUID,
  p_deleted_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE body_points
  SET
    deleted_at = NOW(),
    deleted_by = p_deleted_by,
    updated_at = NOW()
  WHERE id = p_point_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;

-- Function to restore soft deleted point
CREATE OR REPLACE FUNCTION restore_body_point(
  p_point_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE body_points
  SET
    deleted_at = NULL,
    deleted_by = NULL,
    updated_at = NOW()
  WHERE id = p_point_id AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$;

-- Performance monitoring view
CREATE VIEW body_points_performance_stats AS
SELECT
  'body_points' as table_name,
  (SELECT count(*) FROM body_points WHERE deleted_at IS NULL) as active_records,
  (SELECT count(*) FROM body_points WHERE deleted_at IS NOT NULL) as deleted_records,
  (SELECT count(*) FROM body_points WHERE created_at >= NOW() - interval '24 hours') as records_last_24h,
  (SELECT count(*) FROM body_points WHERE created_at >= NOW() - interval '7 days') as records_last_7d,
  (SELECT avg(pain_level) FROM body_points WHERE deleted_at IS NULL) as avg_pain_level,
  pg_size_pretty(pg_total_relation_size('body_points')) as table_size;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON body_points TO authenticated;
GRANT SELECT ON body_points_analytics TO authenticated;
GRANT SELECT ON body_points_performance_stats TO authenticated;

-- Grant execution permissions on utility functions
GRANT EXECUTE ON FUNCTION get_pain_evolution(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_region_pain_distribution(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_body_point(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_body_point(UUID) TO authenticated;

-- Insert audit log entry
INSERT INTO audit_logs (
  table_name,
  action,
  description,
  performed_by
) VALUES (
  'body_points',
  'CREATE_TABLE',
  'Created professional body mapping schema with analytics and performance optimizations',
  'system'
);

-- Create index for future partitioning (monthly partitions)
CREATE INDEX idx_body_points_created_month
  ON body_points(DATE_TRUNC('month', created_at))
  WHERE deleted_at IS NULL;

-- Comment for future maintenance
COMMENT ON INDEX idx_body_points_created_month IS 'Prepared for monthly partitioning strategy for large datasets';