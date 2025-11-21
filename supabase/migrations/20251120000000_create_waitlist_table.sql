CREATE TABLE public.waitlist (
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

-- Opcional: Adicionar índices para melhorar o desempenho das consultas
CREATE INDEX idx_waitlist_patient_id ON public.waitlist (patient_id);
CREATE INDEX idx_waitlist_priority_status ON public.waitlist (priority, status);

-- Opcional: Adicionar RLS (Row Level Security)
-- ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON public.waitlist FOR SELECT USING (TRUE);
-- CREATE POLICY "Enable insert for authenticated users" ON public.waitlist FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Enable update for authenticated users" ON public.waitlist FOR UPDATE USING (auth.uid() IS NOT NULL);
