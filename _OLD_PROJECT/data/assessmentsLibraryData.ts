// data/assessmentsLibraryData.ts
// Biblioteca de Avaliações Especializadas - 30+ avaliações validadas

export const SPECIALIZED_ASSESSMENTS = [
  // ============================================
  // ESCALAS DE DOR E FUNÇÃO (12 avaliações)
  // ============================================
  {
    id: 'assess-pain-001',
    title: 'Escala Visual Analógica de Dor (EVA)',
    description: 'Escala unidimensional para mensuração da intensidade subjetiva da dor.',
    purpose: 'Quantificar a intensidade da dor do paciente de 0 (sem dor) a 10 (pior dor imaginável).',
    specialty: 'geriatrica',
    duration: '2-3 minutos',
    targetPopulation: 'Pacientes com dor aguda ou crônica, adultos e idosos',
    scoringCriteria: [
      { parameter: 'Intensidade da Dor', scoring: '0-10', interpretation: '0=sem dor, 1-3=leve, 4-6=moderada, 7-9=severa, 10=insuportável' }
    ],
    interpretationGuidelines: {
      '0': 'Sem dor',
      '1-3': 'Dor leve - não interfere com atividades',
      '4-6': 'Dor moderada - interfere parcialmente com atividades',
      '7-9': 'Dor severa - interfere significativamente',
      '10': 'Pior dor imaginável'
    },
    recommendedProtocols: ['protocol-ort-003', 'protocol-ort-002'],
    tags: ['dor', 'avaliação', 'EVA', 'intensidade']
  },
  {
    id: 'assess-pain-002',
    title: 'Questionário de Incapacidade de Roland-Morris',
    description: 'Questionário de 24 itens para avaliação de incapacidade relacionada à lombalgia.',
    purpose: 'Avaliar o impacto da dor lombar nas atividades de vida diária.',
    specialty: 'pos-operatoria',
    duration: '5-10 minutos',
    targetPopulation: 'Pacientes com lombalgia aguda ou crônica',
    scoringCriteria: [
      { parameter: 'Total de itens afirmativos', scoring: '0-24 pontos', interpretation: 'Quanto maior, maior a incapacidade' }
    ],
    interpretationGuidelines: {
      '0-4': 'Incapacidade mínima',
      '5-14': 'Incapacidade moderada',
      '15-24': 'Incapacidade severa'
    },
    recommendedProtocols: ['protocol-ort-003', 'protocol-ort-018'],
    tags: ['lombalgia', 'incapacidade', 'funcional', 'Roland-Morris']
  },
  {
    id: 'assess-pain-003',
    title: 'Índice de Incapacidade de Oswestry (ODI)',
    description: 'Questionário de 10 seções para avaliação de dor lombar e incapacidade.',
    purpose: 'Mensurar o grau de incapacidade funcional causada por lombalgia crônica.',
    specialty: 'pos-operatoria',
    duration: '5-7 minutos',
    targetPopulation: 'Pacientes com lombalgia crônica',
    scoringCriteria: [
      { parameter: 'Pontuação total', scoring: '0-50 pontos (% de incapacidade)', interpretation: 'Score x 2 = % incapacidade' }
    ],
    interpretationGuidelines: {
      '0-20%': 'Incapacidade mínima',
      '21-40%': 'Incapacidade moderada',
      '41-60%': 'Incapacidade severa',
      '61-80%': 'Incapacidade muito severa',
      '81-100%': 'Paciente acamado ou exagerando sintomas'
    },
    recommendedProtocols: ['protocol-ort-003', 'protocol-ort-018', 'protocol-ort-019'],
    tags: ['lombar', 'incapacidade', 'ODI', 'crônica']
  },
  {
    id: 'assess-pain-004',
    title: 'WOMAC - Osteoartrite de Joelho e Quadril',
    description: 'Questionário de 24 itens sobre dor, rigidez e função física em OA.',
    purpose: 'Avaliar sintomas e limitação funcional em pacientes com osteoartrite.',
    specialty: 'geriatrica',
    duration: '10-15 minutos',
    targetPopulation: 'Pacientes com osteoartrite de joelho ou quadril',
    scoringCriteria: [
      { parameter: 'Dor', scoring: '0-20 pontos', interpretation: '5 questões sobre dor' },
      { parameter: 'Rigidez', scoring: '0-8 pontos', interpretation: '2 questões sobre rigidez' },
      { parameter: 'Função', scoring: '0-68 pontos', interpretation: '17 questões sobre atividades' }
    ],
    interpretationGuidelines: {
      'Total': 'Somar todas seções. Quanto maior, pior a condição',
      'Melhora clínica': 'Redução >20% considerada clinicamente significativa'
    },
    recommendedProtocols: ['protocol-ort-020'],
    tags: ['osteoartrite', 'WOMAC', 'joelho', 'quadril', 'função']
  },
  {
    id: 'assess-pain-005',
    title: 'DASH - Disabilities of Arm, Shoulder and Hand',
    description: 'Questionário de 30 itens para avaliação funcional de membros superiores.',
    purpose: 'Mensurar capacidade funcional e sintomas em condições de membros superiores.',
    specialty: 'pos-operatoria',
    duration: '10-12 minutos',
    targetPopulation: 'Pacientes com condições de ombro, cotovelo, punho ou mão',
    scoringCriteria: [
      { parameter: 'Score DASH', scoring: '0-100 pontos', interpretation: 'Quanto maior, maior a incapacidade' }
    ],
    interpretationGuidelines: {
      '0-24': 'Incapacidade leve',
      '25-49': 'Incapacidade moderada',
      '50-100': 'Incapacidade severa',
      'MCID': 'Diferença mínima clinicamente importante = 10 pontos'
    },
    recommendedProtocols: ['protocol-ort-002', 'protocol-ort-011', 'protocol-ort-015'],
    tags: ['DASH', 'membro superior', 'ombro', 'punho', 'mão']
  },

  // ============================================
  // TESTES FUNCIONAIS (10 avaliações)
  // ============================================
  {
    id: 'assess-func-001',
    title: 'Teste de Caminhada de 6 Minutos (TC6)',
    description: 'Avaliação submáxima de capacidade funcional e resistência aeróbica.',
    purpose: 'Mensurar distância percorrida em 6 minutos de caminhada.',
    specialty: 'geriatrica',
    duration: '10-15 minutos (incluindo preparo)',
    targetPopulation: 'Idosos, pacientes cardiorrespiratórios, pré/pós-operatório',
    scoringCriteria: [
      { parameter: 'Distância percorrida', scoring: 'Metros', interpretation: 'Comparar com valores de referência para idade/sexo' }
    ],
    interpretationGuidelines: {
      'Normal': '>400m para idosos, >600m para adultos',
      'Comprometimento leve': '300-400m',
      'Comprometimento moderado': '200-300m',
      'Comprometimento severo': '<200m',
      'MCID': '50 metros = mudança clinicamente significativa'
    },
    recommendedProtocols: [],
    tags: ['capacidade funcional', 'resistência', 'caminhada', 'TC6']
  },
  {
    id: 'assess-func-002',
    title: 'Timed Up and Go (TUG)',
    description: 'Teste de mobilidade funcional e rastreio de risco de quedas.',
    purpose: 'Avaliar mobilidade, equilíbrio e risco de quedas em idosos.',
    specialty: 'geriatrica',
    duration: '2-3 minutos',
    targetPopulation: 'Idosos acima de 65 anos, pacientes com risco de quedas',
    scoringCriteria: [
      { parameter: 'Tempo para completar', scoring: 'Segundos', interpretation: 'Levantar, caminhar 3m, girar, voltar, sentar' }
    ],
    interpretationGuidelines: {
      '<10s': 'Normal para adultos saudáveis',
      '10-20s': 'Normal para idosos frágeis ou com déficit',
      '20-30s': 'Mobilidade limitada, risco de quedas',
      '>30s': 'Alto risco de quedas, dependência em mobilidade'
    },
    recommendedProtocols: [],
    tags: ['TUG', 'mobilidade', 'quedas', 'equilíbrio', 'idoso']
  },
  {
    id: 'assess-func-003',
    title: 'Escala de Equilíbrio de Berg',
    description: 'Avaliação de equilíbrio funcional com 14 tarefas de complexidade crescente.',
    purpose: 'Avaliar equilíbrio estático e dinâmico em diferentes contextos funcionais.',
    specialty: 'geriatrica',
    duration: '15-20 minutos',
    targetPopulation: 'Idosos, pacientes neurológicos, risco de quedas',
    scoringCriteria: [
      { parameter: 'Pontuação total', scoring: '0-56 pontos (4 pontos por tarefa)', interpretation: 'Quanto maior, melhor o equilíbrio' }
    ],
    interpretationGuidelines: {
      '0-20': 'Alto risco de quedas, requer cadeira de rodas',
      '21-40': 'Risco moderado de quedas, requer dispositivo auxiliar',
      '41-56': 'Baixo risco de quedas, independente',
      'Ponto de corte': '<45 pontos indica risco aumentado de quedas'
    },
    recommendedProtocols: [],
    tags: ['Berg', 'equilíbrio', 'quedas', 'funcional']
  },
  {
    id: 'assess-func-004',
    title: 'Hop Tests para Joelho (Bateria de Saltos)',
    description: 'Série de 4 testes de salto para avaliar função de joelho.',
    purpose: 'Avaliar força, potência e simetria de membros inferiores.',
    specialty: 'esportiva',
    duration: '15-20 minutos',
    targetPopulation: 'Atletas, pós-LCA, retorno ao esporte',
    scoringCriteria: [
      { parameter: 'Single Hop', scoring: 'Distância em cm', interpretation: 'LSI >90%' },
      { parameter: 'Triple Hop', scoring: 'Distância em cm', interpretation: 'LSI >90%' },
      { parameter: 'Crossover Hop', scoring: 'Distância em cm', interpretation: 'LSI >90%' },
      { parameter: '6m Timed Hop', scoring: 'Tempo em segundos', interpretation: 'LSI >90%' }
    ],
    interpretationGuidelines: {
      'LSI >90%': 'Simetria adequada para retorno ao esporte',
      'LSI 80-90%': 'Continuar fortalecimento antes retorno',
      'LSI <80%': 'Déficit significativo, não liberar para esporte',
      'Fórmula LSI': '(Perna operada / Perna sadia) x 100'
    },
    recommendedProtocols: ['protocol-sport-001', 'protocol-ort-001'],
    tags: ['hop test', 'joelho', 'LCA', 'retorno ao esporte', 'LSI']
  },
  {
    id: 'assess-func-005',
    title: 'Teste de Sentar e Levantar 5x (5x Sit-to-Stand)',
    description: 'Teste de força funcional de membros inferiores.',
    purpose: 'Avaliar força, potência e resistência de MMII em tarefa funcional.',
    specialty: 'geriatrica',
    duration: '3-5 minutos',
    targetPopulation: 'Idosos, pacientes pós-cirurgia de MMII, pacientes neurológicos',
    scoringCriteria: [
      { parameter: 'Tempo para 5 repetições', scoring: 'Segundos', interpretation: 'Quanto menor, melhor a performance' }
    ],
    interpretationGuidelines: {
      '<11s': 'Normal para adultos jovens',
      '11-13s': 'Normal para idosos ativos',
      '14-19s': 'Performance reduzida, fragilidade',
      '>19s': 'Alto risco de quedas e dependência'
    },
    recommendedProtocols: [],
    tags: ['força', 'funcional', 'MMII', 'sentar-levantar', 'idoso']
  },
  {
    id: 'assess-pain-006',
    title: 'Escala Numérica de Dor (END)',
    description: 'Escala numérica de 0-10 para avaliação de dor.',
    purpose: 'Quantificar dor de forma simples e rápida.',
    specialty: 'geriatrica',
    duration: '1 minuto',
    targetPopulation: 'Todos pacientes com dor',
    scoringCriteria: [
      { parameter: 'Dor atual', scoring: '0-10', interpretation: 'Intensidade da dor agora' },
      { parameter: 'Dor média última semana', scoring: '0-10', interpretation: 'Média da semana' },
      { parameter: 'Pior dor última semana', scoring: '0-10', interpretation: 'Pico de dor' }
    ],
    interpretationGuidelines: {
      '0': 'Sem dor',
      '1-3': 'Dor leve',
      '4-6': 'Dor moderada',
      '7-10': 'Dor severa',
      'MCID': 'Redução de 2 pontos = melhora clinicamente importante'
    },
    recommendedProtocols: [],
    tags: ['dor', 'END', 'avaliação', 'rápida']
  },
  {
    id: 'assess-pain-007',
    title: 'Questionário McGill de Dor',
    description: 'Avaliação multidimensional da experiência dolorosa.',
    purpose: 'Avaliar qualidade, intensidade e dimensão afetiva da dor.',
    specialty: 'pos-operatoria',
    duration: '10-15 minutos',
    targetPopulation: 'Pacientes com dor crônica complexa',
    scoringCriteria: [
      { parameter: 'Sensorial', scoring: '0-42', interpretation: 'Qualidade sensorial da dor' },
      { parameter: 'Afetivo', scoring: '0-14', interpretation: 'Componente emocional' },
      { parameter: 'Avaliativo', scoring: '0-5', interpretation: 'Avaliação geral' },
      { parameter: 'Miscelânea', scoring: '0-17', interpretation: 'Outros descritores' }
    ],
    interpretationGuidelines: {
      'Total': 'Soma de todas dimensões (0-78)',
      'Uso': 'Identificar características da dor para tratamento direcionado'
    },
    recommendedProtocols: ['protocol-ort-003'],
    tags: ['dor', 'McGill', 'multidimensional', 'crônica']
  },
  {
    id: 'assess-pain-008',
    title: 'FABQ - Fear-Avoidance Beliefs Questionnaire',
    description: 'Questionário sobre crenças de medo-evitação relacionadas à dor.',
    purpose: 'Identificar crenças de medo sobre atividade física e trabalho.',
    specialty: 'pos-operatoria',
    duration: '5-7 minutos',
    targetPopulation: 'Pacientes com lombalgia crônica, cinesiofobia',
    scoringCriteria: [
      { parameter: 'FABQ-PA (Atividade Física)', scoring: '0-24', interpretation: 'Medo de atividade física' },
      { parameter: 'FABQ-W (Trabalho)', scoring: '0-42', interpretation: 'Medo relacionado ao trabalho' }
    ],
    interpretationGuidelines: {
      'FABQ-PA >15': 'Alto medo de atividade física',
      'FABQ-W >34': 'Alto medo relacionado ao trabalho',
      'Impacto': 'Scores altos predizem pior prognóstico e cronificação'
    },
    recommendedProtocols: ['protocol-ort-003'],
    tags: ['medo', 'evitação', 'lombalgia', 'psicossocial', 'FABQ']
  },
  {
    id: 'assess-shoulder-001',
    title: 'SPADI - Shoulder Pain and Disability Index',
    description: 'Questionário de 13 itens sobre dor e incapacidade do ombro.',
    purpose: 'Avaliar dor e função em condições de ombro.',
    specialty: 'pos-operatoria',
    duration: '5-10 minutos',
    targetPopulation: 'Pacientes com condições de ombro',
    scoringCriteria: [
      { parameter: 'Dor', scoring: '0-50', interpretation: '5 questões sobre dor' },
      { parameter: 'Incapacidade', scoring: '0-80', interpretation: '8 questões sobre função' }
    ],
    interpretationGuidelines: {
      'Score total': '(Soma / 130) x 100 = % incapacidade',
      'MCID': 'Mudança de 10-13 pontos é clinicamente significativa'
    },
    recommendedProtocols: ['protocol-ort-002', 'protocol-ort-016', 'protocol-ort-017'],
    tags: ['ombro', 'SPADI', 'dor', 'incapacidade']
  },
  {
    id: 'assess-neck-001',
    title: 'NDI - Neck Disability Index',
    description: 'Questionário de 10 itens para incapacidade cervical.',
    purpose: 'Avaliar impacto da dor cervical nas atividades diárias.',
    specialty: 'pos-operatoria',
    duration: '5 minutos',
    targetPopulation: 'Pacientes com cervicalgia',
    scoringCriteria: [
      { parameter: 'Score total', scoring: '0-50 pontos', interpretation: 'Soma dos 10 itens' }
    ],
    interpretationGuidelines: {
      '0-4': 'Sem incapacidade',
      '5-14': 'Incapacidade leve',
      '15-24': 'Incapacidade moderada',
      '25-34': 'Incapacidade severa',
      '>34': 'Incapacidade completa'
    },
    recommendedProtocols: ['protocol-ort-010'],
    tags: ['cervical', 'NDI', 'pescoço', 'incapacidade']
  },
  {
    id: 'assess-hand-001',
    title: 'Boston Carpal Tunnel Questionnaire',
    description: 'Questionário específico para síndrome do túnel do carpo.',
    purpose: 'Avaliar sintomas e função na síndrome do túnel do carpo.',
    specialty: 'pos-operatoria',
    duration: '5-7 minutos',
    targetPopulation: 'Pacientes com síndrome do túnel do carpo',
    scoringCriteria: [
      { parameter: 'Severidade dos sintomas', scoring: '1-5 (11 questões)', interpretation: 'Média das questões' },
      { parameter: 'Status funcional', scoring: '1-5 (8 questões)', interpretation: 'Média das questões' }
    ],
    interpretationGuidelines: {
      '1-2': 'Sintomas/incapacidade leve',
      '2-3': 'Moderada',
      '3-4': 'Severa',
      '>4': 'Muito severa',
      'MCID': 'Mudança de 1 ponto é clinicamente significativa'
    },
    recommendedProtocols: ['protocol-ort-012'],
    tags: ['túnel do carpo', 'punho', 'mão', 'neuropatia']
  },
  {
    id: 'assess-func-006',
    title: 'Single Leg Squat Test',
    description: 'Avaliação qualitativa de controle neuromuscular de membro inferior.',
    purpose: 'Identificar déficits de controle, força e estabilidade.',
    specialty: 'esportiva',
    duration: '5 minutos',
    targetPopulation: 'Atletas, pós-lesão de joelho, avaliação pré-participação',
    scoringCriteria: [
      { parameter: 'Alinhamento de joelho', scoring: 'Bom/Moderado/Ruim', interpretation: 'Valgo, varo, controle' },
      { parameter: 'Estabilidade de tronco', scoring: 'Bom/Moderado/Ruim', interpretation: 'Inclinação, rotação' },
      { parameter: 'Equilíbrio', scoring: 'Bom/Moderado/Ruim', interpretation: 'Oscilações, perda de equilíbrio' }
    ],
    interpretationGuidelines: {
      'Bom': 'Controle adequado em todos parâmetros',
      'Moderado': '1-2 compensações leves',
      'Ruim': 'Múltiplas compensações, risco de lesão',
      'Indicação': 'Score ruim requer fortalecimento de quadril e core'
    },
    recommendedProtocols: ['protocol-ort-005', 'protocol-sport-001'],
    tags: ['agachamento unilateral', 'controle motor', 'joelho', 'qualitativo']
  },
  {
    id: 'assess-func-007',
    title: 'Teste de Força de Preensão (Hand Grip Strength)',
    description: 'Mensuração objetiva de força de pegada com dinamômetro.',
    purpose: 'Avaliar força de preensão palmar e rastrear sarcopenia.',
    specialty: 'geriatrica',
    duration: '5 minutos',
    targetPopulation: 'Idosos, pós-fratura de punho, atletas, avaliação geral',
    scoringCriteria: [
      { parameter: 'Força máxima', scoring: 'Kg ou libras', interpretation: 'Média de 3 tentativas de cada mão' }
    ],
    interpretationGuidelines: {
      'Homens >27kg / Mulheres >16kg': 'Normal',
      'Homens <27kg / Mulheres <16kg': 'Risco de sarcopenia',
      'Simetria': 'Diferença <10% entre lados é normal',
      'Uso clínico': 'Preditor de fragilidade e mortalidade em idosos'
    },
    recommendedProtocols: ['protocol-ort-015'],
    tags: ['força', 'pegada', 'mão', 'sarcopenia', 'dinamômetro']
  },
  {
    id: 'assess-func-008',
    title: 'Y-Balance Test (Anterior Reach)',
    description: 'Teste de equilíbrio dinâmico e alcance anterior.',
    purpose: 'Avaliar equilíbrio, flexibilidade e controle neuromuscular.',
    specialty: 'esportiva',
    duration: '10 minutos',
    targetPopulation: 'Atletas, prevenção de lesões, rastreio',
    scoringCriteria: [
      { parameter: 'Alcance anterior', scoring: 'Centímetros', interpretation: 'Distância máxima alcançada' },
      { parameter: 'Alcance posteromedial', scoring: 'Centímetros', interpretation: 'Direção PM' },
      { parameter: 'Alcance posterolateral', scoring: 'Centímetros', interpretation: 'Direção PL' }
    ],
    interpretationGuidelines: {
      'Assimetria >4cm': 'Risco aumentado de lesão',
      'Alcance <89% altura membro': 'Déficit de mobilidade/equilíbrio',
      'Uso': 'Identificar assimetrias e déficits antes de ocorrer lesão'
    },
    recommendedProtocols: [],
    tags: ['Y-balance', 'equilíbrio', 'prevenção', 'assimetria']
  },

  // ============================================
  // AVALIAÇÕES ESPECIALIZADAS (8+ avaliações)
  // ============================================
  {
    id: 'assess-spec-001',
    title: 'Avaliação Postural Completa',
    description: 'Análise sistemática da postura estática em vistas anterior, posterior e lateral.',
    purpose: 'Identificar desvios posturais e assimetrias.',
    specialty: 'pos-operatoria',
    duration: '15-20 minutos',
    targetPopulation: 'Todos pacientes, especialmente dor crônica e desvios posturais',
    scoringCriteria: [
      { parameter: 'Alinhamento frontal', scoring: 'Normal/Alterado', interpretation: 'Cabeça, ombros, pelve, MMII' },
      { parameter: 'Alinhamento sagital', scoring: 'Normal/Alterado', interpretation: 'Curvaturas, inclinação pélvica' },
      { parameter: 'Simetria', scoring: 'Simétrico/Assimétrico', interpretation: 'Comparação bilateral' }
    ],
    interpretationGuidelines: {
      'Achados comuns': 'Anteriorização de cabeça, ombros protrusos, hiperlordose lombar',
      'Relevância clínica': 'Correlacionar achados com queixas do paciente'
    },
    recommendedProtocols: ['protocol-ort-003', 'protocol-ort-010'],
    tags: ['postura', 'avaliação', 'alinhamento', 'estática']
  },
  {
    id: 'assess-spec-002',
    title: 'Avaliação de Amplitude de Movimento (Goniometria)',
    description: 'Mensuração objetiva de ADM articular com goniômetro.',
    purpose: 'Quantificar mobilidade articular e monitorar progressão.',
    specialty: 'pos-operatoria',
    duration: '10-30 minutos dependendo das articulações',
    targetPopulation: 'Pós-operatório, restrições de ADM, monitoramento de progressão',
    scoringCriteria: [
      { parameter: 'ADM ativa', scoring: 'Graus', interpretation: 'Movimento realizado pelo paciente' },
      { parameter: 'ADM passiva', scoring: 'Graus', interpretation: 'Movimento realizado pelo terapeuta' },
      { parameter: 'Comparação bilateral', scoring: 'Diferença em graus', interpretation: 'Simetria' }
    ],
    interpretationGuidelines: {
      'Normal': 'Comparar com valores normativos por articulação',
      'Déficit significativo': 'Diferença >10° bilateral ou >20° do normal',
      'ADM passiva > ativa': 'Indica fraqueza ou inibição muscular',
      'ADM passiva = ativa': 'Indica restrição capsular/articular'
    },
    recommendedProtocols: [],
    tags: ['ADM', 'goniometria', 'mobilidade', 'articular']
  },
  {
    id: 'assess-spec-003',
    title: 'Teste de Força Muscular Manual (Oxford 0-5)',
    description: 'Graduação manual de força muscular segundo escala de Oxford.',
    purpose: 'Avaliar força de grupos musculares específicos.',
    specialty: 'pos-operatoria',
    duration: '10-20 minutos',
    targetPopulation: 'Pós-operatório, lesões neurológicas, fraqueza muscular',
    scoringCriteria: [
      { parameter: 'Grau 0', scoring: '0', interpretation: 'Nenhuma contração visível/palpável' },
      { parameter: 'Grau 1', scoring: '1', interpretation: 'Contração visível, sem movimento' },
      { parameter: 'Grau 2', scoring: '2', interpretation: 'Movimento completo sem gravidade' },
      { parameter: 'Grau 3', scoring: '3', interpretation: 'Movimento completo contra gravidade' },
      { parameter: 'Grau 4', scoring: '4', interpretation: 'Movimento contra gravidade e resistência moderada' },
      { parameter: 'Grau 5', scoring: '5', interpretation: 'Força normal' }
    ],
    interpretationGuidelines: {
      '<3': 'Fraqueza significativa, requer fortalecimento assistido',
      '3': 'Força antigravitacional, progresso para resistência leve',
      '4': 'Força submáxima, pode progredir',
      '5': 'Força normal'
    },
    recommendedProtocols: [],
    tags: ['força', 'Oxford', 'manual', 'graduação']
  },
  {
    id: 'assess-spec-004',
    title: 'Avaliação de Marcha (Observacional)',
    description: 'Análise sistemática dos padrões de marcha.',
    purpose: 'Identificar desvios de marcha e orientar tratamento.',
    specialty: 'geriatrica',
    duration: '10-15 minutos',
    targetPopulation: 'Pacientes neurológicos, ortopédicos, idosos',
    scoringCriteria: [
      { parameter: 'Fase de apoio', scoring: 'Normal/Alterado', interpretation: 'Contato inicial, médio apoio, propulsão' },
      { parameter: 'Fase de balanço', scoring: 'Normal/Alterado', interpretation: 'Aceleração, médio balanço, desaceleração' },
      { parameter: 'Simetria', scoring: 'Simétrico/Assimétrico', interpretation: 'Comparação bilateral' }
    ],
    interpretationGuidelines: {
      'Desvios comuns': 'Claudicação, Trendelenburg, steppage, marcha em tesoura',
      'Causas': 'Dor, fraqueza, restrição ADM, déficit neurológico'
    },
    recommendedProtocols: [],
    tags: ['marcha', 'análise', 'observacional', 'padrão']
  },
  {
    id: 'assess-spec-005',
    title: 'Testes Especiais de Ombro - Bateria Completa',
    description: 'Conjunto de testes provocativos para diagnóstico de patologias de ombro.',
    purpose: 'Identificar estruturas lesionadas no ombro através de testes clínicos.',
    specialty: 'pos-operatoria',
    duration: '15-20 minutos',
    targetPopulation: 'Pacientes com dor de ombro',
    scoringCriteria: [
      { parameter: 'Neer (impacto)', scoring: 'Positivo/Negativo', interpretation: 'Dor na elevação passiva forçada' },
      { parameter: 'Hawkins-Kennedy', scoring: 'Positivo/Negativo', interpretation: 'Dor na rotação interna forçada' },
      { parameter: 'Jobe (supraespinhal)', scoring: 'Positivo/Negativo', interpretation: 'Dor/fraqueza abdução 90°' },
      { parameter: 'Drop Arm Test', scoring: 'Positivo/Negativo', interpretation: 'Incapacidade de descer braço controladamente' },
      { parameter: 'Apprehension Test', scoring: 'Positivo/Negativo', interpretation: 'Apreensão em abd 90° + RE' }
    ],
    interpretationGuidelines: {
      'Neer + Hawkins +': 'Sugere síndrome do impacto',
      'Jobe + Drop Arm +': 'Sugere lesão de manguito rotador',
      'Apprehension +': 'Sugere instabilidade anterior',
      'Múltiplos positivos': 'Maior probabilidade de patologia'
    },
    recommendedProtocols: ['protocol-ort-002', 'protocol-ort-017'],
    tags: ['ombro', 'testes especiais', 'Neer', 'Hawkins', 'diagnóstico']
  },
  {
    id: 'assess-spec-006',
    title: 'Testes Especiais de Joelho - Bateria Completa',
    description: 'Conjunto de testes para avaliação de ligamentos e meniscos.',
    purpose: 'Diagnosticar lesões ligamentares e meniscais do joelho.',
    specialty: 'esportiva',
    duration: '15-20 minutos',
    targetPopulation: 'Suspeita de lesão de joelho, pós-trauma',
    scoringCriteria: [
      { parameter: 'Lachman (LCA)', scoring: 'Positivo/Negativo', interpretation: 'Translação anterior da tíbia' },
      { parameter: 'Gaveta Anterior', scoring: 'Positivo/Negativo', interpretation: 'Instabilidade anterior a 90°' },
      { parameter: 'Gaveta Posterior', scoring: 'Positivo/Negativo', interpretation: 'Instabilidade posterior' },
      { parameter: 'McMurray (menisco)', scoring: 'Positivo/Negativo', interpretation: 'Click/dor em rotação' },
      { parameter: 'Apley (menisco)', scoring: 'Positivo/Negativo', interpretation: 'Dor em compressão + rotação' }
    ],
    interpretationGuidelines: {
      'Lachman +': 'Alta sensibilidade para lesão de LCA',
      'McMurray + Apley +': 'Suspeita de lesão meniscal',
      'Gaveta Posterior +': 'Lesão de LCP (rara)',
      'Confirmação': 'Sempre confirmar com imagem (RM)'
    },
    recommendedProtocols: ['protocol-ort-001', 'protocol-ort-004'],
    tags: ['joelho', 'testes especiais', 'Lachman', 'McMurray', 'ligamento']
  },
  {
    id: 'assess-spec-007',
    title: 'Teste de Lasègue (Straight Leg Raise)',
    description: 'Teste provocativo para avaliar irritação do nervo ciático.',
    purpose: 'Identificar radiculopatia lombar e tensão neural.',
    specialty: 'pos-operatoria',
    duration: '5 minutos',
    targetPopulation: 'Pacientes com ciatalgia, suspeita de hérnia de disco',
    scoringCriteria: [
      { parameter: 'Ângulo de dor', scoring: 'Graus (0-90)', interpretation: 'Ângulo onde dor aparece' },
      { parameter: 'Localização da dor', scoring: 'Lombar/Glúteo/Posterior coxa/Perna', interpretation: 'Distribuição' },
      { parameter: 'Dorsiflex ão', scoring: 'Aumenta/Não altera dor', interpretation: 'Sinal de Bragard' }
    ],
    interpretationGuidelines: {
      'Positivo <60°': 'Sugere compressão radicular',
      'Positivo >60°': 'Mais provável tensão muscular',
      'Lasègue cruzado +': 'Alta especificidade para hérnia de disco',
      'Dor apenas lombar': 'Menos específico para radiculopatia'
    },
    recommendedProtocols: ['protocol-ort-018'],
    tags: ['Lasègue', 'ciático', 'radiculopatia', 'hérnia', 'SLR']
  }
];

