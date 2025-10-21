-- =====================================================
-- CLINICAL MATERIALS ADVANCED SYSTEM
-- Migration: 20250121000000_clinical_materials_advanced.sql
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Clinical Materials (main table)
CREATE TABLE IF NOT EXISTS clinical_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category_id UUID,
  
  -- Rich content
  content TEXT, -- HTML content from Tiptap
  tags TEXT[] DEFAULT '{}',
  
  -- Collaboration metadata
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  collaborators UUID[] DEFAULT '{}',
  
  -- Status and versioning
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  edit_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Categories
CREATE TABLE IF NOT EXISTS clinical_material_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Versions (history)
CREATE TABLE IF NOT EXISTS clinical_material_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changes TEXT, -- Description of changes
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Mentions (for @user mentions)
CREATE TABLE IF NOT EXISTS clinical_material_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  position INTEGER NOT NULL, -- Position in text
  content TEXT, -- Context around mention
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  task_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Links (wiki-style links between materials)
CREATE TABLE IF NOT EXISTS clinical_material_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  to_material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  link_text TEXT NOT NULL, -- Text of the link [[...]]
  position INTEGER, -- Position in text
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_material_id, to_material_id)
);

-- Material Tasks (tasks created from mentions)
CREATE TABLE IF NOT EXISTS clinical_material_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  mention_id UUID REFERENCES clinical_material_mentions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  content TEXT NOT NULL, -- Task description/context
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Media Attachments
CREATE TABLE IF NOT EXISTS clinical_material_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES clinical_materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'gif', 'document')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL, -- Size in bytes
  alt TEXT,
  caption TEXT,
  position INTEGER, -- Position in text
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Clinical Materials indexes
CREATE INDEX IF NOT EXISTS idx_clinical_materials_category ON clinical_materials(category_id);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_status ON clinical_materials(status);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_created_by ON clinical_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_updated_at ON clinical_materials(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_tags ON clinical_materials USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_name_search ON clinical_materials USING GIN(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Mentions indexes
CREATE INDEX IF NOT EXISTS idx_mentions_user ON clinical_material_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_status ON clinical_material_mentions(status);
CREATE INDEX IF NOT EXISTS idx_mentions_material ON clinical_material_mentions(material_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user ON clinical_material_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON clinical_material_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON clinical_material_tasks(due_date);

-- Links indexes
CREATE INDEX IF NOT EXISTS idx_links_from ON clinical_material_links(from_material_id);
CREATE INDEX IF NOT EXISTS idx_links_to ON clinical_material_links(to_material_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE clinical_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_material_media ENABLE ROW LEVEL SECURITY;

-- Policies for clinical_materials
CREATE POLICY "Users can view published materials" ON clinical_materials
  FOR SELECT USING (status = 'published' OR created_by = auth.uid() OR auth.uid() = ANY(collaborators));

CREATE POLICY "Users can create materials" ON clinical_materials
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own materials or if collaborator" ON clinical_materials
  FOR UPDATE USING (created_by = auth.uid() OR auth.uid() = ANY(collaborators));

CREATE POLICY "Users can delete own materials" ON clinical_materials
  FOR DELETE USING (created_by = auth.uid());

-- Policies for categories (everyone can read, only admins can modify)
CREATE POLICY "Everyone can view categories" ON clinical_material_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON clinical_material_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'Admin'
    )
  );

-- Policies for versions
CREATE POLICY "Users can view versions of accessible materials" ON clinical_material_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (status = 'published' OR created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

CREATE POLICY "Users can create versions for accessible materials" ON clinical_material_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

-- Policies for mentions
CREATE POLICY "Users can view mentions in accessible materials" ON clinical_material_mentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (status = 'published' OR created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

CREATE POLICY "Users can create mentions in accessible materials" ON clinical_material_mentions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

-- Policies for tasks
CREATE POLICY "Users can view their own tasks" ON clinical_material_tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks" ON clinical_material_tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create tasks for accessible materials" ON clinical_material_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

-- Policies for links
CREATE POLICY "Users can view links in accessible materials" ON clinical_material_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = from_material_id 
      AND (status = 'published' OR created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

-- Policies for media
CREATE POLICY "Users can view media in accessible materials" ON clinical_material_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (status = 'published' OR created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

CREATE POLICY "Users can manage media in accessible materials" ON clinical_material_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinical_materials 
      WHERE clinical_materials.id = material_id 
      AND (created_by = auth.uid() OR auth.uid() = ANY(collaborators))
    )
  );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_clinical_materials_updated_at 
  BEFORE UPDATE ON clinical_materials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_material_categories_updated_at 
  BEFORE UPDATE ON clinical_material_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-increment version
CREATE OR REPLACE FUNCTION increment_material_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.version = OLD.version + 1;
    NEW.last_edited_at = NOW();
    NEW.edit_count = OLD.edit_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_clinical_materials_version 
  BEFORE UPDATE ON clinical_materials 
  FOR EACH ROW EXECUTE FUNCTION increment_material_version();

-- Function to create version history
CREATE OR REPLACE FUNCTION create_material_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO clinical_material_versions (material_id, version, content, changes, created_by)
    VALUES (OLD.id, OLD.version, OLD.content, 'Auto-saved version', NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_clinical_material_version 
  AFTER UPDATE ON clinical_materials 
  FOR EACH ROW EXECUTE FUNCTION create_material_version();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to search materials with full-text search
CREATE OR REPLACE FUNCTION search_materials(
  search_query TEXT,
  category_filter UUID DEFAULT NULL,
  tag_filter TEXT[] DEFAULT NULL,
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  content TEXT,
  tags TEXT[],
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.description,
    cm.type,
    cm.content,
    cm.tags,
    cm.status,
    cm.created_at,
    cm.updated_at,
    ts_rank(to_tsvector('portuguese', cm.name || ' ' || COALESCE(cm.description, '') || ' ' || COALESCE(cm.content, '')), plainto_tsquery('portuguese', search_query)) as rank
  FROM clinical_materials cm
  WHERE 
    to_tsvector('portuguese', cm.name || ' ' || COALESCE(cm.description, '') || ' ' || COALESCE(cm.content, '')) @@ plainto_tsquery('portuguese', search_query)
    AND (category_filter IS NULL OR cm.category_id = category_filter)
    AND (tag_filter IS NULL OR cm.tags && tag_filter)
    AND (status_filter IS NULL OR cm.status = status_filter)
  ORDER BY rank DESC, cm.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related materials
CREATE OR REPLACE FUNCTION get_related_materials(material_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  link_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.type,
    COUNT(cml.id)::INTEGER as link_count
  FROM clinical_materials cm
  JOIN clinical_material_links cml ON (cml.from_material_id = material_id AND cml.to_material_id = cm.id)
     OR (cml.to_material_id = material_id AND cml.from_material_id = cm.id)
  WHERE cm.status = 'published'
  GROUP BY cm.id, cm.name, cm.type
  ORDER BY link_count DESC, cm.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default categories
INSERT INTO clinical_material_categories (id, name, description, color, icon) VALUES
  (gen_random_uuid(), 'Avaliação e Diagnóstico', 'Escalas, testes e protocolos de avaliação', '#3b82f6', 'clipboard-list'),
  (gen_random_uuid(), 'Protocolos Clínicos', 'Protocolos de tratamento e reabilitação', '#10b981', 'file-text'),
  (gen_random_uuid(), 'Materiais de Prescrição', 'Templates e guias para prescrição de exercícios', '#f59e0b', 'book-open'),
  (gen_random_uuid(), 'Recursos Educacionais', 'Materiais educativos para pacientes', '#8b5cf6', 'graduation-cap'),
  (gen_random_uuid(), 'Técnicas de Terapia Manual', 'Protocolos de terapia manual', '#ef4444', 'hand'),
  (gen_random_uuid(), 'Eletroterapia e Recursos Físicos', 'Protocolos de eletroterapia e recursos físicos', '#06b6d4', 'zap')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE clinical_materials IS 'Main table for clinical materials with rich content and collaboration features';
COMMENT ON TABLE clinical_material_versions IS 'Version history for clinical materials';
COMMENT ON TABLE clinical_material_mentions IS 'User mentions (@user) in materials that create tasks';
COMMENT ON TABLE clinical_material_tasks IS 'Tasks created from material mentions';
COMMENT ON TABLE clinical_material_links IS 'Wiki-style links between materials';
COMMENT ON TABLE clinical_material_media IS 'Media attachments for materials';

COMMENT ON FUNCTION search_materials IS 'Full-text search function for clinical materials';
COMMENT ON FUNCTION get_related_materials IS 'Get materials related to a given material through links';
