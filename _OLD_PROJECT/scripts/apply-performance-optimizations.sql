-- ============================================================================
-- APLICAÇÃO DAS OTIMIZAÇÕES DE PERFORMANCE
-- ============================================================================

-- 1. REMOÇÃO DE ÍNDICES NÃO UTILIZADOS
-- ============================================================================

-- Identificar e remover índices não utilizados
DO $$
DECLARE
    idx_record RECORD;
    removed_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando remoção de índices não utilizados...';
    
    FOR idx_record IN
        SELECT 
            s.schemaname,
            s.tablename,
            s.indexname,
            pg_relation_size(s.indexrelid) as size_bytes
        FROM pg_stat_user_indexes s
        JOIN pg_index i ON s.indexrelid = i.indexrelid
        WHERE s.idx_scan = 0 
            AND NOT i.indisunique
            AND NOT i.indisprimary
            AND s.schemaname = 'public'
            AND pg_relation_size(s.indexrelid) > 1024 -- Apenas índices > 1KB
        ORDER BY pg_relation_size(s.indexrelid) DESC
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I.%I', idx_record.schemaname, idx_record.indexname);
        removed_count := removed_count + 1;
        RAISE NOTICE 'Removido índice: %.% (tamanho: % bytes)', 
            idx_record.schemaname, idx_record.indexname, idx_record.size_bytes;
    END LOOP;
    
    RAISE NOTICE 'Total de índices removidos: %', removed_count;
END;
$$;

-- 2. OTIMIZAÇÃO DE POLÍTICAS RLS
-- ============================================================================

-- Consolidar políticas RLS múltiplas
DO $$
DECLARE
    table_record RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE 'Iniciando otimização de políticas RLS...';
    
    FOR table_record IN 
        SELECT DISTINCT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename 
        HAVING COUNT(*) > 3
    LOOP
        -- Contar políticas existentes
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = table_record.tablename;
        
        RAISE NOTICE 'Tabela % tem % políticas - consolidando...', 
            table_record.tablename, policy_count;
        
        -- Remover políticas existentes
        EXECUTE format('DROP POLICY IF EXISTS "Users can view %I" ON %I', 
            table_record.tablename, table_record.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert %I" ON %I', 
            table_record.tablename, table_record.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update %I" ON %I', 
            table_record.tablename, table_record.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete %I" ON %I', 
            table_record.tablename, table_record.tablename);
        
        -- Criar política consolidada
        EXECUTE format('
            CREATE POLICY "Consolidated access policy for %I" ON %I
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                )
            )', table_record.tablename, table_record.tablename);
    END LOOP;
    
    RAISE NOTICE 'Políticas RLS otimizadas!';
END;
$$;

-- 3. ADIÇÃO DE ÍNDICES PARA CHAVES ESTRANGEIRAS
-- ============================================================================

-- Adicionar índices para FKs críticas
CREATE INDEX IF NOT EXISTS idx_clinical_documents_patient_id 
ON clinical_documents(patient_id);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_created_by 
ON clinical_documents(created_by);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_template_id 
ON clinical_documents(template_id) WHERE template_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_documents_signed_by 
ON clinical_documents(signed_by) WHERE signed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_initial_assessments_patient_id 
ON initial_assessments(patient_id);

CREATE INDEX IF NOT EXISTS idx_initial_assessments_created_by 
ON initial_assessments(created_by);

CREATE INDEX IF NOT EXISTS idx_session_evolutions_patient_id 
ON session_evolutions(patient_id);

CREATE INDEX IF NOT EXISTS idx_session_evolutions_appointment_id 
ON session_evolutions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_session_evolutions_created_by 
ON session_evolutions(created_by);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_document_id 
ON digital_signatures(document_id);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_signed_by 
ON digital_signatures(signed_by);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id 
ON appointments(patient_id);

CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id 
ON appointments(therapist_id);

CREATE INDEX IF NOT EXISTS idx_patients_user_id 
ON patients(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patients_created_by 
ON patients(created_by);

-- 4. ÍNDICES COMPOSTOS PARA CONSULTAS FREQUENTES
-- ============================================================================

-- Índices compostos para consultas comuns
CREATE INDEX IF NOT EXISTS idx_clinical_documents_patient_type_date 
ON clinical_documents(patient_id, document_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_signed_status 
ON clinical_documents(is_signed, signed_at) WHERE is_signed = true;

CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date_status 
ON appointments(therapist_id, scheduled_at, status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date_status 
ON appointments(patient_id, scheduled_at, status);

-- 5. ÍNDICES PARA CONSULTAS DE ANÁLISE
-- ============================================================================

-- Índices para relatórios e análises
CREATE INDEX IF NOT EXISTS idx_clinical_documents_type_specialty 
ON clinical_documents(document_type, specialty);

CREATE INDEX IF NOT EXISTS idx_session_evolutions_patient_date 
ON session_evolutions(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_body_points_patient_region 
ON body_points(patient_id, body_region);

-- 6. OTIMIZAÇÕES ESPECÍFICAS
-- ============================================================================

-- Otimizar consultas de timeline clínica
CREATE INDEX IF NOT EXISTS idx_clinical_timeline_patient_date 
ON clinical_documents(patient_id, created_at DESC) 
WHERE document_type IN ('initial_assessment', 'session_evolution', 'discharge_summary');

-- Otimizar consultas de assinatura digital
CREATE INDEX IF NOT EXISTS idx_digital_signatures_valid 
ON digital_signatures(is_valid, signed_at) WHERE is_valid = true;

-- Otimizar consultas de templates
CREATE INDEX IF NOT EXISTS idx_clinical_templates_type_specialty_active 
ON clinical_templates(type, specialty, active) WHERE active = true;

-- 7. ANÁLISE DE RESULTADOS
-- ============================================================================

-- Mostrar estatísticas após otimizações
DO $$
DECLARE
    total_indexes INTEGER;
    total_size TEXT;
    rls_tables INTEGER;
BEGIN
    -- Contar índices
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Calcular tamanho total dos índices
    SELECT pg_size_pretty(SUM(pg_relation_size(indexrelid))) INTO total_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public';
    
    -- Contar tabelas com RLS
    SELECT COUNT(DISTINCT tablename) INTO rls_tables
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '=== RESULTADOS DAS OTIMIZAÇÕES ===';
    RAISE NOTICE 'Total de índices: %', total_indexes;
    RAISE NOTICE 'Tamanho total dos índices: %', total_size;
    RAISE NOTICE 'Tabelas com RLS: %', rls_tables;
    RAISE NOTICE '================================';
END;
$$;
