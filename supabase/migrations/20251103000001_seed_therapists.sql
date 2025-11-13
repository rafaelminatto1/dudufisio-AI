-- ============================================================================
-- SEED 003: Fisioterapeutas de Demonstração
-- ============================================================================
-- Descrição: Popula a tabela therapists com dados realistas de fisioterapeutas
-- Data: 2025-11-03
-- Autor: DuduFisio-AI Team
-- ============================================================================

-- ⚠️ IMPORTANTE: Este script assume que existem usuários criados no sistema
-- Os therapists serão vinculados aos usuários com role='therapist' ou 'admin'

-- ============================================================================
-- FISIOTERAPEUTAS DE DEMONSTRAÇÃO
-- ============================================================================

-- Verificar se existem usuários disponíveis para vincular
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- Buscar usuários existentes com role apropriada
    SELECT id INTO user1_id FROM users 
    WHERE role IN ('therapist', 'admin') 
    AND NOT EXISTS (SELECT 1 FROM therapists WHERE user_id = users.id)
    ORDER BY created_at 
    LIMIT 1;
    
    SELECT id INTO user2_id FROM users 
    WHERE role IN ('therapist', 'admin')
    AND id != COALESCE(user1_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND NOT EXISTS (SELECT 1 FROM therapists WHERE user_id = users.id)
    ORDER BY created_at 
    OFFSET 1 LIMIT 1;
    
    SELECT id INTO user3_id FROM users 
    WHERE role IN ('therapist', 'admin')
    AND id NOT IN (COALESCE(user1_id, '00000000-0000-0000-0000-000000000000'::UUID), 
                   COALESCE(user2_id, '00000000-0000-0000-0000-000000000000'::UUID))
    AND NOT EXISTS (SELECT 1 FROM therapists WHERE user_id = users.id)
    ORDER BY created_at 
    OFFSET 2 LIMIT 1;

    -- Inserir Fisioterapeuta 1: Especialista em Ortopedia
    IF user1_id IS NOT NULL THEN
        INSERT INTO therapists (
            user_id,
            license_number,
            license_type,
            specialties,
            bio,
            working_hours,
            is_accepting_patients,
            appointment_duration,
            color_code
        ) VALUES (
            user1_id,
            'CREFITO-3/234567-F',
            'CREFITO',
            ARRAY['Ortopedia', 'Traumatologia', 'Reabilitação Esportiva'],
            'Fisioterapeuta especializada em ortopedia e traumatologia com mais de 10 anos de experiência. Pós-graduação em Fisioterapia Esportiva pela USP. Atua principalmente com lesões musculoesqueléticas, reabilitação pós-operatória e prevenção de lesões em atletas.',
            '{
                "monday": {"start": "08:00", "end": "18:00"},
                "tuesday": {"start": "08:00", "end": "18:00"},
                "wednesday": {"start": "08:00", "end": "18:00"},
                "thursday": {"start": "08:00", "end": "18:00"},
                "friday": {"start": "08:00", "end": "17:00"},
                "saturday": {"start": "08:00", "end": "12:00"}
            }'::jsonb,
            true,
            60,
            '#3b82f6'
        );
        
        -- Atualizar o nome do usuário vinculado
        UPDATE users 
        SET full_name = 'Dra. Mariana Silva',
            role = 'therapist'
        WHERE id = user1_id AND full_name IS NULL;
        
        RAISE NOTICE 'Fisioterapeuta 1 criado: Dra. Mariana Silva (Ortopedia)';
    END IF;

    -- Inserir Fisioterapeuta 2: Especialista em Neurologia
    IF user2_id IS NOT NULL THEN
        INSERT INTO therapists (
            user_id,
            license_number,
            license_type,
            specialties,
            bio,
            working_hours,
            is_accepting_patients,
            appointment_duration,
            color_code
        ) VALUES (
            user2_id,
            'CREFITO-3/345678-F',
            'CREFITO',
            ARRAY['Neurologia', 'Reabilitação Neurológica', 'Fisioterapia Geriátrica'],
            'Fisioterapeuta especializado em neurologia com foco em reabilitação de pacientes com AVC, Parkinson e outras condições neurológicas. Mestrado em Neurociências pela UNIFESP. Experiência de 8 anos em clínicas e hospitais de referência.',
            '{
                "monday": {"start": "09:00", "end": "19:00"},
                "tuesday": {"start": "09:00", "end": "19:00"},
                "wednesday": {"start": "09:00", "end": "19:00"},
                "thursday": {"start": "09:00", "end": "19:00"},
                "friday": {"start": "09:00", "end": "18:00"}
            }'::jsonb,
            true,
            90,
            '#10b981'
        );
        
        -- Atualizar o nome do usuário vinculado
        UPDATE users 
        SET full_name = 'Dr. Roberto Santos',
            role = 'therapist'
        WHERE id = user2_id AND full_name IS NULL;
        
        RAISE NOTICE 'Fisioterapeuta 2 criado: Dr. Roberto Santos (Neurologia)';
    END IF;

    -- Inserir Fisioterapeuta 3: Especialista em Pediatria
    IF user3_id IS NOT NULL THEN
        INSERT INTO therapists (
            user_id,
            license_number,
            license_type,
            specialties,
            bio,
            working_hours,
            is_accepting_patients,
            appointment_duration,
            color_code
        ) VALUES (
            user3_id,
            'CREFITO-3/456789-F',
            'CREFITO',
            ARRAY['Pediatria', 'Neonatologia', 'Desenvolvimento Motor'],
            'Fisioterapeuta pediátrica com especialização em desenvolvimento motor infantil e reabilitação neonatal. Atua com bebês prematuros, crianças com atraso no desenvolvimento e condições neuromotoras. Formação complementar em Bobath e integração sensorial.',
            '{
                "monday": {"start": "07:00", "end": "16:00"},
                "tuesday": {"start": "07:00", "end": "16:00"},
                "wednesday": {"start": "07:00", "end": "16:00"},
                "thursday": {"start": "07:00", "end": "16:00"},
                "friday": {"start": "07:00", "end": "15:00"}
            }'::jsonb,
            true,
            45,
            '#f59e0b'
        );
        
        -- Atualizar o nome do usuário vinculado
        UPDATE users 
        SET full_name = 'Dra. Ana Paula Oliveira',
            role = 'therapist'
        WHERE id = user3_id AND full_name IS NULL;
        
        RAISE NOTICE 'Fisioterapeuta 3 criado: Dra. Ana Paula Oliveira (Pediatria)';
    END IF;

    -- Mensagem de conclusão
    IF user1_id IS NULL AND user2_id IS NULL AND user3_id IS NULL THEN
        RAISE WARNING 'Nenhum usuário disponível para criar fisioterapeutas. Crie usuários com role "therapist" ou "admin" primeiro.';
    END IF;
END $$;
-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Mostrar fisioterapeutas criados
DO $$
DECLARE
    therapist_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO therapist_count FROM therapists;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de fisioterapeutas no sistema: %', therapist_count;
    RAISE NOTICE '============================================';
END $$;
-- Listar fisioterapeutas com informações do usuário
SELECT 
    t.id,
    u.full_name as nome,
    t.license_number as crefito,
    t.specialties as especialidades,
    t.appointment_duration as duracao_consulta,
    t.is_accepting_patients as aceitando_pacientes
FROM therapists t
JOIN users u ON u.id = t.user_id
ORDER BY u.full_name;
-- ============================================================================
-- COMENTÁRIOS SOBRE A ESTRUTURA
-- ============================================================================

COMMENT ON TABLE therapists IS 'Fisioterapeutas do sistema com informações profissionais e disponibilidade';
COMMENT ON COLUMN therapists.license_number IS 'Número do CREFITO ou outro registro profissional';
COMMENT ON COLUMN therapists.specialties IS 'Array de especialidades do fisioterapeuta';
COMMENT ON COLUMN therapists.working_hours IS 'Horários de trabalho por dia da semana (formato JSON)';
COMMENT ON COLUMN therapists.appointment_duration IS 'Duração padrão das consultas em minutos';
COMMENT ON COLUMN therapists.color_code IS 'Cor para identificação visual na agenda (formato hex)';
