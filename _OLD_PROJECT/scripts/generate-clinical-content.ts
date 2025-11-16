/**
 * Script para Gerar Conteúdo Clínico
 * Popula o sistema com protocolos, exercícios, materiais e conteúdo educacional
 * Baseado na análise do site activityfisioterapia.com.br
 */

import { imagenService } from '../services/ai/imagenService';
import type {
  ClinicalProtocol,
  SpecializedAssessment,
  ClinicalLibraryItem,
  ClinicalMaterial,
  Exercise,
  ExerciseLibrary,
  EducationalContent,
  FisioSpecialty
} from '../types/clinicalContent';

// ===== PROTOCOLOS CLÍNICOS =====

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  // FISIOTERAPIA ESPORTIVA
  {
    id: 'proto-esp-001',
    title: 'Protocolo de Prevenção de Lesões em Atletas',
    specialty: 'esportiva',
    description: 'Programa preventivo abrangente para redução de risco de lesões em atletas de alto rendimento',
    summary: 'Protocolointegrado focando em fortalecimento muscular, propriocepção e flexibilidade específica para cada modalidade esportiva.',
    objectives: [
      'Reduzir incidência de lesões musculoesqueléticas em 40-60%',
      'Melhorar propriocepção e controle neuromuscular',
      'Otimizar padrões de movimento e biomecânica',
      'Aumentar resistência muscular específica do esporte'
    ],
    indications: [
      'Atletas em período de pré-temporada',
      'Retorno ao esporte após lesão prévia',
      'Histórico de lesões recorrentes',
      'Desequilíbrios musculares identificados'
    ],
    contraindications: [
      'Lesão aguda não tratada',
      'Dor intensa durante exercícios',
      'Inflamação articular ativa',
      'Instabilidade articular não avaliada'
    ],
    phases: [
      {
        id: 'fase-1',
        name: 'Avaliação e Baseline',
        order: 1,
        duration: '1-2 semanas',
        goals: [
          'Avaliar padrões de movimento',
          'Identificar desequilíbrios',
          'Estabelecer baseline de força e flexibilidade'
        ],
        activities: [
          'Avaliação funcional esportiva',
          'Testes de força muscular',
          'Análise de movimento',
          'Avaliação de flexibilidade'
        ],
        precautions: [
          'Não forçar amplitude de movimento dolorosa',
          'Respeitar limitações individuais'
        ],
        progressionCriteria: [
          'Avaliação completa realizada',
          'Programa individualizado estabelecido'
        ]
      },
      {
        id: 'fase-2',
        name: 'Fortalecimento Progressivo',
        order: 2,
        duration: '4-6 semanas',
        goals: [
          'Fortalecer grupos musculares chave',
          'Corrigir desequilíbrios identificados',
          'Melhorar resistência muscular'
        ],
        activities: [
          'Exercícios de fortalecimento progressivo',
          'Treino de estabilização do core',
          'Exercícios específicos do esporte',
          'Trabalho de resistência muscular'
        ],
        precautions: [
          'Progressão gradual de carga',
          'Monitorar sinais de sobrecarga',
          'Técnica correta antes de aumentar carga'
        ],
        progressionCriteria: [
          'Aumento de 20-30% na força muscular',
          'Execução correta dos exercícios',
          'Ausência de dor ou desconforto significativo'
        ]
      },
      {
        id: 'fase-3',
        name: 'Propriocepção e Controle',
        order: 3,
        duration: '3-4 semanas',
        goals: [
          'Melhorar propriocepção articular',
          'Aprimorar controle neuromuscular',
          'Desenvolver reações de proteção'
        ],
        activities: [
          'Exercícios em superfícies instáveis',
          'Treino de equilíbrio dinâmico',
          'Exercícios pliométricos iniciais',
          'Trabalho de agilidade'
        ],
        precautions: [
          'Supervisão próxima durante exercícios de alto risco',
          'Progressão gradual de complexidade'
        ],
        progressionCriteria: [
          'Equilíbrio unipodal > 30 segundos',
          'Execução adequada de exercícios dinâmicos',
          'Confiança do atleta aumentada'
        ]
      },
      {
        id: 'fase-4',
        name: 'Integração Esportiva',
        order: 4,
        duration: '2-3 semanas',
        goals: [
          'Integrar ganhos ao gesto esportivo',
          'Simular situações de jogo',
          'Preparar para retorno completo'
        ],
        activities: [
          'Exercícios específicos do esporte em alta intensidade',
          'Simulação de situações de jogo',
          'Treino de reação e tomada de decisão',
          'Progressão para prática em equipe'
        ],
        precautions: [
          'Monitorar carga de treino',
          'Avaliar fadiga e recuperação',
          'Comunicação com comissão técnica'
        ],
        progressionCriteria: [
          'Participação completa em treinos',
          'Ausência de sintomas',
          'Testes funcionais dentro da normalidade'
        ]
      }
    ],
    duration: '10-15 semanas',
    frequency: '3-5x por semana',
    evidenceLevel: 'A',
    references: [
      'van Mechelen W, et al. Incidence, Severity, Aetiology and Prevention of Sports Injuries. Sports Med. 1992;14(2):82-99.',
      'Myer GD, et al. Neuromuscular training techniques to target deficits before return to sport. J Strength Cond Res. 2014;28(9):2518-2527.',
      'Soligard T, et al. Comprehensive warm-up programme to prevent injuries in young female footballers. BMJ. 2008;337:a2469.'
    ],
    images: [],
    tags: ['prevenção', 'atletas', 'fortalecimento', 'propriocepção', 'performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'proto-esp-002',
    title: 'Protocolo de Reabilitação de Lesão de LCA',
    specialty: 'esportiva',
    description: 'Protocolo completo para reabilitação pós-reconstrução de ligamento cruzado anterior',
    summary: 'Programa baseado em fases progressivas focando em restauração de amplitude, força, propriocepção e retorno ao esporte.',
    objectives: [
      'Restaurar amplitude de movimento completa',
      'Recuperar força muscular simétrica',
      'Restaurar propriocepção e controle neuromuscular',
      'Retorno seguro ao esporte em 9-12 meses'
    ],
    indications: [
      'Pós-operatório de reconstrução de LCA',
      'Lesão de LCA tratada conservadoramente (casos selecionados)',
      'Atletas e não-atletas'
    ],
    contraindications: [
      'Infecção ativa no local cirúrgico',
      'Derrame articular significativo',
      'Dor intensa não controlada',
      'Instabilidade não avaliada pelo cirurgião'
    ],
    phases: [
      {
        id: 'lca-fase-1',
        name: 'Fase Aguda (0-2 semanas)',
        order: 1,
        duration: '2 semanas',
        goals: [
          'Controlar dor e edema',
          'Proteger enxerto',
          'Iniciar mobilização precoce',
          'Prevenir atrofia muscular'
        ],
        activities: [
          'Crioterapia e elevação',
          'Mobilização patelar',
          'Exercícios isométricos de quadríceps',
          'Mobilização ativa-assistida de tornozelo',
          'Deambulação com muletas e carga parcial'
        ],
        precautions: [
          'Evitar hiperextensão do joelho',
          'Controlar edema rigidamente',
          'Não forçar amplitude de movimento'
        ],
        progressionCriteria: [
          'Controle de edema adequado',
          'Extensão passiva completa',
          'Flexão ativa de 90°',
          'Ativação adequada do quadríceps'
        ]
      },
      {
        id: 'lca-fase-2',
        name: 'Fase Inicial de Reabilitação (2-6 semanas)',
        order: 2,
        duration: '4 semanas',
        goals: [
          'Restaurar amplitude de movimento completa',
          'Melhorar força do quadríceps',
          'Normalizar padrão de marcha',
          'Iniciar propriocepção'
        ],
        activities: [
          'Mobilização ativa completa',
          'Fortalecimento progressivo em cadeia fechada',
          'Mini-agachamentos e leg press',
          'Exercícios de equilíbrio',
          'Bicicleta ergométrica',
          'Hidroterapia'
        ],
        precautions: [
          'Evitar cadeia aberta para quadríceps até 6 semanas',
          'Não forçar flexão completa precocemente',
          'Monitorar derrame articular'
        ],
        progressionCriteria: [
          'Amplitude de movimento completa',
          'Marcha normalizada sem claudicação',
          'Subir e descer escadas com segurança',
          'Equilíbrio unipodal > 10 segundos'
        ]
      },
      {
        id: 'lca-fase-3',
        name: 'Fase Intermediária (6-12 semanas)',
        order: 3,
        duration: '6 semanas',
        goals: [
          'Progressão de força muscular',
          'Melhorar controle neuromuscular',
          'Iniciar atividades de baixo impacto',
          'Preparar para atividades esportivas'
        ],
        activities: [
          'Fortalecimento progressivo em cadeia aberta e fechada',
          'Exercícios funcionais (lunges, step-ups)',
          'Treinamento proprioceptivo avançado',
          'Início de corrida em linha reta',
          'Exercícios de agilidade sem mudança de direção'
        ],
        precautions: [
          'Evitar pivoteamento precoce',
          'Progressão gradual de impacto',
          'Monitorar resposta ao exercício'
        ],
        progressionCriteria: [
          'Força de quadríceps > 70% do membro contralateral',
          'Hop test unilateral > 60% do contralateral',
          'Corrida em linha reta sem claudicação',
          'Ausência de derrame articular pós-exercício'
        ]
      },
      {
        id: 'lca-fase-4',
        name: 'Fase Avançada (3-6 meses)',
        order: 4,
        duration: '12 semanas',
        goals: [
          'Alcançar força simétrica',
          'Retomar atividades esportivas progressivamente',
          'Desenvolver confiança psicológica',
          'Preparar para retorno ao esporte'
        ],
        activities: [
          'Fortalecimento de alta intensidade',
          'Exercícios pliométricos progressivos',
          'Treino de agilidade com mudança de direção',
          'Simulação de gestos esportivos',
          'Progressão de corrida para sprints'
        ],
        precautions: [
          'Evitar sobrecarga excessiva',
          'Monitorar fadiga e recuperação',
          'Atenção a compensações biomecânicas'
        ],
        progressionCriteria: [
          'Força > 85% simétrica',
          'Hop tests > 85% simétricos',
          'Capacidade de realizar gestos esportivos específicos',
          'Confiança do atleta restaurada'
        ]
      },
      {
        id: 'lca-fase-5',
        name: 'Retorno ao Esporte (6-12 meses)',
        order: 5,
        duration: '24 semanas',
        goals: [
          'Retorno completo ao esporte',
          'Manter força e propriocepção',
          'Prevenir relesões',
          'Monitorar performance'
        ],
        activities: [
          'Participação completa em treinos',
          'Progressão para jogos/competições',
          'Manutenção de programa preventivo',
          'Monitoramento contínuo'
        ],
        precautions: [
          'Avaliação criteriosa antes do retorno',
          'Manter programa preventivo',
          'Atenção a fadiga e recuperação'
        ],
        progressionCriteria: [
          'Força > 90% simétrica',
          'Todos os hop tests > 90%',
          'Aprovação do cirurgião',
          'Prontidão psicológica confirmada'
        ]
      }
    ],
    duration: '9-12 meses',
    frequency: '4-5x por semana nas fases iniciais, 3-4x nas fases avançadas',
    evidenceLevel: 'A',
    references: [
      'Adams D, et al. Current Concepts for Anterior Cruciate Ligament Reconstruction. J Orthop Sports Phys Ther. 2012;42(3):208-220.',
      'Ardern CL, et al. Return to sport following anterior cruciate ligament reconstruction surgery. Br J Sports Med. 2011;45(7):596-606.',
      'van Melick N, et al. Evidence-based clinical practice update: practice guidelines for anterior cruciate ligament rehabilitation. Br J Sports Med. 2016;50(24):1506-1515.'
    ],
    images: [],
    tags: ['LCA', 'joelho', 'pós-operatório', 'retorno ao esporte', 'reabilitação'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // FISIOTERAPIA PÓS-OPERATÓRIA
  {
    id: 'proto-pos-001',
    title: 'Protocolo de Reabilitação Pós-Artroplastia Total de Joelho',
    specialty: 'pos-operatoria',
    description: 'Programa abrangente de reabilitação para pacientes submetidos a artroplastia total de joelho',
    summary: 'Protocolo estruturado focando em recuperação de amplitude de movimento, força muscular e independência funcional.',
    objectives: [
      'Recuperar amplitude de movimento funcional (0-120°)',
      'Restaurar força muscular dos membros inferiores',
      'Alcançar independência na marcha e AVDs',
      'Controlar dor e edema',
      'Prevenir complicações pós-operatórias'
    ],
    indications: [
      'Pós-operatório de artroplastia total de joelho',
      'Todas as faixas etárias',
      'Prótese cimentada ou não-cimentada'
    ],
    contraindications: [
      'Infecção pós-operatória',
      'Instabilidade da prótese',
      'Fraturaperiprotética',
      'Trombose venosa profunda não tratada'
    ],
    phases: [
      {
        id: 'atj-fase-1',
        name: 'Fase Hospitalar (0-3 dias)',
        order: 1,
        duration: '3 dias',
        goals: [
          'Controlar dor e edema',
          'Iniciar mobilização precoce',
          'Prevenir complicações respiratórias e circulatórias',
          'Treinar transferências seguras'
        ],
        activities: [
          'Exercícios respiratórios',
          'Mobilização ativa de tornozelo',
          'Isométricos de quadríceps e glúteos',
          'Flexão ativa-assistida do joelho',
          'Treino de transferências',
          'Deambulação precoce com andador'
        ],
        precautions: [
          'Controle rigoroso de dor',
          'Monitorar sinais vitais',
          'Cuidados com ferida operatória',
          'Prevenção de queda'
        ],
        progressionCriteria: [
          'Dor controlada',
          'Deambulação independente com dispositivo auxiliar',
          'Flexão ativa de 60°',
          'Extensão passiva completa'
        ]
      },
      {
        id: 'atj-fase-2',
        name: 'Fase Domiciliar Precoce (1-6 semanas)',
        order: 2,
        duration: '5 semanas',
        goals: [
          'Progressão de amplitude de movimento',
          'Fortalecimento muscular progressivo',
          'Independência na marcha em ambientes variados',
          'Retorno a AVDs básicas'
        ],
        activities: [
          'Mobilização ativa-assistida e ativa progressiva',
          'Fortalecimento em cadeia aberta e fechada',
          'Treino de marcha com redução de dispositivos auxiliares',
          'Subir e descer escadas',
          'Exercícios funcionais',
          'Cicloergômetro'
        ],
        precautions: [
          'Evitar hiperflexão forçada',
          'Progressão gradual de carga',
          'Atenção a edema residual'
        ],
        progressionCriteria: [
          'Amplitude de movimento: 0-100°',
          'Marcha independente sem dispositivo em casa',
          'Subir e descer escadas com corrimão',
          'Independência em AVDs básicas'
        ]
      },
      {
        id: 'atj-fase-3',
        name: 'Fase de Recuperação Funcional (6-12 semanas)',
        order: 3,
        duration: '6 semanas',
        goals: [
          'Alcançar amplitude funcional completa',
          'Melhorar força e resistência muscular',
          'Retornar a atividades da comunidade',
          'Normalizar padrão de marcha'
        ],
        activities: [
          'Mobilização ativa completa',
          'Fortalecimento progressivo de alta repetição',
          'Exercícios funcionais avançados',
          'Treino de equilíbrio',
          'Caminhadas em diferentes terrenos',
          'Retorno a atividades de lazer'
        ],
        precautions: [
          'Evitar atividades de alto impacto',
          'Monitorar sinais de sobrecarga',
          'Respeitar limites de dor'
        ],
        progressionCriteria: [
          'Amplitude de movimento: 0-120° ou mais',
          'Força de quadríceps > 70% do contralateral',
          'Marcha normalizada',
          'Independência completa em AVDs'
        ]
      },
      {
        id: 'atj-fase-4',
        name: 'Fase de Manutenção (3+ meses)',
        order: 4,
        duration: 'Ongoing',
        goals: [
          'Manter ganhos obtidos',
          'Otimizar função e qualidade de vida',
          'Prevenir complicações tardias',
          'Promover estilo de vida ativo'
        ],
        activities: [
          'Programa de exercícios domiciliares',
          'Atividades físicas de baixo impacto',
          'Caminhadas regulares',
          'Exercícios aquáticos',
          'Programa de fortalecimento de manutenção'
        ],
        precautions: [
          'Evitar esportes de contato',
          'Monitorar sinais de desgaste da prótese',
          'Manter peso corporal adequado'
        ],
        progressionCriteria: [
          'Satisfação do paciente',
          'Função mantida ou melhorada',
          'Aderência ao programa de exercícios'
        ]
      }
    ],
    duration: '12+ semanas com manutenção contínua',
    frequency: '2-3x por dia nas primeiras semanas, depois 3-5x por semana',
    evidenceLevel: 'A',
    references: [
      'Artz N, et al. Effectiveness of physiotherapy exercise following total knee replacement. BMC Musculoskelet Disord. 2015;16:15.',
      'Pozzi F, et al. Physical exercise after knee arthroplasty. Knee Surg Sports Traumatol Arthrosc. 2013;21(3):564-579.',
      'Meier W, et al. Total knee arthroplasty: muscle impairments, functional limitations, and recommended rehabilitation approaches. J Orthop Sports Phys Ther. 2008;38(5):246-256.'
    ],
    images: [],
    tags: ['prótese', 'joelho', 'pós-operatório', 'idosos', 'artrose'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'proto-pos-002',
    title: 'Protocolo de Reabilitação Pós-Reparo do Manguito Rotador',
    specialty: 'pos-operatoria',
    description: 'Programa criterioso de reabilitação pós-cirúrgica do manguito rotador com progressão baseada na cicatrização tecidual',
    summary: 'Protocolo dividido em fases respeitando tempo de cicatrização, focando em mobilidade, força e retorno à função.',
    objectives: [
      'Proteger reparo cirúrgico durante cicatrização',
      'Restaurar amplitude de movimento completa',
      'Recuperar força do manguito rotador',
      'Retornar às atividades funcionais e ocupacionais'
    ],
    indications: [
      'Pós-operatório de reparo do manguito rotador',
      'Reparo de ruptura parcial ou completa',
      'Diferentes técnicas cirúrgicas (aberta, artroscópica)'
    ],
    contraindications: [
      'Infecção pós-operatória',
      'Falha do reparo (re-ruptura)',
      'Dor não controlada',
      'Rigidez articular capsular significativa'
    ],
    phases: [
      {
        id: 'mr-fase-1',
        name: 'Fase de Proteção Máxima (0-6 semanas)',
        order: 1,
        duration: '6 semanas',
        goals: [
          'Proteger reparo cirúrgico',
          'Controlar dor e inflamação',
          'Prevenir rigidez articular',
          'Manter função de mão, punho e cotovelo'
        ],
        activities: [
          'Uso contínuo de tipoia/órtese',
          'Exercícios pendulares suaves',
          'Mobilização passiva cautelosa',
          'Exercícios ativos de cotovelo, punho e mão',
          'Isométricos submáximos (após 3-4 semanas)',
          'Crioterapia'
        ],
        precautions: [
          'SEM elevação ativa do braço',
          'SEM rotação externa ativa',
          'Manter tipoia conforme orientação cirúrgica',
          'Mobilização passiva gentil e controlada'
        ],
        progressionCriteria: [
          '6 semanas de pós-operatório',
          'Dor controlada',
          'Mobilidade passiva: flexão 90°, abdução 70°, rotação externa 30°',
          'Ausência de complicações'
        ]
      },
      {
        id: 'mr-fase-2',
        name: 'Fase de Proteção Moderada (6-12 semanas)',
        order: 2,
        duration: '6 semanas',
        goals: [
          'Progressão de amplitude de movimento',
          'Início de fortalecimento leve',
          'Melhorar controle escapular',
          'Preparar para ativação do manguito'
        ],
        activities: [
          'Descontinuar tipoia progressivamente',
          'Mobilização ativa-assistida progressiva',
          'Início de elevação ativa assistida',
          'Fortalecimento escapular',
          'Isométricos de manguito rotador',
          'Exercícios de propriocepção',
          'Mobilização em água (se disponível)'
        ],
        precautions: [
          'Evitar movimentos balísticos',
          'Progressão gradual de amplitude',
          'Monitorar sinais de sobrecarga',
          'Respeitar dor como guia'
        ],
        progressionCriteria: [
          'Amplitude ativa próxima à passiva',
          'Elevação ativa de 120°',
          'Rotação externa ativa de 45°',
          'Controle escapular adequado'
        ]
      },
      {
        id: 'mr-fase-3',
        name: 'Fase de Fortalecimento Progressivo (12-18 semanas)',
        order: 3,
        duration: '6 semanas',
        goals: [
          'Progressão de força do manguito rotador',
          'Restaurar amplitude completa',
          'Melhorar resistência muscular',
          'Iniciar atividades funcionais'
        ],
        activities: [
          'Mobilização ativa completa',
          'Fortalecimento progressivo com resistência elástica',
          'Exercícios de cadeia cinética',
          'Fortalecimento excêntrico',
          'Exercícios funcionais progressivos',
          'Treino de atividades do dia a dia'
        ],
        precautions: [
          'Evitar cargas pesadas precocemente',
          'Progressão gradual de resistência',
          'Monitorar fadiga muscular',
          'Atenção a compensações'
        ],
        progressionCriteria: [
          'Amplitude de movimento completa',
          'Força do manguito > 60% do contralateral',
          'Capacidade de realizar AVDs sem dor',
          'Ausência de impacto secundário'
        ]
      },
      {
        id: 'mr-fase-4',
        name: 'Fase de Retorno à Função (4-6+ meses)',
        order: 4,
        duration: '8+ semanas',
        goals: [
          'Alcançar força funcional completa',
          'Retornar a atividades ocupacionais e esportivas',
          'Prevenir reincidência',
          'Otimizar função'
        ],
        activities: [
          'Fortalecimento de alta carga progressivo',
          'Exercícios específicos para trabalho/esporte',
          'Treino de resistência muscular',
          'Atividades pliométricas (se apropriado)',
          'Simulação de atividades reais',
          'Programa de manutenção'
        ],
        precautions: [
          'Evitar sobrecarga excessiva',
          'Respeitar processo de remodelação tecidual',
          'Manter equilíbrio muscular'
        ],
        progressionCriteria: [
          'Força > 85% simétrica',
          'Testes funcionais normalizados',
          'Retorno às atividades desejadas',
          'Satisfação do paciente'
        ]
      }
    ],
    duration: '6+ meses',
    frequency: '2-3x por semana com programa domiciliar diário',
    evidenceLevel: 'A',
    references: [
      'Thigpen CA, et al. The American Society of Shoulder and Elbow Therapists\' consensus statement on rehabilitation following arthroscopic rotator cuff repair. J Shoulder Elbow Surg. 2016;25(4):521-535.',
      'Düzgün İ, et al. Effect of slow vs fast speed resistance training on shoulder muscle strength and function. J Sports Med Phys Fitness. 2019;59(12):1963-1968.',
      'Gallagher BP, et al. Early versus delayed rehabilitation following arthroscopic rotator cuff repair. J Shoulder Elbow Surg. 2015;24(6):928-933.'
    ],
    images: [],
    tags: ['ombro', 'manguito rotador', 'pós-operatório', 'reabilitação'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // FISIOTERAPIA GERONTOLÓGICA
  {
    id: 'proto-gero-001',
    title: 'Programa de Prevenção de Quedas em Idosos',
    specialty: 'geriatrica',
    description: 'Programa multifacetado para redução do risco de quedas em população idosa',
    summary: 'Intervenção abrangente focando em equilíbrio, força, marcha e educação para prevenir quedas e manter independência.',
    objectives: [
      'Reduzir risco de quedas em 30-50%',
      'Melhorar equilíbrio estático e dinâmico',
      'Aumentar força muscular dos membros inferiores',
      'Otimizar padrão de marcha',
      'Promover autoconfiança e independência'
    ],
    indications: [
      'Idosos com histórico de quedas',
      'Déficit de equilíbrio identificado',
      'Medo de cair (síndrome pós-queda)',
      'Sarcopenia e fraqueza muscular',
      'Alterações de marcha'
    ],
    contraindications: [
      'Condições cardiovasculares instáveis',
      'Vertigem aguda não investigada',
      'Déficits cognitivos severos sem supervisão',
      'Dor intensa limitante'
    ],
    phases: [
      {
        id: 'prev-quedas-1',
        name: 'Avaliação e Identificação de Riscos',
        order: 1,
        duration: '1-2 semanas',
        goals: [
          'Identificar fatores de risco intrínsecos e extrínsecos',
          'Avaliar função física e equilíbrio',
          'Estabelecer baseline funcional',
          'Educar sobre prevenção'
        ],
        activities: [
          'Avaliação geriátrica funcional',
          'Teste de Equilíbrio de Berg',
          'Timed Up and Go Test',
          'Teste de marcha de 10 metros',
          'Avaliação de força muscular',
          'Avaliação ambiental (checklist domiciliar)',
          'Educação sobre riscos de queda'
        ],
        precautions: [
          'Supervisão próxima durante testes',
          'Ambiente seguro para avaliação',
          'Respeitar limitações individuais'
        ],
        progressionCriteria: [
          'Avaliação completa realizada',
          'Fatores de risco identificados',
          'Plano individualizado estabelecido',
          'Paciente/família educados'
        ]
      },
      {
        id: 'prev-quedas-2',
        name: 'Fase de Fortalecimento',
        order: 2,
        duration: '4-6 semanas',
        goals: [
          'Aumentar força dos membros inferiores',
          'Melhorar resistência muscular',
          'Fortalecer musculatura do core',
          'Melhorar funcionalidade'
        ],
        activities: [
          'Exercícios de sentar e levantar',
          'Fortalecimento de quadríceps e glúteos',
          'Exercícios de panturrilha (elevação)',
          'Treino de ponte (ponte glútea)',
          'Exercícios funcionais (agachamentos adaptados)',
          'Uso de resistência progressiva'
        ],
        precautions: [
          'Supervisão adequada',
          'Progressão gradual de carga',
          'Monitorar pressão arterial',
          'Atenção a sinais de fadiga'
        ],
        progressionCriteria: [
          'Aumento de 20-30% na força muscular',
          'Capacidade de levantar de cadeira sem apoio de braços',
          'Melhora no teste de sentar e levantar em 30 segundos',
          'Ausência de dor ou desconforto excessivo'
        ]
      },
      {
        id: 'prev-quedas-3',
        name: 'Fase de Treinamento de Equilíbrio',
        order: 3,
        duration: '4-6 semanas',
        goals: [
          'Melhorar equilíbrio estático e dinâmico',
          'Aprimorar reações de proteção',
          'Desenvolver estratégias de equilíbrio',
          'Aumentar confiança'
        ],
        activities: [
          'Exercícios de equilíbrio unipodal progressivos',
          'Treino de equilíbrio em superfícies variadas',
          'Exercícios com base de suporte reduzida',
          'Treino de alcance multidirecional',
          'Exercícios de dupla tarefa',
          'Tai Chi adaptado ou exercícios de Otago'
        ],
        precautions: [
          'Garantir ambiente seguro com suporte disponível',
          'Supervisão constante',
          'Progressão individualizada',
          'Evitar fadiga excessiva'
        ],
        progressionCriteria: [
          'Equilíbrio unipodal > 10 segundos',
          'Melhora de 10+ pontos na Escala de Berg',
          'Capacidade de realizar tarefas em pé com segurança',
          'Aumento da autoconfiança relatado'
        ]
      },
      {
        id: 'prev-quedas-4',
        name: 'Fase de Treino de Marcha e Mobilidade',
        order: 4,
        duration: '3-4 semanas',
        goals: [
          'Otimizar padrão de marcha',
          'Melhorar velocidade e cadência',
          'Treinar marcha em diferentes ambientes',
          'Promover mobilidade comunitária'
        ],
        activities: [
          'Treino de marcha com diferentes velocidades',
          'Caminhada em diferentes superfícies',
          'Treino de obstáculos',
          'Subir e descer degraus/rampas',
          'Treino de mudança de direção',
          'Caminhadas em ambientes externos'
        ],
        precautions: [
          'Iniciar em ambiente controlado',
          'Progressão gradual para ambientes desafiadores',
          'Uso de dispositivo auxiliar se necessário',
          'Supervisão conforme nível de risco'
        ],
        progressionCriteria: [
          'Velocidade de marcha > 0.8 m/s',
          'TUG < 12 segundos',
          'Capacidade de caminhar em ambiente comunitário',
          'Confiança melhorada'
        ]
      },
      {
        id: 'prev-quedas-5',
        name: 'Fase de Manutenção e Prevenção Contínua',
        order: 5,
        duration: 'Ongoing',
        goals: [
          'Manter ganhos obtidos',
          'Prevenir declínio funcional',
          'Promover atividade física regular',
          'Monitorar riscos continuamente'
        ],
        activities: [
          'Programa de exercícios domiciliares',
          'Participação em grupos comunitários',
          'Atividades físicas regulares (caminhadas, hidroginástica)',
          'Reavaliações periódicas',
          'Reforço educacional'
        ],
        precautions: [
          'Monitorar mudanças no estado de saúde',
          'Adaptar programa conforme necessário',
          'Manter comunicação com equipe de saúde'
        ],
        progressionCriteria: [
          'Aderência ao programa de exercícios',
          'Função mantida ou melhorada',
          'Redução de quedas documentada',
          'Qualidade de vida preservada'
        ]
      }
    ],
    duration: '12-16 semanas de intervenção intensiva + manutenção contínua',
    frequency: '2-3x por semana supervisionado + exercícios domiciliares diários',
    evidenceLevel: 'A',
    references: [
      'Sherrington C, et al. Exercise for preventing falls in older people living in the community. Cochrane Database Syst Rev. 2019;1(1):CD012424.',
      'Gillespie LD, et al. Interventions for preventing falls in older people living in the community. Cochrane Database Syst Rev. 2012;9:CD007146.',
      'Thomas S, et al. Exercise for type 2 diabetes mellitus. Cochrane Database Syst Rev. 2006;3:CD002968.'
    ],
    images: [],
    tags: ['idosos', 'quedas', 'equilíbrio', 'prevenção', 'independência'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    id: 'proto-gero-002',
    title: 'Protocolo de Manutenção de Autonomia e Qualidade de Vida no Envelhecimento',
    specialty: 'geriatrica',
    description: 'Programa holístico para promover envelhecimento ativo e manter independência funcional',
    summary: 'Intervenção multicomponente focando em função física, cognição, socialização e qualidade de vida.',
    objectives: [
      'Manter ou melhorar capacidade funcional',
      'Prevenir declínio cognitivo',
      'Promover saúde cardiovascular e metabólica',
      'Aumentar participação social',
      'Melhorar qualidade de vida'
    ],
    indications: [
      'Idosos independentes ou semi-dependentes',
      'Prevenção de fragilidade',
      'Pós-hospitalização',
      'Condições crônicas controladas'
    ],
    contraindications: [
      'Condições médicas agudas não estabilizadas',
      'Contraindicações médicas ao exercício',
      'Déficits cognitivos severos sem supervisão adequada'
    ],
    phases: [
      {
        id: 'autonomia-1',
        name: 'Avaliação Geriátrica Abrangente',
        order: 1,
        duration: '1-2 semanas',
        goals: [
          'Avaliar função física, cognitiva e social',
          'Identificar necessidades individuais',
          'Estabelecer metas realistas',
          'Educar paciente e família'
        ],
        activities: [
          'Avaliação funcional (AVDs e AIVDs)',
          'Avaliação de força e mobilidade',
          'Screening cognitivo',
          'Avaliação de qualidade de vida',
          'Avaliação nutricional',
          'Avaliação de suporte social'
        ],
        precautions: [
          'Abordagem sensível e respeitosa',
          'Considerar fadiga',
          'Ambiente confortável'
        ],
        progressionCriteria: [
          'Avaliação completa',
          'Metas estabelecidas',
          'Plano individualizado criado'
        ]
      },
      {
        id: 'autonomia-2',
        name: 'Fase de Intervenção Multicomponente',
        order: 2,
        duration: '8-12 semanas',
        goals: [
          'Melhorar função física global',
          'Estimular função cognitiva',
          'Promover atividade social',
          'Educar sobre envelhecimento saudável'
        ],
        activities: [
          'Exercícios de fortalecimento multiarticular',
          'Treino de equilíbrio',
          'Exercícios aeróbicos de baixo impacto',
          'Atividades cognitivo-motoras',
          'Exercícios em grupo',
          'Educação em saúde',
          'Atividades recreativas'
        ],
        precautions: [
          'Monitorar sinais vitais',
          'Adaptar intensidade individualmente',
          'Garantir hidratação adequada',
          'Ambiente social positivo'
        ],
        progressionCriteria: [
          'Melhora na função física',
          'Engajamento nas atividades',
          'Participação social aumentada',
          'Satisfação do paciente'
        ]
      },
      {
        id: 'autonomia-3',
        name: 'Fase de Manutenção e Promoção de Saúde',
        order: 3,
        duration: 'Ongoing',
        goals: [
          'Manter ganhos obtidos',
          'Promover estilo de vida ativo',
          'Prevenir declínio funcional',
          'Otimizar qualidade de vida'
        ],
        activities: [
          'Programa de exercícios de manutenção',
          'Atividades comunitárias',
          'Grupos de socialização',
          'Atividades de lazer',
          'Monitoramento periódico'
        ],
        precautions: [
          'Adaptações conforme mudanças de saúde',
          'Suporte contínuo',
          'Comunicação com equipe multiprofissional'
        ],
        progressionCriteria: [
          'Aderência ao programa',
          'Função mantida',
          'Qualidade de vida preservada ou melhorada',
          'Engajamento social mantido'
        ]
      }
    ],
    duration: '12+ semanas com manutenção contínua',
    frequency: '2-3x por semana + atividades diárias',
    evidenceLevel: 'B',
    references: [
      'Stuck AE, et al. Comprehensive geriatric assessment: a meta-analysis of controlled trials. Lancet. 1993;342(8878):1032-1036.',
      'Theou O, et al. What do we know about frailty in the acute care setting? A scoping review. BMC Geriatr. 2018;18(1):139.',
      'Bauman A, et al. Updating the evidence for physical activity. Lancet. 2016;388(10051):1311-1324.'
    ],
    images: [],
    tags: ['idosos', 'autonomia', 'qualidade de vida', 'envelhecimento ativo', 'prevenção'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

console.log(`✅ Gerado ${CLINICAL_PROTOCOLS.length} protocolos clínicos`);

export default CLINICAL_PROTOCOLS;

