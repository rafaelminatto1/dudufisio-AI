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

-- Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_waitlist_updated_at();

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

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


