-- =============================================
-- AGENDA TABLES MIGRATION
-- =============================================
-- Migration: 003_agenda_tables.sql
-- Description: Cria tabelas para lista de espera e bloqueios de agenda
-- Author: DuduFisio-AI
-- Date: 2025-01-17
-- =============================================

-- =============================================
-- WAITLIST ENTRIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Preferências de agendamento
    preferred_start_from TIMESTAMPTZ,
    preferred_start_to TIMESTAMPTZ,
    preferred_days INTEGER[], -- Array de dias da semana (0=Dom, 1=Seg, etc)
    preferred_time_ranges JSONB, -- Array de objetos {start: "HH:mm", end: "HH:mm"}
    
    -- Priorização
    urgency INTEGER NOT NULL DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
    no_show_risk INTEGER DEFAULT 0 CHECK (no_show_risk >= 0 AND no_show_risk <= 10),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'scheduled', 'cancelled')),
    
    -- Notificações
    last_notified_at TIMESTAMPTZ,
    
    -- Observações
    notes TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_patient_id ON public.waitlist_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_therapist_id ON public.waitlist_entries(therapist_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON public.waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_urgency ON public.waitlist_entries(urgency DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at ON public.waitlist_entries(created_at DESC);

-- Índice GIN para busca em arrays
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_preferred_days ON public.waitlist_entries USING GIN(preferred_days);

-- =============================================
-- SCHEDULE BLOCKS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamento
    therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Período do bloqueio
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    -- Tipo e motivo
    block_type TEXT NOT NULL DEFAULT 'ausencia' CHECK (block_type IN ('ferias', 'almoco', 'ausencia', 'feriado', 'treinamento', 'outro')),
    reason TEXT,
    
    -- Recorrência (opcional)
    recurrence_rule JSONB, -- {frequency: 'daily'|'weekly'|'monthly', days: [], until: date}
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Constraints
    CONSTRAINT schedule_blocks_time_check CHECK (end_time > start_time)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_therapist_id ON public.schedule_blocks(therapist_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_start_time ON public.schedule_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_end_time ON public.schedule_blocks(end_time);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_type ON public.schedule_blocks(block_type);

-- Índice composto para queries de conflito
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_time_range ON public.schedule_blocks(therapist_id, start_time, end_time);

-- =============================================
-- RLS POLICIES - WAITLIST ENTRIES
-- =============================================

-- Habilitar RLS
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Políticas para waitlist_entries

-- Admin pode ver tudo
CREATE POLICY "Admins can view all waitlist entries"
    ON public.waitlist_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Terapeutas podem ver suas próprias entradas
CREATE POLICY "Therapists can view their waitlist entries"
    ON public.waitlist_entries FOR SELECT
    USING (
        therapist_id = auth.uid()
        OR NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin e terapeutas podem criar entradas
CREATE POLICY "Admins and therapists can create waitlist entries"
    ON public.waitlist_entries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin e terapeutas podem atualizar entradas
CREATE POLICY "Admins and therapists can update waitlist entries"
    ON public.waitlist_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin pode deletar entradas
CREATE POLICY "Admins can delete waitlist entries"
    ON public.waitlist_entries FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- =============================================
-- RLS POLICIES - SCHEDULE BLOCKS
-- =============================================

-- Habilitar RLS
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para schedule_blocks

-- Admin pode ver tudo
CREATE POLICY "Admins can view all schedule blocks"
    ON public.schedule_blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Terapeutas podem ver seus próprios bloqueios
CREATE POLICY "Therapists can view their schedule blocks"
    ON public.schedule_blocks FOR SELECT
    USING (
        therapist_id = auth.uid()
        OR NOT EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin e terapeutas podem criar bloqueios
CREATE POLICY "Admins and therapists can create schedule blocks"
    ON public.schedule_blocks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin e terapeutas podem atualizar bloqueios
CREATE POLICY "Admins and therapists can update schedule blocks"
    ON public.schedule_blocks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'therapist')
        )
    );

-- Admin pode deletar bloqueios
CREATE POLICY "Admins can delete schedule blocks"
    ON public.schedule_blocks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- =============================================
-- TRIGGERS - UPDATED_AT
-- =============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em waitlist_entries
DROP TRIGGER IF EXISTS update_waitlist_entries_updated_at ON public.waitlist_entries;
CREATE TRIGGER update_waitlist_entries_updated_at
    BEFORE UPDATE ON public.waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Aplicar trigger em schedule_blocks
DROP TRIGGER IF EXISTS update_schedule_blocks_updated_at ON public.schedule_blocks;
CREATE TRIGGER update_schedule_blocks_updated_at
    BEFORE UPDATE ON public.schedule_blocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para lista de espera com informações do paciente
CREATE OR REPLACE VIEW public.waitlist_with_patient_info AS
SELECT 
    w.*,
    p.full_name as patient_name,
    p.phone as patient_phone,
    p.email as patient_email,
    u.full_name as therapist_name
FROM public.waitlist_entries w
LEFT JOIN public.patients p ON w.patient_id = p.id
LEFT JOIN public.users u ON w.therapist_id = u.id;

-- View para bloqueios com informações do terapeuta
CREATE OR REPLACE VIEW public.schedule_blocks_with_therapist AS
SELECT 
    s.*,
    u.full_name as therapist_name,
    u.email as therapist_email
FROM public.schedule_blocks s
LEFT JOIN public.users u ON s.therapist_id = u.id;

-- =============================================
-- FUNCTIONS ÚTEIS
-- =============================================

-- Função para buscar próximos horários disponíveis considerando bloqueios
CREATE OR REPLACE FUNCTION public.find_available_slots(
    p_therapist_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
    available_start TIMESTAMPTZ,
    available_end TIMESTAMPTZ
) AS $$
BEGIN
    -- TODO: Implementar lógica de busca de slots disponíveis
    -- Considerando bloqueios e agendamentos existentes
    RETURN QUERY
    SELECT 
        p_start_date as available_start,
        p_start_date + (p_duration_minutes || ' minutes')::INTERVAL as available_end;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.waitlist_entries IS 'Lista de espera de pacientes aguardando por agendamento';
COMMENT ON TABLE public.schedule_blocks IS 'Bloqueios de agenda (férias, almoço, ausências, etc)';

COMMENT ON COLUMN public.waitlist_entries.urgency IS 'Urgência de 1 a 5, onde 5 é crítico';
COMMENT ON COLUMN public.waitlist_entries.no_show_risk IS 'Risco de faltar de 0 a 10, onde 10 é muito alto';
COMMENT ON COLUMN public.waitlist_entries.preferred_days IS 'Array de dias da semana (0=Dom, 1=Seg, 2=Ter, etc)';
COMMENT ON COLUMN public.waitlist_entries.preferred_time_ranges IS 'Array de horários preferidos [{start: "08:00", end: "12:00"}]';

COMMENT ON COLUMN public.schedule_blocks.block_type IS 'Tipo de bloqueio: ferias, almoco, ausencia, feriado, treinamento, outro';
COMMENT ON COLUMN public.schedule_blocks.recurrence_rule IS 'Regra de recorrência JSON: {frequency: "daily|weekly|monthly", days: [], until: date}';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

