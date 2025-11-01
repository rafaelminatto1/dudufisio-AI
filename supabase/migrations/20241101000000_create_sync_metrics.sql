/**
 * Migração: Criar tabela sync_metrics
 * 
 * Armazena métricas de sincronização offline.
 */

-- Criar tabela sync_metrics
CREATE TABLE IF NOT EXISTS sync_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_syncs INT DEFAULT 0,
  successful_syncs INT DEFAULT 0,
  failed_syncs INT DEFAULT 0,
  average_sync_time FLOAT DEFAULT 0,
  metrics_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sync_metrics_date ON sync_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_sync_metrics_created_at ON sync_metrics(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE sync_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem ver tudo
CREATE POLICY "Admins can view all sync metrics"
  ON sync_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Sistema pode inserir
CREATE POLICY "System can insert sync metrics"
  ON sync_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_sync_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_metrics_updated_at
  BEFORE UPDATE ON sync_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_metrics_updated_at();

-- Comentários
COMMENT ON TABLE sync_metrics IS 'Métricas de sincronização offline do sistema';
COMMENT ON COLUMN sync_metrics.date IS 'Data das métricas agregadas';
COMMENT ON COLUMN sync_metrics.metrics_data IS 'Dados detalhados em JSON (itemsByType, successRate, etc)';

