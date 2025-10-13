-- Migration para implementar CRUD de sessões e ações rápidas
-- Criado em: 2024-12-01

-- Tabela para histórico de sessões
CREATE TABLE IF NOT EXISTS session_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    therapist_id TEXT NOT NULL,
    duration INTEGER DEFAULT 0, -- em minutos
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'no-show')),
    notes TEXT,
    soap_note_id UUID REFERENCES soap_notes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para anexos de sessão
CREATE TABLE IF NOT EXISTS session_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('photo', 'document', 'video', 'audio')),
    size INTEGER DEFAULT 0, -- em bytes
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para relatórios de sessão
CREATE TABLE IF NOT EXISTS session_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('progress', 'assessment', 'treatment', 'summary')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    generated_by TEXT NOT NULL CHECK (generated_by IN ('therapist', 'ai', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para fotos de ações rápidas
CREATE TABLE IF NOT EXISTS quick_action_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('before', 'during', 'after', 'exercise', 'assessment', 'progress')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by TEXT NOT NULL
);

-- Tabela para documentos de ações rápidas
CREATE TABLE IF NOT EXISTS quick_action_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('prescription', 'exam', 'report', 'protocol', 'exercise_guide', 'other')),
    size INTEGER DEFAULT 0, -- em bytes
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by TEXT NOT NULL
);

-- Tabela para relatórios de ações rápidas
CREATE TABLE IF NOT EXISTS quick_action_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES session_history(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('progress', 'assessment', 'treatment_summary', 'exercise_progress', 'pain_assessment')),
    content TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by TEXT NOT NULL CHECK (generated_by IN ('therapist', 'ai', 'system')),
    is_automated BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_session_history_patient_id ON session_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_history_date ON session_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_appointment_id ON session_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_session_attachments_session_id ON session_attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_reports_session_id ON session_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_photos_session_id ON quick_action_photos(session_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_photos_patient_id ON quick_action_photos(patient_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_documents_session_id ON quick_action_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_documents_patient_id ON quick_action_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_reports_session_id ON quick_action_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_quick_action_reports_patient_id ON quick_action_reports(patient_id);

-- RLS (Row Level Security)
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_action_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_action_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_action_reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para session_history
CREATE POLICY "Users can view session history" ON session_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert session history" ON session_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update session history" ON session_history
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete session history" ON session_history
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para session_attachments
CREATE POLICY "Users can view session attachments" ON session_attachments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert session attachments" ON session_attachments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update session attachments" ON session_attachments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete session attachments" ON session_attachments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para session_reports
CREATE POLICY "Users can view session reports" ON session_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert session reports" ON session_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update session reports" ON session_reports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete session reports" ON session_reports
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para quick_action_photos
CREATE POLICY "Users can view quick action photos" ON quick_action_photos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert quick action photos" ON quick_action_photos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update quick action photos" ON quick_action_photos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete quick action photos" ON quick_action_photos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para quick_action_documents
CREATE POLICY "Users can view quick action documents" ON quick_action_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert quick action documents" ON quick_action_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update quick action documents" ON quick_action_documents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete quick action documents" ON quick_action_documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para quick_action_reports
CREATE POLICY "Users can view quick action reports" ON quick_action_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert quick action reports" ON quick_action_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update quick action reports" ON quick_action_reports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete quick action reports" ON quick_action_reports
    FOR DELETE USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para session_history
CREATE TRIGGER update_session_history_updated_at 
    BEFORE UPDATE ON session_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE session_history IS 'Histórico de sessões de fisioterapia';
COMMENT ON TABLE session_attachments IS 'Anexos das sessões (fotos, documentos, vídeos)';
COMMENT ON TABLE session_reports IS 'Relatórios gerados para as sessões';
COMMENT ON TABLE quick_action_photos IS 'Fotos adicionadas via ações rápidas';
COMMENT ON TABLE quick_action_documents IS 'Documentos anexados via ações rápidas';
COMMENT ON TABLE quick_action_reports IS 'Relatórios gerados via ações rápidas';
