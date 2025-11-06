-- =====================================================
-- POPULATE CLINICAL MATERIALS
-- Migration: 20250205000000_populate_clinical_materials.sql
-- =====================================================
-- Popula a biblioteca com materiais clínicos iniciais
-- e cria tabela de favoritos se não existir

-- =====================================================
-- VERIFICAR E CRIAR TABELAS SE NECESSÁRIO
-- =====================================================

-- Criar tabela principal se não existir (fallback)
CREATE TABLE IF NOT EXISTS clinical_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category_id UUID,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  collaborators UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  edit_count INTEGER DEFAULT 0,
  file_url TEXT,
  file_type TEXT,
  is_fillable BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de categorias se não existir
CREATE TABLE IF NOT EXISTS clinical_material_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA DE FAVORITOS
-- =====================================================

-- Criar tabela de favoritos (se não existir)
CREATE TABLE IF NOT EXISTS material_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_material_favorites_user ON material_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_material_favorites_material ON material_favorites(material_id);

-- RLS para favoritos
ALTER TABLE material_favorites ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (para evitar erro de duplicação)
DROP POLICY IF EXISTS "Users can view own favorites" ON material_favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON material_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON material_favorites;

-- Policy: usuário só vê próprios favoritos
CREATE POLICY "Users can view own favorites" ON material_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own favorites" ON material_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites" ON material_favorites
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- FUNÇÃO RPC PARA INCREMENTAR DOWNLOADS
-- =====================================================

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION increment_material_download(p_material_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE clinical_materials
  SET 
    download_count = COALESCE(download_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POPULAR MATERIAIS INICIAIS
-- =====================================================

-- Buscar ID da primeira categoria para usar como padrão
DO $$
DECLARE
  default_category_id UUID;
BEGIN
  SELECT id INTO default_category_id 
  FROM clinical_material_categories 
  WHERE name = 'Avaliação e Diagnóstico' 
  LIMIT 1;

  -- Se não encontrar categoria, usar NULL (será necessário ajustar manualmente)
  IF default_category_id IS NULL THEN
    default_category_id := gen_random_uuid();
  END IF;

  -- Inserir materiais iniciais
  INSERT INTO clinical_materials (
    name, 
    description, 
    type, 
    category_id, 
    content,
    tags, 
    status,
    file_url,
    file_type,
    is_fillable,
    download_count,
    published_at
  ) VALUES
  -- ESCALAS VALIDADAS
  (
    'Escala Visual Analógica de Dor (EVA)',
    'Escala validada internacionalmente para mensuração da intensidade da dor do paciente. Ferramenta simples e eficaz para acompanhamento da evolução álgica.',
    'validated_scales',
    default_category_id,
    'A Escala Visual Analógica (EVA) é um instrumento amplamente utilizado para avaliar a intensidade da dor.',
    ARRAY['dor', 'avaliação', 'validada', 'eva', 'pain'],
    'published',
    'https://via.placeholder.com/800x600/10b981/ffffff?text=Escala+EVA',
    'pdf',
    true,
    127,
    NOW()
  ),
  (
    'Escala de Borg',
    'Escala para avaliação do esforço percebido durante exercícios. Essencial para prescrição e monitoramento de atividade física.',
    'validated_scales',
    default_category_id,
    'A Escala de Borg permite quantificar a percepção subjetiva do esforço.',
    ARRAY['esforço', 'exercício', 'validada', 'cardio', 'borg'],
    'published',
    'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Escala+de+Borg',
    'pdf',
    true,
    98,
    NOW()
  ),
  (
    'Índice de Incapacidade de Oswestry',
    'Questionário específico para avaliação de incapacidade funcional relacionada à dor lombar. Padrão-ouro para lombalgia.',
    'validated_scales',
    default_category_id,
    'O Índice de Oswestry é o instrumento mais utilizado mundialmente para avaliar incapacidade lombar.',
    ARRAY['lombar', 'coluna', 'incapacidade', 'oswestry', 'validada'],
    'published',
    'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Oswestry',
    'pdf',
    true,
    156,
    NOW()
  ),
  (
    'Índice de Barthel',
    'Escala de avaliação de atividades básicas de vida diária (AVDs). Utilizada em reabilitação neurológica e geriátrica.',
    'validated_scales',
    default_category_id,
    'O Índice de Barthel avalia independência funcional em 10 atividades básicas.',
    ARRAY['avd', 'funcional', 'neurologia', 'barthel', 'validada'],
    'published',
    'https://via.placeholder.com/800x600/8b5cf6/ffffff?text=Barthel',
    'pdf',
    true,
    89,
    NOW()
  ),
  (
    'Medida de Independência Funcional (MIF)',
    'Instrumento de avaliação funcional completo, amplamente utilizado em reabilitação. Avalia 18 atividades.',
    'validated_scales',
    default_category_id,
    'A MIF é um dos instrumentos mais completos para avaliação funcional em reabilitação.',
    ARRAY['mif', 'funcional', 'reabilitação', 'validada'],
    'published',
    'https://via.placeholder.com/800x600/ef4444/ffffff?text=MIF',
    'pdf',
    true,
    134,
    NOW()
  ),
  (
    'Escala Modificada de Ashworth',
    'Escala para avaliação do grau de espasticidade muscular. Essencial em neurologia.',
    'validated_scales',
    default_category_id,
    'A Escala de Ashworth Modificada é o padrão para avaliar espasticidade.',
    ARRAY['espasticidade', 'neurologia', 'ashworth', 'validada'],
    'published',
    'https://via.placeholder.com/800x600/06b6d4/ffffff?text=Ashworth',
    'pdf',
    true,
    67,
    NOW()
  ),

  -- MAPAS DE DOR
  (
    'Mapa de Dor Corporal Completo',
    'Diagrama anatômico completo do corpo humano (anterior e posterior) para marcação de regiões dolorosas. Essencial para avaliação inicial.',
    'pain_maps',
    default_category_id,
    'Utilize este diagrama para que o paciente marque as áreas de dor.',
    ARRAY['dor', 'avaliação', 'diagrama', 'pain map'],
    'published',
    'https://via.placeholder.com/800x600/10b981/ffffff?text=Mapa+Corporal',
    'pdf',
    true,
    243,
    NOW()
  ),
  (
    'Mapa de Dor da Coluna Vertebral',
    'Diagrama específico da coluna vertebral com segmentos vertebrais identificados. Ideal para casos ortopédicos.',
    'pain_maps',
    default_category_id,
    'Diagrama detalhado da coluna para localização precisa da dor.',
    ARRAY['dor', 'coluna', 'lombar', 'cervical', 'diagrama'],
    'published',
    'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Coluna+Vertebral',
    'pdf',
    true,
    187,
    NOW()
  ),

  -- FICHAS DE AVALIAÇÃO
  (
    'Ficha de Avaliação Traumato-Ortopédica',
    'Ficha completa para avaliação inicial de pacientes ortopédicos. Inclui anamnese, inspeção, palpação, testes especiais e conduta.',
    'assessment_forms',
    default_category_id,
    'Avaliação completa traumato-ortopédica com todos os campos necessários.',
    ARRAY['avaliação', 'ortopedia', 'inicial', 'ficha'],
    'published',
    'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Avaliação+Ortopédica',
    'pdf',
    true,
    312,
    NOW()
  ),
  (
    'Ficha de Avaliação Neurológica',
    'Protocolo de avaliação neurológica abrangente. Inclui nível de consciência, tônus, reflexos, coordenação e marcha.',
    'assessment_forms',
    default_category_id,
    'Avaliação neurológica completa seguindo protocolos internacionais.',
    ARRAY['avaliação', 'neurologia', 'inicial', 'neuro'],
    'published',
    'https://via.placeholder.com/800x600/8b5cf6/ffffff?text=Avaliação+Neuro',
    'pdf',
    true,
    198,
    NOW()
  ),
  (
    'Ficha de Avaliação Respiratória',
    'Avaliação completa do sistema respiratório. Inclui ausculta, expansibilidade, padrão respiratório e testes funcionais.',
    'assessment_forms',
    default_category_id,
    'Protocolo de avaliação respiratória com campos específicos.',
    ARRAY['avaliação', 'respiratória', 'pulmão', 'fisio respiratória'],
    'published',
    'https://via.placeholder.com/800x600/ef4444/ffffff?text=Avaliação+Respiratória',
    'pdf',
    true,
    145,
    NOW()
  ),

  -- ANAMNESE
  (
    'Formulário de Anamnese Geral',
    'Formulário completo para coleta de histórico do paciente. Inclui dados pessoais, queixa principal, HDA, antecedentes e hábitos de vida.',
    'anamnesis',
    default_category_id,
    'Anamnese completa para primeira consulta fisioterapêutica.',
    ARRAY['anamnese', 'histórico', 'inicial', 'primeira consulta'],
    'published',
    'https://via.placeholder.com/800x600/06b6d4/ffffff?text=Anamnese',
    'pdf',
    true,
    267,
    NOW()
  ),

  -- FOLLOW-UP
  (
    'Ficha de Follow-up com Mapa da Dor',
    'Combinação de acompanhamento evolutivo com mapa de dor integrado. Ideal para sessões de retorno.',
    'follow_up',
    default_category_id,
    'Ficha de retorno que permite comparar evolução da dor visualmente.',
    ARRAY['follow-up', 'evolução', 'dor', 'retorno'],
    'published',
    'https://via.placeholder.com/800x600/10b981/ffffff?text=Follow-up',
    'pdf',
    true,
    223,
    NOW()
  ),

  -- PLANO DE TRATAMENTO
  (
    'Template de Plano de Tratamento',
    'Modelo estruturado para apresentação do plano terapêutico ao paciente. Inclui objetivos, conduta e prognóstico.',
    'treatment_plan',
    default_category_id,
    'Template profissional para documentar e apresentar o plano de tratamento.',
    ARRAY['plano', 'tratamento', 'objetivos', 'conduta'],
    'published',
    'https://via.placeholder.com/800x600/f59e0b/ffffff?text=Plano+Tratamento',
    'pdf',
    true,
    178,
    NOW()
  ),

  -- EDUCAÇÃO DO PACIENTE
  (
    'Orientações para Ergonomia no Trabalho',
    'Material educativo ilustrado sobre postura e ergonomia no ambiente de trabalho. Linguagem acessível ao paciente.',
    'patient_education',
    default_category_id,
    'Guia educativo para prevenção de dores relacionadas ao trabalho.',
    ARRAY['educação', 'ergonomia', 'prevenção', 'postura'],
    'published',
    'https://via.placeholder.com/800x600/3b82f6/ffffff?text=Ergonomia',
    'pdf',
    false,
    156,
    NOW()
  )
  ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE material_favorites IS 'Favoritos de materiais clínicos por usuário';
COMMENT ON FUNCTION increment_material_download IS 'Incrementa contador de downloads de um material';

-- =====================================================
-- LOG
-- =====================================================

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250205000000_populate_clinical_materials.sql aplicada com sucesso!';
  RAISE NOTICE 'Materiais clínicos iniciais inseridos: 15 materiais';
  RAISE NOTICE 'Tabela material_favorites criada com RLS configurado';
  RAISE NOTICE 'Função increment_material_download criada';
END $$;

