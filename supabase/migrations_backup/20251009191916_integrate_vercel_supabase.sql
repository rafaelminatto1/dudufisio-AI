-- ============================================================================
-- MIGRATION: Documentação da Integração Vercel + Supabase
-- Data: 09 de Outubro de 2025
-- Descrição: Metadata e configurações para integração entre Vercel e Supabase
-- ============================================================================

-- Tabela para armazenar metadata de integração
CREATE TABLE IF NOT EXISTS integration_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_name VARCHAR(50) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  project_id VARCHAR(255),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir metadata da integração Vercel-Supabase
INSERT INTO integration_metadata (integration_name, platform, project_id, config, status) VALUES
('Vercel Deployment', 'vercel', 'prj_lJT0yis7pFVJASeoHaykO6A1U7kz', 
  jsonb_build_object(
    'projectName', 'dudufisio-ai',
    'teamId', 'team_RWPxV6A0gp02a6FO7Ghf2YSV',
    'region', 'iad1',
    'framework', 'vite',
    'buildCommand', 'npm run build',
    'outputDirectory', 'dist',
    'installCommand', 'npm install --legacy-peer-deps',
    'devCommand', 'npm run dev',
    'environmentVariables', jsonb_build_object(
      'NEXT_PUBLIC_SUPABASE_URL', 'https://urfxniitfbbvsaskicfo.supabase.co',
      'note', 'NEXT_PUBLIC_SUPABASE_ANON_KEY deve ser configurada no Vercel Dashboard'
    )
  ), 
'active'),

('Supabase Backend', 'supabase', 'urfxniitfbbvsaskicfo',
  jsonb_build_object(
    'projectName', 'dudufisio-AI',
    'region', 'sa-east-1',
    'database', 'PostgreSQL 17',
    'features', jsonb_build_array('Database', 'Auth', 'Storage', 'Realtime', 'Edge Functions'),
    'customDomain', 'To be configured',
    'apiUrl', 'https://urfxniitfbbvsaskicfo.supabase.co'
  ),
'active')
ON CONFLICT DO NOTHING;

-- Comentários explicativos
COMMENT ON TABLE integration_metadata IS 'Armazena metadata de integrações externas (Vercel, Supabase, etc)';
COMMENT ON COLUMN integration_metadata.config IS 'Configuração em JSONB para flexibilidade';

-- View para ver integrações ativas
CREATE OR REPLACE VIEW active_integrations AS
SELECT 
  integration_name,
  platform,
  project_id,
  config,
  status,
  created_at
FROM integration_metadata
WHERE status = 'active'
ORDER BY platform, integration_name;


