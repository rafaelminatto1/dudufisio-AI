import {
  Protocol,
  ProtocolCategory,
  EvidenceLevel,
  ProtocolPhase,
  ProtocolReference,
  AssessmentTool,
  OutcomeMetric,
  TreatmentPhaseDetail,
  ProtocolIntervention,
  ExerciseProtocol,
  ProgressionCriteria,
  ProtocolAnalytics,
  ProtocolLibraryStats,
  ProtocolPrescription,
  ProtocolCustomization,
  PhaseProgress,
  AssessmentResult,
  ProtocolOutcome,
  ProtocolModification
} from '../types';

export const mockProtocolReferences: ProtocolReference[] = [
  {
    id: 'ref_1',
    title: 'Rehabilitation after anterior cruciate ligament reconstruction: criteria-based progression through the return-to-sport phase',
    authors: ['Myer GD', 'Paterno MV', 'Ford KR', 'Quatman CE', 'Hewett TE'],
    journal: 'Sports Medicine',
    year: 2008,
    doi: '10.2165/00007256-200838090-00006',
    pmid: '18712942',
    evidenceLevel: EvidenceLevel.IA,
    relevanceScore: 9
  },
  {
    id: 'ref_2',
    title: 'Physical rehabilitation approaches for the recovery of function and mobility after stroke',
    authors: ['Pollock A', 'Baer G', 'Campbell P', 'Choo PL'],
    journal: 'Stroke',
    year: 2019,
    doi: '10.1161/STROKEAHA.118.023435',
    evidenceLevel: EvidenceLevel.IA,
    relevanceScore: 10
  },
  {
    id: 'ref_3',
    title: 'Clinical practice guidelines for the management of low back pain',
    authors: ['Qaseem A', 'Wilt TJ', 'McLean RM', 'Forciea MA'],
    journal: 'Annals of Internal Medicine',
    year: 2017,
    doi: '10.7326/M16-2367',
    evidenceLevel: EvidenceLevel.IA,
    relevanceScore: 9
  }
];

export const mockAssessmentTools: AssessmentTool[] = [
  {
    id: 'tool_1',
    name: 'Escala de Lysholm para Joelho',
    type: 'questionnaire',
    description: 'Questionário específico para avaliação funcional do joelho',
    instructions: 'Paciente responde 8 questões sobre sintomas e função do joelho',
    scoringCriteria: 'Pontuação de 0-100, sendo 100 a melhor função possível',
    normalValues: '≥90 pontos para indivíduos ativos',
    reliability: 0.92,
    validity: 0.89,
    minimumDetectableChange: 8.9
  },
  {
    id: 'tool_2',
    name: 'Escala de Fugl-Meyer',
    type: 'scale',
    description: 'Avaliação quantitativa da função motora pós-AVC',
    instructions: 'Avaliação de 155 itens divididos em domínios motor, sensorial, equilíbrio, amplitude de movimento e dor',
    scoringCriteria: 'Pontuação de 0-226, com subescalas específicas para cada domínio',
    normalValues: '226 pontos (função normal)',
    reliability: 0.96,
    validity: 0.94,
    minimumDetectableChange: 5.2
  },
  {
    id: 'tool_3',
    name: 'Índice de Incapacidade de Oswestry',
    type: 'questionnaire',
    description: 'Questionário para avaliação de incapacidade relacionada à dor lombar',
    instructions: 'Paciente responde 10 questões sobre atividades da vida diária',
    scoringCriteria: 'Pontuação de 0-100%, sendo 0% sem incapacidade',
    normalValues: '<20% incapacidade mínima',
    reliability: 0.90,
    validity: 0.87,
    minimumDetectableChange: 10
  }
];

export const mockOutcomeMetrics: OutcomeMetric[] = [
  {
    id: 'metric_1',
    name: 'Amplitude de Movimento - Flexão de Joelho',
    type: 'primary',
    unit: 'graus',
    expectedChange: {
      direction: 'increase',
      magnitude: 15,
      timeframe: '4 semanas'
    },
    assessmentFrequency: 'Semanal',
    clinicalSignificance: 10
  },
  {
    id: 'metric_2',
    name: 'Força Muscular - Quadríceps',
    type: 'primary',
    unit: 'Nm/kg',
    expectedChange: {
      direction: 'increase',
      magnitude: 20,
      timeframe: '8 semanas'
    },
    assessmentFrequency: 'Quinzenal',
    clinicalSignificance: 15
  },
  {
    id: 'metric_3',
    name: 'Escala Visual Analógica de Dor',
    type: 'secondary',
    unit: 'pontos (0-10)',
    expectedChange: {
      direction: 'decrease',
      magnitude: 3,
      timeframe: '2 semanas'
    },
    assessmentFrequency: 'A cada sessão',
    clinicalSignificance: 2
  }
];

export const mockProtocols: Protocol[] = [
  {
    id: 'protocol_lca_1',
    name: 'Reabilitação Pós-Cirúrgica de LCA',
    description: 'Protocolo baseado em evidências para reabilitação após reconstrução do ligamento cruzado anterior',
    category: ProtocolCategory.Orthopedic,
    subcategory: 'Joelho',
    version: '2.1',
    lastUpdated: '2024-06-15',
    createdBy: 'Dr. Roberto Silva',
    reviewedBy: ['Dra. Camila Santos', 'Dr. Fernando Costa'],
    evidenceLevel: EvidenceLevel.IA,
    references: [mockProtocolReferences[0]],
    
    // Clinical Information
    definition: 'Ruptura completa ou parcial do ligamento cruzado anterior, frequentemente associada a atividades esportivas',
    epidemiology: 'Incidência de 200.000 lesões anuais nos EUA, com 100.000-175.000 reconstruções cirúrgicas',
    inclusionCriteria: [
      'Pacientes submetidos à reconstrução primária de LCA',
      'Idade entre 16-45 anos',
      'Ausência de lesões ligamentares associadas graves',
      'Motivação para retorno ao esporte'
    ],
    exclusionCriteria: [
      'Lesões multiligamentares complexas',
      'Artrite degenerativa avançada',
      'Infecções ativas no joelho',
      'Comorbidades que impeçam a reabilitação'
    ],
    contraindications: [
      'Derrame articular significativo',
      'Sinais de infecção',
      'Dor intensa (>7/10)',
      'Instabilidade do enxerto'
    ],
    precautions: [
      'Evitar rotação com pé fixo nas primeiras 12 semanas',
      'Progressão gradual da carga',
      'Monitorar sinais de sobrecarga',
      'Atenção a sinais de re-lesão'
    ],
    
    // Assessment
    assessmentTools: [mockAssessmentTools[0]],
    outcomeMetrics: [mockOutcomeMetrics[0], mockOutcomeMetrics[1], mockOutcomeMetrics[2]],
    
    // Treatment Phases
    phases: [ProtocolPhase.Acute, ProtocolPhase.Subacute, ProtocolPhase.Chronic, ProtocolPhase.Maintenance],
    treatmentPlan: [
      {
        id: 'phase_acute_lca',
        phase: ProtocolPhase.Acute,
        name: 'Fase Aguda (0-2 semanas)',
        description: 'Controle da dor, edema e proteção do enxerto',
        duration: { min: 10, max: 14, unit: 'days' },
        objectives: [
          'Controlar dor e edema',
          'Proteger o enxerto cirúrgico',
          'Manter ADM segura',
          'Prevenir atrofia muscular'
        ],
        interventions: [
          {
            id: 'int_1',
            name: 'Crioterapia',
            type: 'modality',
            description: 'Aplicação de gelo para controle de dor e edema',
            dosage: {
              frequency: '4-6x/dia',
              duration: '15-20 minutos',
              intensity: 'Moderada',
              progression: 'Reduzir frequência conforme melhora do edema'
            },
            evidenceLevel: EvidenceLevel.IB,
            contraindications: ['Hipersensibilidade ao frio', 'Distúrbios vasculares']
          },
          {
            id: 'int_2',
            name: 'Mobilização Passiva',
            type: 'manual',
            description: 'Mobilização articular passiva para manutenção da ADM',
            dosage: {
              frequency: '2-3x/dia',
              duration: '10-15 minutos',
              intensity: 'Suave, respeitando dor',
              progression: 'Aumentar amplitude gradualmente'
            },
            evidenceLevel: EvidenceLevel.IIA,
            contraindications: ['Instabilidade do enxerto', 'Dor severa']
          }
        ],
        exerciseProgram: [
          {
            id: 'ex_1',
            exerciseId: 'quad_setting',
            exerciseName: 'Contração Isométrica de Quadríceps',
            phase: ProtocolPhase.Acute,
            sets: 3,
            repetitions: '10',
            hold: '5 segundos',
            rest: '30 segundos',
            intensity: 'Submáxima',
            frequency: '3x/dia',
            progression: [
              { week: 1, sets: 2, repetitions: '8', intensity: 'Leve', notes: 'Foco na ativação' },
              { week: 2, sets: 3, repetitions: '10', intensity: 'Moderada', notes: 'Aumentar intensidade' }
            ],
            modifications: [
              {
                condition: 'Dor durante exercício',
                modification: 'Reduzir intensidade e duração da contração',
                parameters: { sets: 2, repetitions: '5', intensity: 'Leve' }
              }
            ],
            precautions: ['Não forçar se houver dor', 'Evitar movimento do joelho']
          }
        ],
        precautions: ['Uso de órtese conforme orientação médica', 'Carga parcial com muletas'],
        progressMarkers: ['Redução do edema', 'ADM 0-90°', 'Marcha sem claudicação']
      },
      {
        id: 'phase_subacute_lca',
        phase: ProtocolPhase.Subacute,
        name: 'Fase Subaguda (3-12 semanas)',
        description: 'Restauração da ADM completa e início do fortalecimento',
        duration: { min: 6, max: 10, unit: 'weeks' },
        objectives: [
          'Restaurar ADM completa',
          'Iniciar fortalecimento progressivo',
          'Melhorar propriocepção',
          'Normalizar padrão de marcha'
        ],
        interventions: [
          {
            id: 'int_3',
            name: 'Mobilização Articular',
            type: 'manual',
            description: 'Técnicas de mobilização para ganho de ADM',
            dosage: {
              frequency: '3x/semana',
              duration: '20 minutos',
              intensity: 'Moderada a intensa',
              progression: 'Aumentar intensidade conforme tolerância'
            },
            evidenceLevel: EvidenceLevel.IB,
            contraindications: ['Instabilidade articular', 'Processo inflamatório agudo']
          }
        ],
        exerciseProgram: [
          {
            id: 'ex_2',
            exerciseId: 'leg_press',
            exerciseName: 'Leg Press (60-90°)',
            phase: ProtocolPhase.Subacute,
            sets: 3,
            repetitions: '12-15',
            rest: '60 segundos',
            intensity: '60-70% 1RM',
            frequency: '3x/semana',
            progression: [
              { week: 3, sets: 2, repetitions: '10', intensity: '40% 1RM', notes: 'Amplitude limitada 60-90°' },
              { week: 6, sets: 3, repetitions: '12', intensity: '60% 1RM', notes: 'Aumentar carga gradualmente' },
              { week: 10, sets: 3, repetitions: '15', intensity: '70% 1RM', notes: 'Amplitude completa se tolerado' }
            ],
            modifications: [
              {
                condition: 'Dor anterior no joelho',
                modification: 'Reduzir amplitude e carga',
                parameters: { intensity: '40% 1RM' }
              }
            ],
            precautions: ['Evitar hiperextensão', 'Monitorar dor e edema']
          }
        ],
        precautions: ['Evitar pivoteamento', 'Progressão baseada em critérios objetivos'],
        progressMarkers: ['ADM completa', 'Força 80% do lado contralateral', 'Marcha normal']
      }
    ],
    
    // Progression Criteria
    progressionCriteria: [
      {
        id: 'prog_1',
        fromPhase: ProtocolPhase.Acute,
        toPhase: ProtocolPhase.Subacute,
        criteria: [
          {
            type: 'objective',
            parameter: 'ADM Flexão',
            operator: '>=',
            value: 90,
            unit: 'graus',
            weight: 8
          },
          {
            type: 'objective',
            parameter: 'Edema',
            operator: '<',
            value: 2,
            unit: 'cm diferença',
            weight: 6
          },
          {
            type: 'time',
            parameter: 'Tempo pós-cirúrgico',
            operator: '>=',
            value: 14,
            unit: 'dias',
            weight: 7
          }
        ],
        timeframe: '2-3 semanas pós-cirúrgico',
        requiredAssessments: ['Goniometria', 'Perimetria', 'Avaliação da dor']
      }
    ],
    dischargeCriteria: [
      'ADM completa e simétrica',
      'Força muscular ≥90% do lado contralateral',
      'Testes funcionais normalizados',
      'Retorno às atividades desejadas sem limitações'
    ],
    
    // Implementation
    estimatedDuration: { min: 4, max: 6, unit: 'months' },
    frequency: '3x por semana inicialmente, reduzindo para 2x por semana',
    sessionDuration: 60,
    
    // Quality Metrics
    successRate: 87,
    patientSatisfaction: 4.2,
    costEffectiveness: 'Excelente - reduz tempo de retorno ao esporte em 15%',
    
    // Usage Statistics
    timesUsed: 156,
    averageOutcomes: {
      'ADM Flexão': 135,
      'Força Quadríceps': 92,
      'Lysholm Score': 88
    },
    
    // Status and Approval
    status: 'approved',
    approvedAt: '2024-06-01',
    isActive: true,
    tags: ['LCA', 'joelho', 'pós-operatório', 'esporte', 'ortopedia']
  },
  {
    id: 'protocol_avc_1',
    name: 'Reabilitação Neurológica Pós-AVC',
    description: 'Protocolo abrangente para reabilitação de pacientes com sequelas de AVC',
    category: ProtocolCategory.Neurological,
    subcategory: 'AVC',
    version: '1.8',
    lastUpdated: '2024-05-20',
    createdBy: 'Dra. Camila Santos',
    reviewedBy: ['Dr. Roberto Silva'],
    evidenceLevel: EvidenceLevel.IA,
    references: [mockProtocolReferences[1]],
    
    definition: 'Sequelas motoras, sensoriais e cognitivas decorrentes de acidente vascular cerebral',
    epidemiology: 'Principal causa de incapacidade no mundo, com incidência de 16 milhões de casos anuais',
    inclusionCriteria: [
      'Diagnóstico confirmado de AVC',
      'Estabilidade clínica',
      'Sequelas motoras ou funcionais',
      'Capacidade de participar da reabilitação'
    ],
    exclusionCriteria: [
      'Instabilidade clínica',
      'Comorbidades graves não controladas',
      'Demência severa',
      'Contraindicações médicas para exercício'
    ],
    contraindications: [
      'Pressão arterial descontrolada (>180/110 mmHg)',
      'Arritmias graves',
      'Angina instável',
      'Trombose venosa profunda ativa'
    ],
    precautions: [
      'Monitorar sinais vitais',
      'Atenção ao risco de quedas',
      'Cuidado com espasticidade',
      'Observar fadiga excessiva'
    ],
    
    assessmentTools: [mockAssessmentTools[1]],
    outcomeMetrics: [
      {
        id: 'metric_fm',
        name: 'Escala de Fugl-Meyer',
        type: 'primary',
        unit: 'pontos',
        expectedChange: {
          direction: 'increase',
          magnitude: 15,
          timeframe: '8 semanas'
        },
        assessmentFrequency: 'Mensal',
        clinicalSignificance: 5.2
      }
    ],
    
    phases: [ProtocolPhase.Acute, ProtocolPhase.Subacute, ProtocolPhase.Chronic],
    treatmentPlan: [
      {
        id: 'phase_acute_avc',
        phase: ProtocolPhase.Acute,
        name: 'Fase Aguda (0-2 semanas)',
        description: 'Prevenção de complicações e mobilização precoce',
        duration: { min: 7, max: 14, unit: 'days' },
        objectives: [
          'Prevenir complicações secundárias',
          'Manter amplitude de movimento',
          'Estimular ativação muscular',
          'Iniciar reeducação postural'
        ],
        interventions: [
          {
            id: 'int_avc_1',
            name: 'Mobilização Passiva',
            type: 'manual',
            description: 'Mobilização passiva de membros paréticos',
            dosage: {
              frequency: '2x/dia',
              duration: '15-20 minutos',
              intensity: 'Suave',
              progression: 'Aumentar amplitude conforme tolerância'
            },
            evidenceLevel: EvidenceLevel.IB,
            contraindications: ['Instabilidade hemodinâmica', 'Dor severa']
          }
        ],
        exerciseProgram: [
          {
            id: 'ex_avc_1',
            exerciseId: 'passive_rom',
            exerciseName: 'Mobilização Passiva de Ombro',
            phase: ProtocolPhase.Acute,
            sets: 2,
            repetitions: '10',
            rest: '30 segundos',
            intensity: 'Passiva',
            frequency: '2x/dia',
            progression: [
              { week: 1, sets: 2, repetitions: '8', intensity: 'Muito suave', notes: 'Respeitar dor' },
              { week: 2, sets: 2, repetitions: '10', intensity: 'Suave', notes: 'Aumentar amplitude' }
            ],
            modifications: [
              {
                condition: 'Dor no ombro',
                modification: 'Reduzir amplitude e intensidade',
                parameters: { repetitions: '5' }
              }
            ],
            precautions: ['Evitar subluxação de ombro', 'Suporte adequado do membro']
          }
        ],
        precautions: ['Monitoração contínua', 'Posicionamento adequado no leito'],
        progressMarkers: ['Estabilidade hemodinâmica', 'Tolerância à mobilização', 'Ausência de complicações']
      }
    ],
    
    progressionCriteria: [
      {
        id: 'prog_avc_1',
        fromPhase: ProtocolPhase.Acute,
        toPhase: ProtocolPhase.Subacute,
        criteria: [
          {
            type: 'objective',
            parameter: 'Estabilidade hemodinâmica',
            operator: 'stable',
            value: 'stable',
            weight: 10
          },
          {
            type: 'functional',
            parameter: 'Tolerância ao ortostatismo',
            operator: 'achieved',
            value: 'tolerado',
            weight: 8
          }
        ],
        timeframe: '1-2 semanas',
        requiredAssessments: ['Avaliação neurológica', 'Sinais vitais', 'Escala de consciência']
      }
    ],
    dischargeCriteria: [
      'Independência funcional máxima possível',
      'Segurança para atividades domiciliares',
      'Estabilidade neurológica',
      'Suporte familiar adequado'
    ],
    
    estimatedDuration: { min: 3, max: 12, unit: 'months' },
    frequency: '5x por semana inicialmente, ajustando conforme evolução',
    sessionDuration: 45,
    
    successRate: 73,
    patientSatisfaction: 4.0,
    costEffectiveness: 'Muito bom - reduz tempo de internação em 20%',
    
    timesUsed: 89,
    averageOutcomes: {
      'Fugl-Meyer': 45,
      'Berg Balance': 35,
      'Barthel Index': 65
    },
    
    status: 'approved',
    approvedAt: '2024-05-15',
    isActive: true,
    tags: ['AVC', 'neurologia', 'hemiplegia', 'reabilitação', 'mobilização']
  },
  {
    id: 'protocol_lombalgia_1',
    name: 'Tratamento de Lombalgia Crônica',
    description: 'Protocolo baseado em evidências para tratamento conservador de lombalgia crônica inespecífica',
    category: ProtocolCategory.Orthopedic,
    subcategory: 'Coluna Lombar',
    version: '3.0',
    lastUpdated: '2024-07-01',
    createdBy: 'Dr. Fernando Costa',
    reviewedBy: ['Dr. Roberto Silva', 'Dra. Camila Santos'],
    evidenceLevel: EvidenceLevel.IA,
    references: [mockProtocolReferences[2]],
    
    definition: 'Dor lombar persistente por mais de 12 semanas, sem causa específica identificável',
    epidemiology: 'Afeta 80% da população mundial, sendo a principal causa de incapacidade laboral',
    inclusionCriteria: [
      'Dor lombar ≥12 semanas',
      'Ausência de sinais de alerta (red flags)',
      'Idade entre 18-65 anos',
      'Capacidade de participar de programa de exercícios'
    ],
    exclusionCriteria: [
      'Presença de red flags',
      'Lombalgia específica (hérnia discal com déficit neurológico)',
      'Cirurgia lombar recente (<6 meses)',
      'Condições inflamatórias sistêmicas'
    ],
    contraindications: [
      'Síndrome da cauda equina',
      'Déficit neurológico progressivo',
      'Infecção espinhal',
      'Fratura vertebral aguda'
    ],
    precautions: [
      'Evitar exercícios que exacerbem a dor',
      'Progressão gradual da carga',
      'Monitorar sintomas neurológicos',
      'Atenção a fatores psicossociais'
    ],
    
    assessmentTools: [mockAssessmentTools[2]],
    outcomeMetrics: [
      {
        id: 'metric_oswestry',
        name: 'Índice de Incapacidade de Oswestry',
        type: 'primary',
        unit: 'porcentagem',
        expectedChange: {
          direction: 'decrease',
          magnitude: 15,
          timeframe: '6 semanas'
        },
        assessmentFrequency: 'Quinzenal',
        clinicalSignificance: 10
      }
    ],
    
    phases: [ProtocolPhase.Acute, ProtocolPhase.Chronic],
    treatmentPlan: [
      {
        id: 'phase_lombalgia_1',
        phase: ProtocolPhase.Acute,
        name: 'Fase Inicial (0-4 semanas)',
        description: 'Controle da dor e início da ativação muscular',
        duration: { min: 2, max: 4, unit: 'weeks' },
        objectives: [
          'Reduzir dor e incapacidade',
          'Ativar musculatura estabilizadora',
          'Melhorar mobilidade lombar',
          'Educar sobre a condição'
        ],
        interventions: [
          {
            id: 'int_lombar_1',
            name: 'Educação sobre Dor Lombar',
            type: 'education',
            description: 'Orientações sobre anatomia, fisiopatologia e prognóstico da lombalgia',
            dosage: {
              frequency: '1x/semana',
              duration: '30 minutos',
              intensity: 'Informativa',
              progression: 'Reforçar conceitos conforme necessário'
            },
            evidenceLevel: EvidenceLevel.IA,
            contraindications: ['Limitação cognitiva severa']
          }
        ],
        exerciseProgram: [
          {
            id: 'ex_lombar_1',
            exerciseId: 'dead_bug',
            exerciseName: 'Dead Bug (Ativação do Core)',
            phase: ProtocolPhase.Acute,
            sets: 2,
            repetitions: '8-10',
            hold: '5 segundos',
            rest: '30 segundos',
            intensity: 'Baixa',
            frequency: '3x/semana',
            progression: [
              { week: 1, sets: 2, repetitions: '5', intensity: 'Muito baixa', notes: 'Foco na técnica' },
              { week: 2, sets: 2, repetitions: '8', intensity: 'Baixa', notes: 'Manter qualidade do movimento' },
              { week: 4, sets: 3, repetitions: '10', intensity: 'Moderada', notes: 'Aumentar desafio' }
            ],
            modifications: [
              {
                condition: 'Dor durante exercício',
                modification: 'Reduzir amplitude de movimento',
                parameters: { repetitions: '5', intensity: 'Muito baixa' }
              }
            ],
            precautions: ['Manter coluna neutra', 'Evitar compensações']
          }
        ],
        precautions: ['Não forçar movimentos dolorosos', 'Respeitar limites individuais'],
        progressMarkers: ['Redução da dor', 'Melhora da função', 'Ativação adequada do core']
      }
    ],
    
    progressionCriteria: [
      {
        id: 'prog_lombar_1',
        fromPhase: ProtocolPhase.Acute,
        toPhase: ProtocolPhase.Chronic,
        criteria: [
          {
            type: 'subjective',
            parameter: 'Dor (EVA)',
            operator: '<',
            value: 4,
            unit: 'pontos',
            weight: 7
          },
          {
            type: 'functional',
            parameter: 'Ativação do core',
            operator: 'adequate',
            value: 'adequada',
            weight: 8
          }
        ],
        timeframe: '4 semanas',
        requiredAssessments: ['EVA', 'Teste de ativação do core', 'Oswestry']
      }
    ],
    dischargeCriteria: [
      'Dor controlada (EVA <3/10)',
      'Função normalizada (Oswestry <20%)',
      'Capacidade de autogestão',
      'Retorno às atividades desejadas'
    ],
    
    estimatedDuration: { min: 6, max: 12, unit: 'weeks' },
    frequency: '2-3x por semana',
    sessionDuration: 50,
    
    successRate: 78,
    patientSatisfaction: 4.1,
    costEffectiveness: 'Excelente - evita cirurgias desnecessárias em 65% dos casos',
    
    timesUsed: 234,
    averageOutcomes: {
      'EVA': 3.2,
      'Oswestry': 18,
      'Força Core': 85
    },
    
    status: 'approved',
    approvedAt: '2024-06-20',
    isActive: true,
    tags: ['lombalgia', 'dor crônica', 'coluna', 'core', 'exercícios']
  }
];

export const mockProtocolAnalytics: ProtocolAnalytics[] = [
  {
    protocolId: 'protocol_lca_1',
    protocolName: 'Reabilitação Pós-Cirúrgica de LCA',
    totalPrescriptions: 156,
    activePrescriptions: 23,
    completedPrescriptions: 133,
    averageDuration: 142, // days
    successRate: 87.2,
    adherenceRate: 89.5,
    
    outcomeMetrics: {
      'ADM Flexão': {
        averageImprovement: 28.5,
        successRate: 92.1,
        clinicalSignificanceRate: 88.7
      },
      'Força Quadríceps': {
        averageImprovement: 34.2,
        successRate: 85.6,
        clinicalSignificanceRate: 82.3
      },
      'Lysholm Score': {
        averageImprovement: 42.8,
        successRate: 89.4,
        clinicalSignificanceRate: 85.9
      }
    },
    
    phaseAnalytics: {
      'Aguda': {
        averageDuration: 12.5,
        completionRate: 98.7,
        commonModifications: ['Redução da intensidade por dor', 'Extensão do período por edema']
      },
      'Subaguda': {
        averageDuration: 56.3,
        completionRate: 94.2,
        commonModifications: ['Progressão mais lenta do fortalecimento', 'Exercícios proprioceptivos adicionais']
      },
      'Crônica': {
        averageDuration: 73.2,
        completionRate: 91.8,
        commonModifications: ['Exercícios específicos do esporte', 'Treino pliométrico avançado']
      }
    },
    
    demographics: {
      ageGroups: {
        '16-25': 45,
        '26-35': 67,
        '36-45': 44
      },
      genderDistribution: {
        'M': 89,
        'F': 67
      },
      severityDistribution: {
        'Leve': 23,
        'Moderada': 98,
        'Grave': 35
      }
    },
    
    therapistMetrics: {
      'therapist_1': {
        prescriptions: 67,
        successRate: 91.0,
        adherenceRate: 92.5,
        averageDuration: 138
      },
      'therapist_2': {
        prescriptions: 45,
        successRate: 88.9,
        adherenceRate: 87.2,
        averageDuration: 145
      },
      'therapist_3': {
        prescriptions: 44,
        successRate: 81.8,
        adherenceRate: 86.8,
        averageDuration: 148
      }
    },
    
    monthlyTrends: [
      { month: '2024-01', prescriptions: 12, completions: 8, successRate: 87.5 },
      { month: '2024-02', prescriptions: 18, completions: 15, successRate: 93.3 },
      { month: '2024-03', prescriptions: 22, completions: 19, successRate: 86.4 },
      { month: '2024-04', prescriptions: 25, completions: 22, successRate: 88.0 },
      { month: '2024-05', prescriptions: 28, completions: 24, successRate: 85.7 },
      { month: '2024-06', prescriptions: 30, completions: 26, successRate: 86.7 }
    ],
    
    lastUpdated: '2024-07-01'
  }
];

export const mockProtocolLibraryStats: ProtocolLibraryStats = {
  totalProtocols: 3,
  protocolsByCategory: {
    'Ortopedia': 2,
    'Neurologia': 1,
    'Cardiorrespiratória': 0,
    'Pediatria': 0,
    'Esportiva': 0,
    'Gerontologia': 0
  },
  protocolsByEvidenceLevel: {
    '1A': 3,
    '1B': 0,
    '2A': 0,
    '2B': 0,
    '3': 0,
    '4': 0,
    '5': 0
  },
  recentlyUpdated: [mockProtocols[2]], // Lombalgia updated recently
  mostUsed: [mockProtocols[2], mockProtocols[0], mockProtocols[1]], // Ordered by timesUsed
  highestRated: [mockProtocols[0], mockProtocols[2], mockProtocols[1]], // Ordered by successRate
  pendingReview: 0,
  averageSuccessRate: 82.7
};

export const mockProtocolPrescriptions: ProtocolPrescription[] = [
  {
    id: 'prescription_1',
    protocolId: 'protocol_lca_1',
    patientId: '1',
    prescribedBy: 'therapist_1',
    prescribedAt: '2024-06-01',
    currentPhase: ProtocolPhase.Subacute,
    startDate: '2024-06-01',
    estimatedEndDate: '2024-10-01',
    
    customizations: [
      {
        type: 'exercise',
        target: 'leg_press',
        modification: 'Reduzir amplitude inicial devido à rigidez articular',
        reason: 'Limitação de ADM pós-cirúrgica'
      }
    ],
    excludedInterventions: [],
    additionalNotes: 'Paciente atleta profissional, foco no retorno ao esporte',
    
    phaseHistory: [
      {
        phase: ProtocolPhase.Acute,
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        objectives: {
          'obj_1': {
            description: 'Controlar dor e edema',
            completed: true,
            completedAt: '2024-06-10',
            notes: 'Edema controlado rapidamente'
          },
          'obj_2': {
            description: 'Manter ADM segura',
            completed: true,
            completedAt: '2024-06-14',
            notes: 'ADM 0-90° alcançada'
          }
        },
        assessments: ['assessment_1', 'assessment_2'],
        duration: 14
      }
    ],
    assessmentResults: [
      {
        id: 'assessment_1',
        toolId: 'tool_1',
        toolName: 'Escala de Lysholm',
        assessedAt: '2024-06-01',
        assessedBy: 'therapist_1',
        results: {
          'score_total': {
            value: 45,
            unit: 'pontos',
            percentile: 25,
            interpretation: 'Função severamente limitada'
          }
        },
        overallScore: 45,
        clinicalInterpretation: 'Limitação funcional significativa pós-cirúrgica, dentro do esperado'
      }
    ],
    adherenceRate: 92,
    
    outcomes: [
      {
        metricId: 'metric_1',
        metricName: 'ADM Flexão de Joelho',
        baselineValue: 75,
        currentValue: 125,
        targetValue: 135,
        unit: 'graus',
        percentChange: 66.7,
        clinicallySignificant: true,
        assessedAt: '2024-06-30'
      }
    ],
    complications: [],
    modifications: [
      {
        id: 'mod_1',
        modifiedAt: '2024-06-20',
        modifiedBy: 'therapist_1',
        type: 'progression',
        description: 'Aceleração da progressão devido à excelente evolução',
        reason: 'Paciente apresentou recuperação mais rápida que o esperado',
        impact: 'moderate'
      }
    ],
    
    status: 'active'
  }
];