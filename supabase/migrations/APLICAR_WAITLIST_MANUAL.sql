-- =====================================================
-- Migração Manual: Criar Tabela Waitlist
-- Execute este script diretamente no Supabase SQL Editor
-- =====================================================

-- Criar tabela waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal', -- 'Urgente', 'Alta', 'Normal'
    status TEXT NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Notificado', 'Preenchido', 'Expirado'
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    notified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar índices para melhorar o desempenho das consultas
CREATE INDEX IF NOT EXISTS idx_waitlist_patient_id ON public.waitlist (patient_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority_status ON public.waitlist (priority, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist (status);
CREATE INDEX IF NOT EXISTS idx_waitlist_expires_at ON public.waitlist (expires_at) WHERE expires_at IS NOT NULL;

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_waitlist_updated_at ON public.waitlist;
CREATE TRIGGER trigger_update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_waitlist_updated_at();

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.waitlist;

-- Políticas RLS básicas
CREATE POLICY "Enable read access for authenticated users" 
    ON public.waitlist FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" 
    ON public.waitlist FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" 
    ON public.waitlist FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" 
    ON public.waitlist FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Comentários na tabela
COMMENT ON TABLE public.waitlist IS 'Tabela de lista de espera para agendamentos';
COMMENT ON COLUMN public.waitlist.priority IS 'Prioridade: Urgente, Alta, Normal';
COMMENT ON COLUMN public.waitlist.status IS 'Status: Ativo, Notificado, Preenchido, Expirado';

-- Verificar se a tabela foi criada
SELECT 
    'Tabela waitlist criada com sucesso!' as status,
    COUNT(*) as total_registros
FROM public.waitlist;


