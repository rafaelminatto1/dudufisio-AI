-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Criar tabela de base de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}',
  source_type TEXT CHECK (source_type IN ('article', 'protocol', 'book', 'note', 'guideline', 'research')),
  source_title TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT content_length CHECK (length(content) >= 50)
);

-- Criar índice HNSW para busca vetorial ultra-rápida
-- m = 16: número de conexões bidirecionais por nó
-- ef_construction = 64: tamanho da lista de candidatos durante construção
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON knowledge_base 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice para busca por metadados
CREATE INDEX IF NOT EXISTS knowledge_base_metadata_idx 
ON knowledge_base 
USING gin (metadata);

-- Índice para busca por tipo
CREATE INDEX IF NOT EXISTS knowledge_base_source_type_idx 
ON knowledge_base (source_type);

-- Índice para busca por título
CREATE INDEX IF NOT EXISTS knowledge_base_title_idx 
ON knowledge_base (source_title);

-- Índice para busca temporal
CREATE INDEX IF NOT EXISTS knowledge_base_created_at_idx 
ON knowledge_base (created_at DESC);

-- Full-text search para busca híbrida
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS knowledge_base_search_idx 
ON knowledge_base 
USING gin(search_vector);

-- Função para atualizar search_vector automaticamente
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', coalesce(NEW.source_title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.author, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar search_vector
DROP TRIGGER IF EXISTS knowledge_base_search_vector_update ON knowledge_base;
CREATE TRIGGER knowledge_base_search_vector_update
  BEFORE INSERT OR UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_search_vector();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função de busca semântica
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 10,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_title TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.source_title,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 
    (filter_type IS NULL OR kb.source_type = filter_type)
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Função de busca híbrida (vetorial + keyword)
CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  weight_semantic FLOAT DEFAULT 0.7,
  weight_keyword FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_title TEXT,
  metadata JSONB,
  score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT 
      kb.id,
      kb.content,
      kb.source_title,
      kb.metadata,
      (1 - (kb.embedding <=> query_embedding)) * weight_semantic AS semantic_score
    FROM knowledge_base kb
    WHERE kb.embedding IS NOT NULL
    ORDER BY kb.embedding <=> query_embedding
    LIMIT 20
  ),
  keyword_search AS (
    SELECT
      kb.id,
      kb.content,
      kb.source_title,
      kb.metadata,
      ts_rank(kb.search_vector, plainto_tsquery('portuguese', query_text)) * weight_keyword AS keyword_score
    FROM knowledge_base kb
    WHERE kb.search_vector @@ plainto_tsquery('portuguese', query_text)
    ORDER BY keyword_score DESC
    LIMIT 20
  )
  SELECT
    COALESCE(s.id, k.id) AS id,
    COALESCE(s.content, k.content) AS content,
    COALESCE(s.source_title, k.source_title) AS source_title,
    COALESCE(s.metadata, k.metadata) AS metadata,
    COALESCE(s.semantic_score, 0) + COALESCE(k.keyword_score, 0) AS score
  FROM semantic_search s
  FULL OUTER JOIN keyword_search k ON s.id = k.id
  WHERE COALESCE(s.semantic_score, 0) + COALESCE(k.keyword_score, 0) > match_threshold
  ORDER BY score DESC
  LIMIT match_count;
END;
$$;

-- Row Level Security (RLS)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Todos usuários autenticados podem inserir documentos
CREATE POLICY "Usuários autenticados podem inserir documentos"
ON knowledge_base FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Todos usuários autenticados podem ler documentos
CREATE POLICY "Usuários autenticados podem ler documentos"
ON knowledge_base FOR SELECT
TO authenticated
USING (true);

-- Policy: Usuários autenticados podem atualizar seus próprios documentos
CREATE POLICY "Usuários podem atualizar seus documentos"
ON knowledge_base FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy: Usuários autenticados podem deletar seus próprios documentos
CREATE POLICY "Usuários podem deletar seus documentos"
ON knowledge_base FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Criar tabela para histórico de consultas (analytics)
CREATE TABLE IF NOT EXISTS knowledge_base_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  results_count INT,
  avg_similarity FLOAT,
  execution_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para analytics
CREATE INDEX IF NOT EXISTS knowledge_base_queries_user_idx 
ON knowledge_base_queries (user_id, created_at DESC);

-- Comentários para documentação
COMMENT ON TABLE knowledge_base IS 'Armazena documentos e embeddings para busca semântica com IA';
COMMENT ON COLUMN knowledge_base.embedding IS 'Vector embedding gerado por OpenAI text-embedding-3-small (1536 dimensões)';
COMMENT ON COLUMN knowledge_base.metadata IS 'Metadados flexíveis em formato JSON';
COMMENT ON FUNCTION search_knowledge IS 'Busca semântica usando similaridade de cosseno';
COMMENT ON FUNCTION hybrid_search_knowledge IS 'Busca híbrida combinando similaridade vetorial e full-text search';

-- Inserir documentos de exemplo (dados seed)
INSERT INTO knowledge_base (content, source_type, source_title, author, metadata) VALUES
(
  'A fisioterapia respiratória é uma especialidade que visa prevenir e tratar disfunções do sistema respiratório. Utiliza técnicas manuais, exercícios respiratórios e recursos tecnológicos para melhorar a ventilação pulmonar, facilitar a remoção de secreções e otimizar a função respiratória.',
  'article',
  'Introdução à Fisioterapia Respiratória',
  'Dr. João Silva',
  '{"categoria": "respiratória", "nivel": "básico"}'::jsonb
),
(
  'O método Pilates foi desenvolvido por Joseph Pilates e baseia-se em seis princípios fundamentais: concentração, controle, centro, fluidez, precisão e respiração. É amplamente utilizado na fisioterapia para reabilitação postural, fortalecimento do core e prevenção de lesões.',
  'guideline',
  'Princípios do Método Pilates',
  'Dra. Maria Santos',
  '{"categoria": "pilates", "nivel": "intermediário"}'::jsonb
),
(
  'A síndrome do túnel do carpo é uma condição comum que causa dor, dormência e formigamento na mão e no braço. O tratamento fisioterapêutico inclui exercícios de deslizamento neural, fortalecimento dos músculos intrínsecos da mão e orientações ergonômicas.',
  'protocol',
  'Protocolo de Tratamento: Síndrome do Túnel do Carpo',
  'Dra. Ana Costa',
  '{"categoria": "ortopedia", "condicao": "tunel_carpo"}'::jsonb
);
