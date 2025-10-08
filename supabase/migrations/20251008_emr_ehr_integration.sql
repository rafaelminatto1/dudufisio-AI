-- =====================================================
-- MIGRATION: EMR/EHR Integration System
-- Data: 2025-10-08
-- Descrição: Sistema de Integração com EMR/EHR (HL7 FHIR)
-- =====================================================

-- Enum para tipos de sistema externo
CREATE TYPE emr_system_type AS ENUM (
  'fhir_r4',
  'hl7_v2',
  'custom_api',
  'csv_import',
  'manual_entry'
);

-- Enum para status de sincronização
CREATE TYPE sync_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'partial'
);

-- =====================================================
-- TABELA: external_systems
-- Sistemas externos conectados
-- =====================================================
CREATE TABLE IF NOT EXISTS external_systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  system_name TEXT NOT NULL UNIQUE,
  system_type emr_system_type NOT NULL,
  
  base_url TEXT,
  api_endpoint TEXT,
  
  -- Autenticação
  auth_type TEXT NOT NULL CHECK (auth_type IN ('api_key', 'oauth2', 'basic_auth', 'bearer_token')),
  credentials_encrypted TEXT, -- Encrypted JSON
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Configuração
  sync_frequency TEXT CHECK (sync_frequency IN ('manual', 'hourly', 'daily', 'weekly')),
  data_mapping JSONB NOT NULL, -- Mapeamento de campos
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_external_systems_active ON external_systems(is_active);

-- =====================================================
-- TABELA: data_imports
-- Histórico de importações
-- =====================================================
CREATE TABLE IF NOT EXISTS data_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_system_id UUID REFERENCES external_systems(id) ON DELETE SET NULL,
  
  import_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  import_type TEXT NOT NULL CHECK (import_type IN ('full', 'incremental', 'manual')),
  
  data_type TEXT NOT NULL CHECK (data_type IN ('patients', 'appointments', 'treatments', 'lab_results', 'imaging', 'medications', 'vitals')),
  
  records_total INTEGER NOT NULL,
  records_imported INTEGER NOT NULL,
  records_failed INTEGER NOT NULL,
  records_skipped INTEGER NOT NULL,
  
  status sync_status NOT NULL,
  
  -- Dados
  source_file_url TEXT,
  error_log JSONB,
  
  duration_seconds INTEGER,
  
  imported_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_imports_system ON data_imports(external_system_id);
CREATE INDEX idx_data_imports_date ON data_imports(import_date DESC);
CREATE INDEX idx_data_imports_status ON data_imports(status);

-- =====================================================
-- TABELA: data_exports
-- Histórico de exportações
-- =====================================================
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_system_id UUID REFERENCES external_systems(id) ON DELETE SET NULL,
  
  export_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'incremental', 'filtered')),
  
  data_type TEXT NOT NULL,
  
  records_total INTEGER NOT NULL,
  records_exported INTEGER NOT NULL,
  records_failed INTEGER NOT NULL,
  
  status sync_status NOT NULL,
  
  -- Formato
  format TEXT NOT NULL CHECK (format IN ('fhir_json', 'hl7_v2', 'csv', 'xml', 'custom_json')),
  export_file_url TEXT,
  
  filter_criteria JSONB,
  
  duration_seconds INTEGER,
  
  exported_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_exports_system ON data_exports(external_system_id);
CREATE INDEX idx_data_exports_date ON data_exports(export_date DESC);

-- =====================================================
-- TABELA: field_mappings
-- Mapeamento de campos entre sistemas
-- =====================================================
CREATE TABLE IF NOT EXISTS field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_system_id UUID NOT NULL REFERENCES external_systems(id) ON DELETE CASCADE,
  
  source_field TEXT NOT NULL,
  source_type TEXT NOT NULL,
  
  target_table TEXT NOT NULL,
  target_field TEXT NOT NULL,
  target_type TEXT NOT NULL,
  
  transformation_rule TEXT, -- SQL ou JS function
  default_value TEXT,
  
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_rule TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_field_mapping UNIQUE (external_system_id, source_field, target_table, target_field)
);

CREATE INDEX idx_field_mappings_system ON field_mappings(external_system_id);

-- =====================================================
-- TABELA: sync_logs
-- Logs detalhados de sincronização
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID REFERENCES data_imports(id) ON DELETE CASCADE,
  export_id UUID REFERENCES data_exports(id) ON DELETE CASCADE,
  
  log_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  message TEXT NOT NULL,
  details JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_import ON sync_logs(import_id);
CREATE INDEX idx_sync_logs_export ON sync_logs(export_id);
CREATE INDEX idx_sync_logs_level ON sync_logs(log_level);
CREATE INDEX idx_sync_logs_timestamp ON sync_logs(log_timestamp DESC);

-- =====================================================
-- TABELA: fhir_resources
-- Cache de recursos FHIR
-- =====================================================
CREATE TABLE IF NOT EXISTS fhir_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  
  fhir_version TEXT NOT NULL DEFAULT 'R4',
  
  resource_data JSONB NOT NULL,
  
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_fhir_resource UNIQUE (resource_type, resource_id)
);

CREATE INDEX idx_fhir_resources_type ON fhir_resources(resource_type);
CREATE INDEX idx_fhir_resources_patient ON fhir_resources(patient_id);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Recent successful syncs
CREATE OR REPLACE VIEW recent_successful_syncs AS
SELECT 
  es.system_name,
  di.import_date,
  di.data_type,
  di.records_imported,
  di.duration_seconds
FROM data_imports di
INNER JOIN external_systems es ON di.external_system_id = es.id
WHERE di.status = 'completed'
ORDER BY di.import_date DESC
LIMIT 50;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE external_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage integrations"
  ON external_systems FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE external_systems IS 'Sistemas EMR/EHR externos conectados';
COMMENT ON TABLE data_imports IS 'Histórico de importações de dados';
COMMENT ON TABLE data_exports IS 'Histórico de exportações de dados';
COMMENT ON TABLE field_mappings IS 'Mapeamento de campos entre sistemas';
COMMENT ON TABLE fhir_resources IS 'Cache de recursos FHIR (HL7)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


