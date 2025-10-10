-- ============================================================================
-- SEED DATA: CATEGORIAS CLÍNICAS E TEMPLATES DE AVALIAÇÃO
-- Data: 10 de Outubro de 2025
-- Descrição: Dados padrão para categorias de casos clínicos e templates
--            de avaliação para fisioterapia esportiva e pós-operatória
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIAS DE CASOS CLÍNICOS
-- ============================================================================

-- Pós-operatório LCA
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Pós-operatório LCA',
  'post_operative',
  'Reabilitação após reconstrução do Ligamento Cruzado Anterior',
  true
) ON CONFLICT DO NOTHING;

-- Pós-operatório Menisco
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Pós-operatório Menisco',
  'post_operative',
  'Reabilitação após cirurgia de menisco (meniscectomia ou sutura)',
  true
) ON CONFLICT DO NOTHING;

-- Tendinite de Ombro
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Tendinite de Ombro',
  'sports',
  'Tratamento de tendinopatia do manguito rotador',
  true
) ON CONFLICT DO NOTHING;

-- Lesão Meniscal
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Lesão Meniscal',
  'orthopedic',
  'Tratamento conservador de lesão meniscal',
  true
) ON CONFLICT DO NOTHING;

-- Entorse de Tornozelo
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Entorse de Tornozelo',
  'sports',
  'Reabilitação de entorse de tornozelo (graus I, II, III)',
  true
) ON CONFLICT DO NOTHING;

-- Lombalgia
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Lombalgia',
  'orthopedic',
  'Tratamento de dor lombar aguda ou crônica',
  true
) ON CONFLICT DO NOTHING;

-- Síndrome do Impacto
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Síndrome do Impacto',
  'sports',
  'Tratamento da síndrome do impacto subacromial',
  true
) ON CONFLICT DO NOTHING;

-- Ruptura do Manguito Rotador
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Ruptura do Manguito Rotador',
  'post_operative',
  'Reabilitação pós-operatória de ruptura do manguito rotador',
  true
) ON CONFLICT DO NOTHING;

-- Tendinopatia Patelar
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Tendinopatia Patelar',
  'sports',
  'Tratamento de tendinopatia do tendão patelar (joelho do saltador)',
  true
) ON CONFLICT DO NOTHING;

-- Fascite Plantar
INSERT INTO clinical_case_categories (name, specialty, description, is_system_default)
VALUES (
  'Fascite Plantar',
  'orthopedic',
  'Tratamento de fascite plantar',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. TEMPLATES DE AVALIAÇÃO - PÓS-OPERATÓRIO LCA
-- ============================================================================

DO $$
DECLARE
  v_lca_category_id UUID;
BEGIN
  -- Buscar ID da categoria LCA
  SELECT id INTO v_lca_category_id 
  FROM clinical_case_categories 
  WHERE name = 'Pós-operatório LCA' AND is_system_default = true
  LIMIT 1;
  
  IF v_lca_category_id IS NOT NULL THEN
    -- Ângulo de Flexão do Joelho
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Ângulo de Flexão do Joelho',
      'angle',
      'graus',
      0,
      140,
      true,
      1,
      'Medição com goniômetro em decúbito dorsal'
    );
    
    -- Ângulo de Extensão do Joelho
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Ângulo de Extensão do Joelho',
      'angle',
      'graus',
      -10,
      0,
      true,
      2,
      'Déficit de extensão (0° = extensão completa, valores negativos = hiperextensão)'
    );
    
    -- Força de Quadríceps
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Força de Quadríceps',
      'scale',
      'grau',
      0,
      5,
      true,
      3,
      'Escala de força muscular de Oxford (0-5)'
    );
    
    -- Edema (circunferência)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Edema (circunferência)',
      'number',
      'cm',
      0,
      100,
      false,
      4,
      'Medição 2cm acima da borda superior da patela'
    );
    
    -- Dor (EVA)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Dor (EVA)',
      'scale',
      'pontos',
      0,
      10,
      true,
      5,
      'Escala Visual Analógica de Dor (0 = sem dor, 10 = dor máxima)'
    );
    
    -- Teste de Lachman
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_lca_category_id,
      'Teste de Lachman',
      'select',
      NULL,
      NULL,
      NULL,
      true,
      6,
      'Avaliação da estabilidade do LCA',
      '[
        {"label": "Negativo (estável)", "value": "negative"},
        {"label": "Positivo +", "value": "positive_1"},
        {"label": "Positivo ++", "value": "positive_2"},
        {"label": "Positivo +++", "value": "positive_3"}
      ]'::jsonb
    );
    
    -- Hop Test
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Hop Test (Single Leg Hop)',
      'number',
      'cm',
      0,
      300,
      false,
      7,
      'Distância alcançada no salto unipodal'
    );
    
    -- Perimetria Coxa
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lca_category_id,
      'Perimetria Coxa',
      'number',
      'cm',
      30,
      80,
      false,
      8,
      'Circunferência da coxa 10cm acima da borda superior da patela'
    );
    
    -- Gaveta Anterior
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_lca_category_id,
      'Gaveta Anterior',
      'select',
      NULL,
      NULL,
      NULL,
      false,
      9,
      'Teste de gaveta anterior a 90° de flexão',
      '[
        {"label": "Negativo", "value": "negative"},
        {"label": "Positivo +", "value": "positive_1"},
        {"label": "Positivo ++", "value": "positive_2"},
        {"label": "Positivo +++", "value": "positive_3"}
      ]'::jsonb
    );
  END IF;
END $$;

-- ============================================================================
-- 3. TEMPLATES DE AVALIAÇÃO - TENDINITE DE OMBRO
-- ============================================================================

DO $$
DECLARE
  v_shoulder_category_id UUID;
BEGIN
  SELECT id INTO v_shoulder_category_id 
  FROM clinical_case_categories 
  WHERE name = 'Tendinite de Ombro' AND is_system_default = true
  LIMIT 1;
  
  IF v_shoulder_category_id IS NOT NULL THEN
    -- Amplitude de Flexão
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_shoulder_category_id,
      'Amplitude de Flexão',
      'angle',
      'graus',
      0,
      180,
      true,
      1,
      'Medição com goniômetro em posição ortostática'
    );
    
    -- Amplitude de Abdução
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_shoulder_category_id,
      'Amplitude de Abdução',
      'angle',
      'graus',
      0,
      180,
      true,
      2,
      'Medição com goniômetro em posição ortostática'
    );
    
    -- Teste de Neer
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_shoulder_category_id,
      'Teste de Neer',
      'select',
      NULL,
      NULL,
      NULL,
      true,
      3,
      'Teste para síndrome do impacto',
      '[
        {"label": "Negativo", "value": "negative"},
        {"label": "Positivo", "value": "positive"}
      ]'::jsonb
    );
    
    -- Teste de Hawkins-Kennedy
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_shoulder_category_id,
      'Teste de Hawkins-Kennedy',
      'select',
      NULL,
      NULL,
      NULL,
      true,
      4,
      'Teste para síndrome do impacto',
      '[
        {"label": "Negativo", "value": "negative"},
        {"label": "Positivo", "value": "positive"}
      ]'::jsonb
    );
    
    -- Dor (EVA)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_shoulder_category_id,
      'Dor (EVA)',
      'scale',
      'pontos',
      0,
      10,
      true,
      5,
      'Escala Visual Analógica de Dor'
    );
    
    -- Força de Rotadores Externos
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_shoulder_category_id,
      'Força de Rotadores Externos',
      'scale',
      'grau',
      0,
      5,
      false,
      6,
      'Escala de força muscular de Oxford'
    );
  END IF;
END $$;

-- ============================================================================
-- 4. TEMPLATES DE AVALIAÇÃO - ENTORSE DE TORNOZELO
-- ============================================================================

DO $$
DECLARE
  v_ankle_category_id UUID;
BEGIN
  SELECT id INTO v_ankle_category_id 
  FROM clinical_case_categories 
  WHERE name = 'Entorse de Tornozelo' AND is_system_default = true
  LIMIT 1;
  
  IF v_ankle_category_id IS NOT NULL THEN
    -- Amplitude de Dorsiflexão
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_ankle_category_id,
      'Amplitude de Dorsiflexão',
      'angle',
      'graus',
      0,
      30,
      true,
      1,
      'Medição com goniômetro ou inclinômetro'
    );
    
    -- Teste de Gaveta Anterior do Tornozelo
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_ankle_category_id,
      'Teste de Gaveta Anterior',
      'select',
      NULL,
      NULL,
      NULL,
      true,
      2,
      'Avaliação da estabilidade do ligamento talofibular anterior',
      '[
        {"label": "Negativo", "value": "negative"},
        {"label": "Positivo +", "value": "positive_1"},
        {"label": "Positivo ++", "value": "positive_2"}
      ]'::jsonb
    );
    
    -- Edema (circunferência)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_ankle_category_id,
      'Edema (circunferência)',
      'number',
      'cm',
      15,
      40,
      false,
      3,
      'Medição na região do maléolo'
    );
    
    -- Dor (EVA)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_ankle_category_id,
      'Dor (EVA)',
      'scale',
      'pontos',
      0,
      10,
      true,
      4,
      'Escala Visual Analógica de Dor'
    );
    
    -- Balance Test (apoio unipodal)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_ankle_category_id,
      'Balance Test (apoio unipodal)',
      'number',
      'segundos',
      0,
      60,
      false,
      5,
      'Tempo de manutenção do equilíbrio unipodal'
    );
  END IF;
END $$;

-- ============================================================================
-- 5. TEMPLATES DE AVALIAÇÃO - LOMBALGIA
-- ============================================================================

DO $$
DECLARE
  v_lombalgia_category_id UUID;
BEGIN
  SELECT id INTO v_lombalgia_category_id 
  FROM clinical_case_categories 
  WHERE name = 'Lombalgia' AND is_system_default = true
  LIMIT 1;
  
  IF v_lombalgia_category_id IS NOT NULL THEN
    -- Dor (EVA)
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lombalgia_category_id,
      'Dor (EVA)',
      'scale',
      'pontos',
      0,
      10,
      true,
      1,
      'Escala Visual Analógica de Dor'
    );
    
    -- Teste de Schober
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lombalgia_category_id,
      'Teste de Schober',
      'number',
      'cm',
      10,
      25,
      true,
      2,
      'Avaliação da mobilidade lombar (valor normal: >15cm)'
    );
    
    -- Teste de Elevação da Perna Estendida
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text, options)
    VALUES (
      v_lombalgia_category_id,
      'Teste de Elevação da Perna Estendida',
      'select',
      NULL,
      NULL,
      NULL,
      true,
      3,
      'Teste de Lasègue para irritação radicular',
      '[
        {"label": "Negativo", "value": "negative"},
        {"label": "Positivo (< 30°)", "value": "positive_severe"},
        {"label": "Positivo (30-70°)", "value": "positive_moderate"},
        {"label": "Positivo (> 70°)", "value": "positive_mild"}
      ]'::jsonb
    );
    
    -- Força de Extensores Lombares
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lombalgia_category_id,
      'Força de Extensores Lombares',
      'scale',
      'grau',
      0,
      5,
      false,
      4,
      'Escala de força muscular de Oxford'
    );
    
    -- Amplitude de Flexão Lombar
    INSERT INTO assessment_templates (category_id, name, field_type, unit, min_value, max_value, is_required, display_order, help_text)
    VALUES (
      v_lombalgia_category_id,
      'Amplitude de Flexão Lombar',
      'angle',
      'graus',
      0,
      90,
      false,
      5,
      'Medição com inclinômetro ou observação clínica'
    );
  END IF;
END $$;

-- ============================================================================
-- FIM DO SEED
-- ============================================================================

