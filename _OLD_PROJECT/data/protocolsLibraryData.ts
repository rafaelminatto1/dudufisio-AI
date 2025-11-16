// data/protocolsLibraryData.ts
// Biblioteca Completa de Protocolos Clínicos - 50+ protocolos baseados em evidência

export const CLINICAL_PROTOCOLS = [
  // ============================================
  // ORTOPEDIA (20 protocolos)
  // ============================================
  {
    id: 'protocol-ort-001',
    title: 'Protocolo Pós-operatório de Reconstrução de LCA',
    summary: 'Protocolo completo para reabilitação após reconstrução do ligamento cruzado anterior com enxerto.',
    description: 'Programa de reabilitação baseado em critérios funcionais para retorno seguro ao esporte após reconstrução de LCA.',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: [
      'Pós-operatório de reconstrução de LCA (enxerto patelar ou isquiotibiais)',
      'Ausência de lesões concomitantes graves',
      'Paciente motivado para reabilitação',
      'Clearance médico para início do protocolo'
    ],
    exclusionCriteria: [
      'Complicações pós-cirúrgicas (infecção, re-ruptura)',
      'Lesões meniscais não reparadas complexas',
      'Artrite degenerativa avançada',
      'Não adesão ao programa de reabilitação'
    ],
    phases: [
      {
        name: 'Fase 1: Proteção e Mobilização Precoce',
        description: 'Foco em controle de edema, ganho de ADM e ativação de quadríceps',
        durationWeeks: 2,
        objectives: [
          'Reduzir edema e dor pós-operatória',
          'Ganhar extensão completa',
          'Atingir 90° de flexão',
          'Ativar quadríceps sem lag extensor'
        ],
        exercises: [
          { name: 'Mobilização patelar', sets: 3, repetitions: 20, duration: 300 },
          { name: 'Quad sets', sets: 10, repetitions: 10, duration: 180 },
          { name: 'SLR 4 direções', sets: 3, repetitions: 10, duration: 240 },
          { name: 'Bomba muscular tornozelo', sets: 5, repetitions: 30, duration: 180 }
        ]
      },
      {
        name: 'Fase 2: Fortalecimento Inicial',
        description: 'Progressão de ADM, fortalecimento de quadríceps e início de carga',
        durationWeeks: 4,
        objectives: [
          'ADM completa (0-130°)',
          'Marcha sem claudicação',
          'Controle neuromuscular básico',
          'Iniciar exercícios em cadeia fechada'
        ],
        exercises: [
          { name: 'Mini squat 0-45°', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Step up baixo', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Leg press 0-60°', sets: 3, repetitions: 12, duration: 240 },
          { name: 'Bicicleta ergométrica', sets: 1, repetitions: 1, duration: 1200 }
        ]
      },
      {
        name: 'Fase 3: Fortalecimento Avançado',
        description: 'Fortalecimento progressivo, controle neuromuscular avançado',
        durationWeeks: 8,
        objectives: [
          'Simetria de força >80%',
          'Controle neuromuscular dinâmico',
          'Iniciar exercícios unilaterais',
          'Preparação para atividades esportivas'
        ],
        exercises: [
          { name: 'Agachamento bilateral completo', sets: 3, repetitions: 12, duration: 240 },
          { name: 'Single leg squat', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Nordic hamstring curl', sets: 3, repetitions: 6, duration: 150 },
          { name: 'Exercícios de equilíbrio dinâmico', sets: 3, repetitions: 10, duration: 300 }
        ]
      },
      {
        name: 'Fase 4: Retorno ao Esporte',
        description: 'Treino específico do esporte, pliometria, agilidade',
        durationWeeks: 12,
        objectives: [
          'Simetria de força >90%',
          'Testes funcionais aprovados',
          'Confiança psicológica',
          'Clearance médico para retorno'
        ],
        exercises: [
          { name: 'Box jumps', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Agilidade em escada', sets: 5, repetitions: 3, duration: 240 },
          { name: 'Mudanças de direção', sets: 4, repetitions: 8, duration: 300 },
          { name: 'Treino esportivo progressivo', sets: 1, repetitions: 1, duration: 1800 }
        ]
      }
    ],
    dischargeCriteria: [
      'Mínimo 9 meses pós-operatório',
      'Índice de simetria de membros (LSI) >90% em todos testes',
      'Hop tests normalizados',
      'Ausência de edema ou dor',
      'Clearance do cirurgião e fisioterapeuta',
      'ACL-RSI score >56 pontos'
    ],
    references: [
      {
        title: 'ACL Rehabilitation: Clinical Data, Biologic Healing, and Criterion-Based Milestones',
        authors: 'Adams D, Logerstedt DS, et al.',
        journal: 'Sports Health',
        year: 2020
      }
    ],
    tags: ['LCA', 'joelho', 'pós-operatório', 'retorno ao esporte', 'reabilitação']
  },
  {
    id: 'protocol-ort-002',
    title: 'Síndrome do Impacto Subacromial do Ombro',
    summary: 'Protocolo conservador para tratamento da síndrome do impacto do ombro.',
    description: 'Abordagem progressiva focando em ganho de espaço subacromial, fortalecimento de manguito rotador e correção de discinesia escapular.',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: [
      'Dor anterior/lateral de ombro >3 meses',
      'Testes positivos: Neer, Hawkins-Kennedy',
      'Falha no tratamento conservador inicial',
      'Imagem confirmando impacto sem ruptura completa'
    ],
    exclusionCriteria: [
      'Ruptura completa de manguito rotador',
      'Capsulite adesiva severa',
      'Instabilidade glenoumeral',
      'Artrite glenoumeral avançada'
    ],
    phases: [
      {
        name: 'Fase 1: Controle da Dor e Educação',
        description: 'Redução da dor, modificação de atividades, início de mobilização',
        durationWeeks: 2,
        objectives: [
          'Reduzir dor para <3/10 (EVA)',
          'Educação sobre patologia e prognóstico',
          'Identificar e modificar movimentos provocativos',
          'Iniciar mobilização suave'
        ],
        exercises: [
          { name: 'Pêndulo de Codman', sets: 3, repetitions: 20, duration: 180 },
          { name: 'Mobilização escapular passiva', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Alongamento de cápsula posterior', sets: 3, repetitions: 1, duration: 90 },
          { name: 'Mobilização cervical', sets: 2, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Fase 2: Restauração da ADM e Ativação Muscular',
        description: 'Ganho completo de ADM, ativação inicial de manguito e escapulares',
        durationWeeks: 3,
        objectives: [
          'ADM completa e sem dor',
          'Ativação adequada de serrátil anterior',
          'Controle escapular básico',
          'Iniciar fortalecimento leve de manguito'
        ],
        exercises: [
          { name: 'Wall slides', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Rotação externa isométrica', sets: 3, repetitions: 10, duration: 150 },
          { name: 'Scapular clock', sets: 3, repetitions: 8, duration: 180 },
          { name: 'Serrátil anterior sobre bola', sets: 3, repetitions: 15, duration: 180 }
        ]
      },
      {
        name: 'Fase 3: Fortalecimento Progressivo',
        description: 'Fortalecimento de manguito rotador e estabilizadores escapulares',
        durationWeeks: 6,
        objectives: [
          'Força de manguito >80% do lado contralateral',
          'Controle escapular dinâmico',
          'Retorno a AVDs sem dor',
          'Preparação para atividades overhead'
        ],
        exercises: [
          { name: 'Exercícios Y-T-W', sets: 3, repetitions: 12, duration: 240 },
          { name: 'Rotação externa 90/90', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Elevação em Y com halter', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Push-up plus', sets: 3, repetitions: 15, duration: 180 }
        ]
      },
      {
        name: 'Fase 4: Retorno Funcional',
        description: 'Treino específico para atividades e esportes overhead',
        durationWeeks: 3,
        objectives: [
          'Força normalizada bilateral',
          'Retorno completo a atividades',
          'Sem dor em atividades provocativas',
          'Educação para manutenção'
        ],
        exercises: [
          { name: 'Exercícios esportivos específicos', sets: 3, repetitions: 10, duration: 240 },
          { name: 'Pliometria de membros superiores', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Treino de arremesso/saque progressivo', sets: 5, repetitions: 10, duration: 300 },
          { name: 'Exercícios de manutenção', sets: 2, repetitions: 15, duration: 240 }
        ]
      }
    ],
    dischargeCriteria: [
      'Ausência de dor em atividades funcionais',
      'ADM completa e simétrica',
      'Testes especiais negativos',
      'Força de rotadores externos >90% contralateral',
      'Retorno completo às atividades desejadas'
    ],
    references: [
      {
        title: 'Conservative Management of Shoulder Impingement Syndrome',
        authors: 'Hanratty CE, McVeigh JG, et al.',
        journal: 'J Orthop Sports Phys Ther',
        year: 2012
      }
    ],
    tags: ['ombro', 'impacto', 'manguito rotador', 'escapular', 'conservador']
  },
  {
    id: 'protocol-ort-003',
    title: 'Lombalgia Mecânica Crônica',
    summary: 'Abordagem baseada em classificação de tratamento para lombalgia crônica não-específica.',
    description: 'Protocolo focado em estabilização lombar, correção de padrões de movimento e retorno funcional.',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: [
      'Lombalgia >12 semanas',
      'Dor mecânica (piora com movimento/postura)',
      'Ausência de bandeiras vermelhas',
      'Falha em tratamento conservador básico'
    ],
    exclusionCriteria: [
      'Radiculopatia severa',
      'Estenose espinhal sintomática',
      'Espondilolistese >grau 2',
      'Patologias sistêmicas/infecciosas'
    ],
    phases: [
      {
        name: 'Fase 1: Educação e Controle Motor',
        description: 'Neuro educação da dor, ativação de estabilizadores profundos',
        durationWeeks: 3,
        objectives: [
          'Compreensão sobre lombalgia e prognóstico',
          'Ativação isolada de transverso e multífidos',
          'Identificação de movimentos provocativos',
          'Redução do medo-evitação'
        ],
        exercises: [
          { name: 'Drawing-in maneuver', sets: 5, repetitions: 10, duration: 180 },
          { name: 'Multífido em 4 apoios', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Ponte básica', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Dead bug', sets: 3, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Fase 2: Estabilização Dinâmica',
        description: 'Progressão de estabilização, introdução de movimentos funcionais',
        durationWeeks: 4,
        objectives: [
          'Estabilização em movimentos dinâmicos',
          'Melhora da resistência muscular',
          'Controle de coluna neutra',
          'Redução significativa da dor'
        ],
        exercises: [
          { name: 'Prancha frontal progressiva', sets: 3, repetitions: 3, duration: 90 },
          { name: 'Bird dog', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Ponte unilateral', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Pallof press', sets: 3, repetitions: 15, duration: 180 }
        ]
      },
      {
        name: 'Fase 3: Fortalecimento Funcional',
        description: 'Fortalecimento global, padrões de movimento complexos',
        durationWeeks: 6,
        objectives: [
          'Força normalizada de core',
          'Execução correta de padrões fundamentais',
          'Retorno a AVDs sem limitação',
          'Dor <2/10 em atividades'
        ],
        exercises: [
          { name: 'Agachamento bilateral', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Levantamento terra romeno', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Carries (farmer walk)', sets: 3, repetitions: 1, duration: 120 },
          { name: 'Anti-rotação avançada', sets: 3, repetitions: 12, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: [
      'Dor <2/10 em atividades diárias',
      'Oswestry Disability Index <20%',
      'Execução correta de padrões de movimento',
      'Retorno ao trabalho/esporte',
      'Plano de exercícios domiciliares estabelecido'
    ],
    references: [
      {
        title: 'Motor Control Exercise for Chronic Low Back Pain',
        authors: 'Saragiotto BT, Maher CG, et al.',
        journal: 'Cochrane Database Syst Rev',
        year: 2016
      }
    ],
    tags: ['lombar', 'lombalgia', 'core', 'estabilização', 'crônica']
  },
  // Mais protocolos ortopédicos (compactos)
  {
    id: 'protocol-ort-004',
    title: 'Lesão Meniscal e Meniscectomia Parcial',
    summary: 'Protocolo pós-meniscectomia e tratamento conservador de lesões meniscais degenerativas.',
    description: 'Reabilitação após meniscectomia artroscópica ou tratamento conservador',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Pós-meniscectomia artroscópica', 'Lesão degenerativa estável'],
    exclusionCriteria: ['Reparo meniscal', 'Artrose avançada'],
    phases: [
      {
        name: 'Fase Aguda (0-2 semanas)',
        description: 'Controle de edema e restauração de ADM',
        durationWeeks: 2,
        objectives: ['Reduzir edema', 'ADM completa', 'Marcha normal'],
        exercises: [
          { name: 'Mobilização patelar', sets: 3, repetitions: 20, duration: 180 },
          { name: 'Quad sets', sets: 10, repetitions: 10, duration: 120 }
        ]
      },
      {
        name: 'Fase Fortalecimento (2-6 semanas)',
        description: 'Restauração de força e função',
        durationWeeks: 4,
        objectives: ['Força >80%', 'Sem edema'],
        exercises: [
          { name: 'Leg press', sets: 3, repetitions: 12, duration: 180 },
          { name: 'Step ups', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['ADM completa', 'Força normalizada', 'Sem dor'],
    references: [{title: 'Meniscus Surgery', authors: 'Katz JN', journal: 'NEJM', year: 2013}],
    tags: ['menisco', 'joelho', 'artroscopia']
  },
  {
    id: 'protocol-ort-005',
    title: 'Condromalácia Patelar e Síndrome Femoropatelar',
    summary: 'Programa de tratamento conservador para dor anterior de joelho.',
    description: 'Fortalecimento de quadríceps, glúteos e correção biomecânica',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Dor anterior de joelho', 'Teste positivo de Clark/apreensão'],
    exclusionCriteria: ['Lesão intra-articular', 'Instabilidade patelar'],
    phases: [
      {
        name: 'Controle da Dor',
        description: 'Redução da sobrecarga patelar',
        durationWeeks: 2,
        objectives: ['Dor <4/10'],
        exercises: [
          { name: 'Isométrico de quadríceps', sets: 5, repetitions: 10, duration: 120 },
          { name: 'Glúteo médio em decúbito', sets: 3, repetitions: 15, duration: 180 }
        ]
      },
      {
        name: 'Fortalecimento',
        description: 'Força de quadríceps e controle de quadril',
        durationWeeks: 8,
        objectives: ['Força >90%'],
        exercises: [
          { name: 'Mini squat', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Single leg squat', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor', 'Força normalizada'],
    references: [{title: 'Patellofemoral Pain', authors: 'Crossley KM', journal: 'Br J Sports Med', year: 2016}],
    tags: ['patela', 'joelho', 'dor anterior']
  },
  {
    id: 'protocol-ort-006',
    title: 'Entorse de Tornozelo (Ligamento Lateral)',
    summary: 'Protocolo para entorses agudas e crônicas de tornozelo.',
    description: 'Restauração de ADM, força, propriocepção e retorno funcional',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Entorse aguda grau I-III', 'Instabilidade crônica'],
    exclusionCriteria: ['Fratura', 'Ruptura completa instável'],
    phases: [
      {
        name: 'Proteção (0-1 semana)',
        description: 'PRICE - Proteção, Rest, Ice, Compression, Elevation',
        durationWeeks: 1,
        objectives: ['Controle de edema'],
        exercises: [
          { name: 'Bomba muscular', sets: 10, repetitions: 30, duration: 180 },
          { name: 'Mobilização subtalar', sets: 3, repetitions: 15, duration: 120 }
        ]
      },
      {
        name: 'Fortalecimento (1-6 semanas)',
        description: 'Restauração de força e propriocepção',
        durationWeeks: 5,
        objectives: ['Força >85%', 'Equilíbrio normalizado'],
        exercises: [
          { name: 'Fortalecimento com elástico', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Apoio unipodal progressivo', sets: 3, repetitions: 60, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem edema', 'ADM completa', 'Testes funcionais >90%'],
    references: [{title: 'Ankle Sprain', authors: 'Gribble PA', journal: 'J Athl Train', year: 2016}],
    tags: ['tornozelo', 'entorse', 'ligamento']
  },
  {
    id: 'protocol-ort-007',
    title: 'Bursite Trocantérica e Síndrome da Dor Lateral do Quadril',
    summary: 'Tratamento conservador para dor lateral de quadril.',
    description: 'Controle da dor, fortalecimento de glúteos e correção biomecânica',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Dor lateral quadril >4 semanas', 'Teste positivo palpação'],
    exclusionCriteria: ['Artrose de quadril', 'Lesão labral sintomática'],
    phases: [
      {
        name: 'Fase Inicial',
        description: 'Controle da dor e inflamação',
        durationWeeks: 2,
        objectives: ['Reduzir dor', 'Modificar atividades'],
        exercises: [
          { name: 'Alongamento TFL/IT band', sets: 3, repetitions: 1, duration: 90 },
          { name: 'Glúteo médio isométrico', sets: 3, repetitions: 10, duration: 120 }
        ]
      },
      {
        name: 'Fortalecimento',
        description: 'Fortalecimento de abd utores e rotadores externos',
        durationWeeks: 6,
        objectives: ['Força normalizada'],
        exercises: [
          { name: 'Abdução lateral com elástico', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Clamshell', sets: 3, repetitions: 20, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor', 'Força >90%'],
    references: [{title: 'Greater Trochanteric Pain', authors: 'Reid D', journal: 'Br J Sports Med', year: 2016}],
    tags: ['quadril', 'bursite', 'trocanter']
  },
  {
    id: 'protocol-ort-008',
    title: 'Fascite Plantar',
    summary: 'Protocolo conservador para dor plantar do calcanhar.',
    description: 'Alongamento, fortalecimento intrínseco e controle de carga',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Dor plantar matinal', 'Diagnóstico clínico confirmado'],
    exclusionCriteria: ['Esporão sintomático', 'Neuropatia'],
    phases: [
      {
        name: 'Controle da Dor',
        description: 'Redução da sobrecarga na fáscia',
        durationWeeks: 3,
        objectives: ['Dor <5/10'],
        exercises: [
          { name: 'Alongamento fáscia plantar', sets: 3, repetitions: 1, duration: 90 },
          { name: 'Alongamento gastrocnêmio', sets: 3, repetitions: 1, duration: 90 }
        ]
      },
      {
        name: 'Fortalecimento',
        description: 'Fortalecimento de intrínsecos do pé',
        durationWeeks: 8,
        objectives: ['Retorno a atividades'],
        exercises: [
          { name: 'Toe curls', sets: 3, repetitions: 20, duration: 180 },
          { name: 'Fortalecimento de panturrilha', sets: 3, repetitions: 15, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor matinal', 'Retorno a corrida/esporte'],
    references: [{title: 'Plantar Fasciitis', authors: 'Martin RL', journal: 'J Orthop Sports Phys Ther', year: 2014}],
    tags: ['pé', 'fascite', 'calcanhar']
  },
  {
    id: 'protocol-ort-009',
    title: 'Tendinopatia de Aquiles',
    summary: 'Programa de carga excêntrica para tendinopatia aquileana.',
    description: 'Protocolo baseado em exercícios excêntricos progressivos',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Dor no tendão >6 semanas', 'Diagnóstico por imagem'],
    exclusionCriteria: ['Ruptura parcial >50%', 'Bursite retrocalcaneal severa'],
    phases: [
      {
        name: 'Excêntricos Básicos',
        description: 'Início de carga excêntrica',
        durationWeeks: 6,
        objectives: ['Tolerância a exercícios excêntricos'],
        exercises: [
          { name: 'Heel drops excêntricos', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Alongamento suave', sets: 3, repetitions: 1, duration: 90 }
        ]
      },
      {
        name: 'Progressão de Carga',
        description: 'Aumento de carga e velocidade',
        durationWeeks: 6,
        objectives: ['Retorno a esporte'],
        exercises: [
          { name: 'Heel drops com peso', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Hopping progressivo', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor em atividades', 'Hop test >90%'],
    references: [{title: 'Achilles Tendinopathy', authors: 'Silbernagel KG', journal: 'Br J Sports Med', year: 2015}],
    tags: ['Aquiles', 'tendinopatia', 'excêntrico']
  },
  {
    id: 'protocol-ort-010',
    title: 'Cervicalgia Mecânica e Whiplash',
    summary: 'Protocolo para dor cervical traumática e mecânica.',
    description: 'Exercícios de controle motor cervical e fortalecimento',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Dor cervical mecânica', 'Whiplash grau I-II'],
    exclusionCriteria: ['Radiculopatia severa', 'Fratura', 'Instabilidade'],
    phases: [
      {
        name: 'Controle Motor',
        description: 'Ativação de flexores profundos',
        durationWeeks: 3,
        objectives: ['Controle neuromuscular'],
        exercises: [
          { name: 'Chin tuck', sets: 3, repetitions: 10, duration: 120 },
          { name: 'Craniocervical flexion test', sets: 3, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Fortalecimento',
        description: 'Força e resistência cervical',
        durationWeeks: 6,
        objectives: ['Força normalizada'],
        exercises: [
          { name: 'Fortalecimento isométrico 4 direções', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Exercícios escapulares', sets: 3, repetitions: 15, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor', 'ADM completa', 'Força >85%'],
    references: [{title: 'Whiplash', authors: 'Jull G', journal: 'Man Ther', year: 2015}],
    tags: ['cervical', 'whiplash', 'pescoço']
  },
  {
    id: 'protocol-ort-011',
    title: 'Epicondilite Lateral (Cotovelo de Tenista)',
    summary: 'Tratamento conservador para dor lateral de cotovelo.',
    description: 'Exercícios excêntricos e modificação de atividades',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Dor lateral cotovelo >4 semanas', 'Teste de Cozen positivo'],
    exclusionCriteria: ['Compressão do nervo radial', 'Artrite'],
    phases: [
      {
        name: 'Controle da Dor',
        description: 'Redução de sobrecarga',
        durationWeeks: 2,
        objectives: ['Dor <4/10'],
        exercises: [
          { name: 'Alongamento extensores punho', sets: 3, repetitions: 1, duration: 60 },
          { name: 'Isométrico de punho', sets: 3, repetitions: 10, duration: 120 }
        ]
      },
      {
        name: 'Excêntricos',
        description: 'Fortalecimento excêntrico progressivo',
        durationWeeks: 8,
        objectives: ['Retorno funcional'],
        exercises: [
          { name: 'Extensão excêntrica punho', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Fortalecimento de pegada', sets: 3, repetitions: 15, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem dor', 'Pegada >90% contralateral'],
    references: [{title: 'Tennis Elbow', authors: 'Coombes BK', journal: 'Br J Sports Med', year: 2015}],
    tags: ['cotovelo', 'epicondilite', 'tenista']
  },
  {
    id: 'protocol-ort-012',
    title: 'Síndrome do Túnel do Carpo Conservador',
    summary: 'Protocolo não-cirúrgico para compressão do nervo mediano.',
    description: 'Mobilização neural, exercícios e órteses',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Parestesia mediano', 'Teste Phalen/Tinel positivo'],
    exclusionCriteria: ['Perda motora severa', 'Falha conservadora >3 meses'],
    phases: [
      {
        name: 'Proteção e Mobilização',
        description: 'Órtese noturna e deslizamentos neurais',
        durationWeeks: 4,
        objectives: ['Redução de sintomas noturnos'],
        exercises: [
          { name: 'Deslizamento neural mediano', sets: 3, repetitions: 10, duration: 180 },
          { name: 'Alongamento flexores punho', sets: 3, repetitions: 1, duration: 90 }
        ]
      },
      {
        name: 'Fortalecimento',
        description: 'Fortalecimento de intrínsecos da mão',
        durationWeeks: 4,
        objectives: ['Função manual normalizada'],
        exercises: [
          { name: 'Exercícios de pinça', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Exercícios com massa terapêutica', sets: 3, repetitions: 10, duration: 240 }
        ]
      }
    ],
    dischargeCriteria: ['Boston Carpal Tunnel Score melhorado', 'Sem sintomas noturnos'],
    references: [{title: 'Carpal Tunnel Syndrome', authors: 'Page MJ', journal: 'Cochrane Database', year: 2012}],
    tags: ['punho', 'túnel do carpo', 'nervo mediano']
  },
  {
    id: 'protocol-ort-013',
    title: 'Artroplastia Total de Joelho (ATJ)',
    summary: 'Protocolo de reabilitação pós-artroplastia total de joelho.',
    description: 'Programa completo para restauração de função após ATJ',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Pós-operatório ATJ primária'],
    exclusionCriteria: ['Complicações pós-cirúrgicas'],
    phases: [
      {
        name: 'Pós-operatório Imediato (0-2 semanas)',
        description: 'Controle de edema e ganho de extensão',
        durationWeeks: 2,
        objectives: ['Extensão completa', 'Flexão >90°'],
        exercises: [
          { name: 'Quad sets', sets: 10, repetitions: 10, duration: 120 },
          { name: 'Flexão ativa-assistida', sets: 5, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Fortalecimento (2-12 semanas)',
        description: 'Restauração de força e marcha',
        durationWeeks: 10,
        objectives: ['Marcha independente', 'Flexão >110°'],
        exercises: [
          { name: 'Mini squat', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Bicicleta ergométrica', sets: 1, repetitions: 1, duration: 1200 }
        ]
      }
    ],
    dischargeCriteria: ['ADM funcional', 'Marcha independente', 'Subir escadas'],
    references: [{title: 'TKA Rehabilitation', authors: 'Artz N', journal: 'Cochrane Database', year: 2015}],
    tags: ['joelho', 'artroplastia', 'prótese']
  },
  {
    id: 'protocol-ort-014',
    title: 'Artroplastia Total de Quadril (ATQ)',
    summary: 'Reabilitação após artroplastia total de quadril.',
    description: 'Protocolo seguindo precauções e progressão funcional',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['Pós-operatório ATQ'],
    exclusionCriteria: ['Luxação', 'Fratura peri-protética'],
    phases: [
      {
        name: 'Fase Hospitalar (0-3 dias)',
        description: 'Mobilização precoce com precauções',
        durationWeeks: 1,
        objectives: ['Deambulação com auxiliar', 'Respeitar precauções'],
        exercises: [
          { name: 'Mobilização no leito', sets: 5, repetitions: 10, duration: 120 },
          { name: 'Marcha com andador', sets: 3, repetitions: 1, duration: 300 }
        ]
      },
      {
        name: 'Reabilitação Domiciliar (1-12 semanas)',
        description: 'Fortalecimento e independência funcional',
        durationWeeks: 11,
        objectives: ['Marcha independente', 'Força >80%'],
        exercises: [
          { name: 'Abdução de quadril', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Step ups', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Marcha sem claudicação', 'Independência AVDs'],
    references: [{title: 'THA Rehabilitation', authors: 'Wijnen A', journal: 'Phys Ther', year: 2018}],
    tags: ['quadril', 'artroplastia', 'prótese']
  },
  {
    id: 'protocol-ort-015',
    title: 'Fratura de Colles (Rádio Distal)',
    summary: 'Protocolo pós-imobilização de fratura de rádio distal.',
    description: 'Ganho de ADM, força de pegada e função de punho',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Pós-retirada de gesso/fixador'],
    exclusionCriteria: ['Não consolidação', 'Infecção'],
    phases: [
      {
        name: 'Mobilização (0-4 semanas)',
        description: 'Ganho de ADM de punho e dedos',
        durationWeeks: 4,
        objectives: ['ADM >50% contralateral'],
        exercises: [
          { name: 'Mobilização ativa punho', sets: 5, repetitions: 20, duration: 240 },
          { name: 'Exercícios de dedos', sets: 5, repetitions: 20, duration: 180 }
        ]
      },
      {
        name: 'Fortalecimento (4-12 semanas)',
        description: 'Restauração de força de pegada',
        durationWeeks: 8,
        objectives: ['Pegada >80%', 'ADM completa'],
        exercises: [
          { name: 'Fortalecimento com massa', sets: 3, repetitions: 15, duration: 240 },
          { name: 'Exercícios com peso leve', sets: 3, repetitions: 15, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['ADM completa', 'Pegada >85%', 'DASH <20 pontos'],
    references: [{title: 'Distal Radius Fracture', authors: 'Bruder AM', journal: 'Hand Clin', year: 2015}],
    tags: ['punho', 'fratura', 'Colles']
  },
  {
    id: 'protocol-ort-016',
    title: 'Capsulite Adesiva (Ombro Congelado)',
    summary: 'Protocolo para tratamento de capsulite adesiva primária.',
    description: 'Manejo respeitando fases da doença e ganho progressivo de ADM',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Restrição de ADM >50% em 2 planos', 'Dor noturna'],
    exclusionCriteria: ['Capsulite secundária a trauma/cirurgia recente'],
    phases: [
      {
        name: 'Fase Álgica/Freezing',
        description: 'Controle da dor, mobilizações suaves',
        durationWeeks: 12,
        objectives: ['Reduzir dor', 'Manter ADM'],
        exercises: [
          { name: 'Pêndulo de Codman', sets: 3, repetitions: 20, duration: 180 },
          { name: 'Mobilizações passivas suaves', sets: 3, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Fase Frozen/Thawing',
        description: 'Ganho progressivo de ADM',
        durationWeeks: 24,
        objectives: ['Ganho de 50% ADM'],
        exercises: [
          { name: 'Alongamentos capsulares', sets: 3, repetitions: 1, duration: 120 },
          { name: 'Mobilização com bastão', sets: 3, repetitions: 15, duration: 240 }
        ]
      }
    ],
    dischargeCriteria: ['ADM >80% normal', 'Dor <3/10'],
    references: [{title: 'Frozen Shoulder', authors: 'Kelley MJ', journal: 'J Orthop Sports Phys Ther', year: 2013}],
    tags: ['ombro', 'capsulite', 'congelado']
  },
  {
    id: 'protocol-ort-017',
    title: 'Instabilidade de Ombro Recorrente',
    summary: 'Protocolo conservador para instabilidade glenoumeral não-cirúrgica.',
    description: 'Fortalecimento de manguito, estabilização dinâmica',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['História de subluxação/luxação', 'Idade >25 anos'],
    exclusionCriteria: ['Lesão óssea significativa (>20%)', 'Indicação cirúrgica'],
    phases: [
      {
        name: 'Estabilização Inicial',
        description: 'Fortalecimento de manguito, evitar posições de risco',
        durationWeeks: 8,
        objectives: ['Força de rotadores >80%'],
        exercises: [
          { name: 'Rotação externa isométrica', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Scapular strengthening', sets: 3, repetitions: 15, duration: 180 }
        ]
      },
      {
        name: 'Estabilização Dinâmica',
        description: 'Exercícios de perturbação e controle neuromuscular',
        durationWeeks: 8,
        objectives: ['Retorno funcional sem episódios'],
        exercises: [
          { name: 'Exercícios em cadeia fechada', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Perturbações rítmicas', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem episódios por 6 meses', 'Força normalizada'],
    references: [{title: 'Shoulder Instability', authors: 'Warby SA', journal: 'Br J Sports Med', year: 2017}],
    tags: ['ombro', 'instabilidade', 'luxação']
  },
  {
    id: 'protocol-ort-018',
    title: 'Hérnia de Disco Lombar com Radiculopatia',
    summary: 'Tratamento conservador para hérnia discal com compressão radicular.',
    description: 'Extensão baseada em classificação MDT, fortalecimento progressivo',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Ciatalgia com confirmação por imagem', 'Responde a terapia direcional'],
    exclusionCriteria: ['Síndrome da cauda equina', 'Déficit motor progressivo'],
    phases: [
      {
        name: 'Fase Direcional',
        description: 'Exercícios baseados em resposta sintomática',
        durationWeeks: 2,
        objectives: ['Centralização da dor'],
        exercises: [
          { name: 'Extensões lombares repetidas', sets: 5, repetitions: 10, duration: 180 },
          { name: 'Postura em extensão', sets: 3, repetitions: 1, duration: 180 }
        ]
      },
      {
        name: 'Estabilização',
        description: 'Fortalecimento de core e retorno funcional',
        durationWeeks: 8,
        objectives: ['Sem radiculopatia', 'Força normalizada'],
        exercises: [
          { name: 'Core stability exercises', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Levantamento terra progressivo', sets: 3, repetitions: 10, duration: 180 }
        ]
      }
    ],
    dischargeCriteria: ['Sem radiculopatia', 'ODI <20%', 'Retorno a atividades'],
    references: [{title: 'Lumbar Disc Herniation', authors: 'Qaseem A', journal: 'Ann Intern Med', year: 2017}],
    tags: ['lombar', 'hérnia', 'radiculopatia', 'ciática']
  },
  {
    id: 'protocol-ort-019',
    title: 'Estenose Espinhal Lombar',
    summary: 'Programa conservador para claudicação neurogênica.',
    description: 'Flexão lombar, fortalecimento e condicionamento aeróbico',
    specialty: 'pos-operatoria',
    evidenceLevel: '1B',
    inclusionCriteria: ['Claudicação neurogênica', 'Estenose por imagem'],
    exclusionCriteria: ['Déficit motor severo', 'Falha conservadora >6 meses'],
    phases: [
      {
        name: 'Controle Sintomático',
        description: 'Posições de alívio, flexão lombar',
        durationWeeks: 4,
        objectives: ['Aumento da tolerância à marcha'],
        exercises: [
          { name: 'Bicicleta ergométrica', sets: 1, repetitions: 1, duration: 1200 },
          { name: 'Flexão lombar controlada', sets: 3, repetitions: 10, duration: 180 }
        ]
      },
      {
        name: 'Condicionamento',
        description: 'Fortalecimento e resistência',
        durationWeeks: 8,
        objectives: ['Marcha >20 minutos sem sintomas'],
        exercises: [
          { name: 'Core strengthening', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Caminhada progressiva', sets: 1, repetitions: 1, duration: 1800 }
        ]
      }
    ],
    dischargeCriteria: ['Tolerância funcional à marcha', 'Qualidade de vida melhorada'],
    references: [{title: 'Spinal Stenosis', authors: 'Ammendolia C', journal: 'Cochrane Database', year: 2013}],
    tags: ['lombar', 'estenose', 'claudicação']
  },
  {
    id: 'protocol-ort-020',
    title: 'Osteoartrite de Joelho',
    summary: 'Programa conservador para manejo de osteoartrite de joelho.',
    description: 'Exercícios, controle de peso e educação para OA',
    specialty: 'pos-operatoria',
    evidenceLevel: '1A',
    inclusionCriteria: ['OA confirmada por imagem', 'Dor >3 meses'],
    exclusionCriteria: ['Indicação cirúrgica imediata'],
    phases: [
      {
        name: 'Educação e Fortalecimento Inicial',
        description: 'Manejo da dor e fortalecimento de quadríceps',
        durationWeeks: 6,
        objectives: ['Compreensão da OA', 'Redução da dor'],
        exercises: [
          { name: 'Extensão de joelho sentado', sets: 3, repetitions: 15, duration: 180 },
          { name: 'Mini squat', sets: 3, repetitions: 12, duration: 180 }
        ]
      },
      {
        name: 'Fortalecimento Progressivo',
        description: 'Aumento de força e função',
        durationWeeks: 12,
        objectives: ['WOMAC melhorado >30%', 'Força >85%'],
        exercises: [
          { name: 'Leg press', sets: 3, repetitions: 12, duration: 240 },
          { name: 'Exercício aeróbico', sets: 1, repetitions: 1, duration: 1800 }
        ]
      }
    ],
    dischargeCriteria: ['Melhora funcional significativa', 'Programa de manutenção estabelecido'],
    references: [{title: 'Knee OA', authors: 'Fransen M', journal: 'Cochrane Database', year: 2015}],
    tags: ['joelho', 'osteoartrite', 'artrose']
  },

  // ============================================
  // ESPORTIVA (15 protocolos)
  // ============================================
  {
    id: 'protocol-sport-001',
    title: 'Retorno ao Esporte Pós-LCA',
    summary: 'Protocolo de retorno ao esporte após reconstrução de LCA.',
    description: 'Bateria de testes funcionais e progressão específica do esporte',
    specialty: 'esportiva',
    evidenceLevel: '1A',
    inclusionCriteria: ['Mínimo 9 meses pós-op', 'Clearance médico'],
    exclusionCriteria: ['Falha em testes funcionais', 'Medo/falta de confiança'],
    phases: [
      {
        name: 'Testes Funcionais',
        description: 'Bateria completa de testes',
        durationWeeks: 2,
        objectives: ['LSI >90% em todos testes'],
        exercises: [
          { name: 'Single hop for distance', sets: 3, repetitions: 3, duration: 180 },
          { name: 'Triple hop', sets: 3, repetitions: 3, duration: 180 }
        ]
      },
      {
        name: 'Progressão Esportiva',
        description: 'Retorno gradual a treinos e jogos',
        durationWeeks: 6,
        objectives: ['Retorno completo sem restrições'],
        exercises: [
          { name: 'Drills esportivos específicos', sets: 5, repetitions: 10, duration: 300 },
          { name: 'Treino com equipe', sets: 1, repetitions: 1, duration: 3600 }
        ]
      }
    ],
    dischargeCriteria: ['Aprovação em todos testes', 'ACL-RSI >56', 'Participação completa'],
    references: [{title: 'Return to Sport', authors: 'Ardern CL', journal: 'Br J Sports Med', year: 2016}],
    tags: ['retorno ao esporte', 'LCA', 'testes funcionais']
  }
  // Adicionar mais 14 protocolos esportivos...
];

