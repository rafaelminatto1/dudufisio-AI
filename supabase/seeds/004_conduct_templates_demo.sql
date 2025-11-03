-- ============================================================================
-- SEED 004: Templates de Conduta Fisioterapêutica
-- ============================================================================
-- Descrição: Popula a tabela conduct_templates com templates realistas
-- Data: 2025-11-03
-- Autor: DuduFisio-AI Team
-- ============================================================================

-- ⚠️ IMPORTANTE: Estes são templates genéricos (não vinculados a paciente específico)
-- São usados como base para criar novas condutas fisioterapêuticas

-- ============================================================================
-- TEMPLATES DE CONDUTA - GERAL (sem paciente específico)
-- ============================================================================

-- Template 1: Avaliação Inicial Fisioterapêutica
INSERT INTO conduct_templates (
    patient_id,
    name,
    description,
    subjective,
    objective,
    assessment,
    plan,
    tests,
    is_template,
    times_used
) VALUES (
    NULL,
    'Avaliação Inicial - Fisioterapia Geral',
    'Template padrão para primeira consulta de fisioterapia com abordagem geral',
    
    -- SUBJETIVO (S)
    'QUEIXA PRINCIPAL:
[Descrever a queixa principal do paciente]

HISTÓRICO DA DOENÇA ATUAL:
- Início dos sintomas: [data/período]
- Evolução: [descrever progressão]
- Fatores de melhora: [o que melhora]
- Fatores de piora: [o que piora]
- Tratamentos prévios: [descrever]

HISTÓRICO MÉDICO:
- Doenças pré-existentes: [listar]
- Cirurgias prévias: [listar]
- Medicamentos em uso: [listar]
- Alergias: [listar]

HISTÓRIA SOCIAL:
- Ocupação: [profissão]
- Atividades físicas: [frequência e tipo]
- AVDs afetadas: [descrever]',

    -- OBJETIVO (O)
    'INSPEÇÃO:
- Postura: [descrever alterações]
- Marcha: [normal/alterada - descrever]
- Trofismo muscular: [descrever]
- Edema: [presente/ausente - localização]

PALPAÇÃO:
- Pontos dolorosos: [localizar]
- Temperatura: [normal/aumentada]
- Tensão muscular: [descrever]

AMPLITUDE DE MOVIMENTO:
- [Articulação]: [graus] (Normal: [referência])
- [Articulação]: [graus] (Normal: [referência])

FORÇA MUSCULAR (0-5):
- [Grupo muscular]: [grau]
- [Grupo muscular]: [grau]

TESTES ESPECIAIS:
- [Nome do teste]: [Positivo/Negativo]
- [Nome do teste]: [Positivo/Negativo]

AVALIAÇÃO DA DOR:
- EVA: [0-10]
- Localização: [descrever]
- Característica: [aguda/crônica/latejante/etc]',

    -- AVALIAÇÃO (A)
    'DIAGNÓSTICO CINÉTICO-FUNCIONAL:
[Descrever diagnóstico fisioterapêutico]

PROBLEMAS IDENTIFICADOS:
1. [Problema principal]
2. [Problema secundário]
3. [Outros problemas]

PROGNÓSTICO:
- Estimativa de recuperação: [bom/regular/reservado]
- Tempo estimado: [X semanas/meses]
- Fatores limitantes: [listar se houver]

OBJETIVOS DO TRATAMENTO:
Curto prazo (2-4 semanas):
- [Objetivo mensurável]
- [Objetivo mensurável]

Longo prazo (2-3 meses):
- [Objetivo mensurável]
- [Objetivo mensurável]',

    -- PLANO (P)
    'CONDUTA FISIOTERAPÊUTICA:

RECURSOS:
- [Recurso 1]: [frequência e parâmetros]
- [Recurso 2]: [frequência e parâmetros]
- [Recurso 3]: [frequência e parâmetros]

EXERCÍCIOS TERAPÊUTICOS:
1. [Exercício 1]: [séries x repetições]
2. [Exercício 2]: [séries x repetições]
3. [Exercício 3]: [séries x repetições]

ORIENTAÇÕES:
- [Orientação 1]
- [Orientação 2]
- [Cuidados e precauções]

FREQUÊNCIA:
- [X] sessões por semana
- Duração: [X] minutos por sessão

REAVALIAÇÃO:
- Próxima avaliação em: [X] semanas',

    -- Testes comuns
    '[
        {"name": "Avaliação Postural", "category": "Postural"},
        {"name": "Goniometria", "category": "ADM"},
        {"name": "Teste de Força Muscular Manual", "category": "Força"},
        {"name": "Escala Visual Analógica (EVA)", "category": "Dor"},
        {"name": "Avaliação da Marcha", "category": "Funcional"}
    ]'::jsonb,
    
    true, -- is_template
    0     -- times_used
);

-- Template 2: Evolução de Sessão - Reabilitação Ortopédica
INSERT INTO conduct_templates (
    patient_id,
    name,
    description,
    subjective,
    objective,
    assessment,
    plan,
    tests,
    is_template,
    times_used
) VALUES (
    NULL,
    'Evolução - Reabilitação Ortopédica',
    'Template para sessões de acompanhamento em casos ortopédicos',
    
    -- SUBJETIVO (S)
    'RELATO DO PACIENTE:
- Como passou desde a última sessão: [relato]
- Dor atual (EVA 0-10): [número]
- Atividades realizadas: [descrever]
- Dificuldades encontradas: [descrever]
- Adesão ao tratamento domiciliar: [boa/regular/baixa]
- Uso de medicação: [sim/não - qual]',

    -- OBJETIVO (O)
    'OBSERVAÇÕES DA SESSÃO:

INSPEÇÃO:
- Edema: [ausente/leve/moderado/intenso]
- Coloração: [normal/hiperemiado]
- Postura: [melhorou/mantida/piorou]

ADM ATIVA:
- [Movimento]: [graus] (Anterior: [graus])
- [Movimento]: [graus] (Anterior: [graus])

FORÇA:
- [Grupo muscular]: [0-5] (Anterior: [valor])

FUNCIONALIDADE:
- [AVD testada]: [capaz/dificuldade/incapaz]

RECURSOS UTILIZADOS:
- [Recurso]: [parâmetros e tempo]
- [Recurso]: [parâmetros e tempo]',

    -- AVALIAÇÃO (A)
    'ANÁLISE DA EVOLUÇÃO:

PROGRESSO:
- [Aspecto melhorado]
- [Aspecto melhorado]

ESTAGNAÇÃO/PIORA:
- [Se houver, descrever]

COMPARAÇÃO COM OBJETIVOS:
- Objetivo 1: [atingido/em progresso/não atingido]
- Objetivo 2: [atingido/em progresso/não atingido]

REAVALIAÇÃO DO PROGNÓSTICO:
- [Mantido/Melhor que esperado/Pior que esperado]
- Justificativa: [explicar]',

    -- PLANO (P)
    'CONDUTA PARA PRÓXIMA SESSÃO:

MANTER:
- [Recurso/exercício que está funcionando]
- [Recurso/exercício que está funcionando]

MODIFICAR:
- [O que será alterado e por quê]
- [O que será alterado e por quê]

ADICIONAR:
- [Novo recurso/exercício]
- [Progressão de carga/complexidade]

ORIENTAÇÕES REFORÇADAS:
- [Orientação importante]
- [Cuidado específico]

PRÓXIMA SESSÃO:
- Data prevista: [data]
- Foco: [aspecto a ser trabalhado]',

    '[
        {"name": "ADM Ativa", "category": "Mobilidade"},
        {"name": "Força Muscular", "category": "Força"},
        {"name": "EVA Dor", "category": "Dor"},
        {"name": "Teste Funcional", "category": "Funcional"}
    ]'::jsonb,
    
    true,
    0
);

-- Template 3: Alta Fisioterapêutica
INSERT INTO conduct_templates (
    patient_id,
    name,
    description,
    subjective,
    objective,
    assessment,
    plan,
    tests,
    is_template,
    times_used
) VALUES (
    NULL,
    'Alta Fisioterapêutica',
    'Template para documentar alta do tratamento fisioterapêutico',
    
    -- SUBJETIVO (S)
    'QUEIXA INICIAL:
[Resumir queixa que trouxe o paciente]

PERÍODO DE TRATAMENTO:
- Data inicial: [data]
- Data final: [data]
- Total de sessões: [número]

RELATO FINAL DO PACIENTE:
[Descrever como paciente se sente ao final do tratamento]',

    -- OBJETIVO (O)
    'COMPARAÇÃO INICIAL vs FINAL:

DOR:
- Inicial: EVA [número]
- Final: EVA [número]
- Redução: [percentual]%

AMPLITUDE DE MOVIMENTO:
- [Movimento]: Inicial [graus] → Final [graus]
- [Movimento]: Inicial [graus] → Final [graus]

FORÇA MUSCULAR:
- [Grupo]: Inicial [grau] → Final [grau]
- [Grupo]: Inicial [grau] → Final [grau]

FUNCIONALIDADE:
- [AVD]: Inicial [status] → Final [capaz/independente]
- [AVD]: Inicial [status] → Final [capaz/independente]

TESTES ESPECIAIS:
- [Teste]: Inicial [resultado] → Final [resultado]',

    -- AVALIAÇÃO (A)
    'ANÁLISE DOS RESULTADOS:

OBJETIVOS ATINGIDOS:
✓ [Objetivo 1] - ATINGIDO
✓ [Objetivo 2] - ATINGIDO
✓ [Objetivo 3] - ATINGIDO

OBJETIVOS PARCIALMENTE ATINGIDOS:
[Se houver, listar e justificar]

GANHOS FUNCIONAIS:
- [Ganho 1]
- [Ganho 2]
- [Ganho 3]

RESULTADO GERAL DO TRATAMENTO:
[Excelente/Ótimo/Bom/Regular - justificar]',

    -- PLANO (P)
    'ORIENTAÇÕES DE ALTA:

EXERCÍCIOS DOMICILIARES:
1. [Exercício]: [frequência] - [objetivo]
2. [Exercício]: [frequência] - [objetivo]
3. [Exercício]: [frequência] - [objetivo]

CUIDADOS E PRECAUÇÕES:
- [Orientação de segurança]
- [O que evitar]
- [Sinais de alerta]

ATIVIDADES RECOMENDADAS:
- [Atividade física sugerida]
- [Frequência recomendada]

RETORNO:
- Retorno se necessário: [condição para retornar]
- Retorno preventivo em: [período sugerido]

ENCAMINHAMENTOS:
[Se houver, descrever para qual profissional e motivo]

PROGNÓSTICO A LONGO PRAZO:
[Expectativa de manutenção dos ganhos]',

    '[
        {"name": "Reavaliação Final Completa", "category": "Geral"},
        {"name": "Testes Funcionais", "category": "Funcional"},
        {"name": "Satisfação do Paciente", "category": "Qualitativo"}
    ]'::jsonb,
    
    true,
    0
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count FROM conduct_templates WHERE is_template = true;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de templates criados: %', template_count;
    RAISE NOTICE '============================================';
END $$;

-- Listar templates criados
SELECT 
    id,
    name as nome_template,
    description as descricao,
    LENGTH(subjective) as tamanho_subjetivo,
    LENGTH(objective) as tamanho_objetivo,
    LENGTH(assessment) as tamanho_avaliacao,
    LENGTH(plan) as tamanho_plano,
    times_used as vezes_usado,
    created_at
FROM conduct_templates
WHERE is_template = true
ORDER BY name;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON COLUMN conduct_templates.name IS 'Nome descritivo do template';
COMMENT ON COLUMN conduct_templates.description IS 'Descrição do propósito e uso do template';
COMMENT ON COLUMN conduct_templates.is_template IS 'true para templates reutilizáveis, false para condutas de sessões específicas';
COMMENT ON COLUMN conduct_templates.times_used IS 'Contador de quantas vezes o template foi utilizado';
COMMENT ON COLUMN conduct_templates.patient_id IS 'NULL para templates gerais, UUID para condutas específicas de paciente';

