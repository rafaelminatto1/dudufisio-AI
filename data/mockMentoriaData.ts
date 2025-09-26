import { 
  Intern, 
  InternStatus, 
  EducationalCase, 
  Competency, 
  CompetencyLevel, 
  CompetencyCategory,
  InternCompetency,
  CompetencyEvaluation,
  EducationalResource,
  LearningPath,
  Certification,
  MentorshipMetrics,
  CaseDiscussion,
  CaseDiscussionReply,
  CaseEvaluation
} from '../types';

export const mockCompetencies: Competency[] = [
  {
    id: 'comp_1',
    name: 'Avaliação Fisioterapêutica Inicial',
    category: CompetencyCategory.Assessment,
    description: 'Capacidade de realizar avaliação completa e sistemática do paciente',
    evaluationCriteria: [
      'Coleta anamnese completa e direcionada',
      'Realiza exame físico detalhado e específico',
      'Identifica problemas funcionais prioritários',
      'Estabelece diagnóstico fisioterapêutico preciso',
      'Documenta adequadamente os achados'
    ],
    requiredLevel: CompetencyLevel.Intermediate,
    weight: 9
  },
  {
    id: 'comp_2',
    name: 'Técnicas de Terapia Manual',
    category: CompetencyCategory.Treatment,
    description: 'Aplicação segura e eficaz de técnicas de terapia manual',
    evaluationCriteria: [
      'Seleciona técnica apropriada para a condição',
      'Executa com precisão e segurança',
      'Monitora resposta do paciente continuamente',
      'Ajusta intensidade conforme necessário',
      'Observa contraindicações e precauções'
    ],
    requiredLevel: CompetencyLevel.Advanced,
    weight: 8
  },
  {
    id: 'comp_3',
    name: 'Comunicação com Pacientes',
    category: CompetencyCategory.Communication,
    description: 'Comunicação efetiva e empática com pacientes e familiares',
    evaluationCriteria: [
      'Usa linguagem acessível e clara',
      'Demonstra empatia e compreensão',
      'Escuta ativamente as preocupações',
      'Fornece orientações claras e específicas',
      'Gerencia expectativas de forma realista'
    ],
    requiredLevel: CompetencyLevel.Intermediate,
    weight: 7
  },
  {
    id: 'comp_4',
    name: 'Prescrição de Exercícios Terapêuticos',
    category: CompetencyCategory.Treatment,
    description: 'Capacidade de prescrever e progredir exercícios terapêuticos',
    evaluationCriteria: [
      'Seleciona exercícios baseados em evidências',
      'Estabelece dosagem apropriada',
      'Ensina execução correta',
      'Monitora progressão adequadamente',
      'Modifica conforme evolução'
    ],
    requiredLevel: CompetencyLevel.Advanced,
    weight: 9
  },
  {
    id: 'comp_5',
    name: 'Documentação Clínica',
    category: CompetencyCategory.Documentation,
    description: 'Elaboração de documentação clínica completa e precisa',
    evaluationCriteria: [
      'Redige evoluções claras e objetivas',
      'Documenta objetivos mensuráveis',
      'Registra intervenções realizadas',
      'Avalia resultados obtidos',
      'Mantém confidencialidade'
    ],
    requiredLevel: CompetencyLevel.Intermediate,
    weight: 6
  },
  {
    id: 'comp_6',
    name: 'Raciocínio Clínico',
    category: CompetencyCategory.Assessment,
    description: 'Desenvolvimento de raciocínio clínico estruturado',
    evaluationCriteria: [
      'Analisa dados de forma sistemática',
      'Identifica padrões e relações',
      'Formula hipóteses diagnósticas',
      'Testa hipóteses adequadamente',
      'Revisa conclusões conforme novos dados'
    ],
    requiredLevel: CompetencyLevel.Advanced,
    weight: 10
  }
];

export const mockInterns: Intern[] = [
  {
    id: 'intern_1',
    name: 'João Silva',
    email: 'joao.silva@unifesp.br',
    phone: '(11) 98765-4321',
    institution: 'Universidade Federal de São Paulo',
    semester: 8,
    startDate: '2024-02-01',
    endDate: '2024-07-01',
    status: InternStatus.Active,
    avatarUrl: 'https://i.pravatar.cc/150?u=intern_1',
    supervisorId: 'therapist_1',
    supervisorName: 'Dr. Roberto',
    averageGrade: 8.7,
    totalHours: 400,
    completedHours: 280,
    competencies: [
      {
        id: 'ic_1',
        internId: 'intern_1',
        competencyId: 'comp_1',
        currentLevel: CompetencyLevel.Intermediate,
        targetLevel: CompetencyLevel.Advanced,
        evaluations: [
          {
            id: 'eval_1',
            internCompetencyId: 'ic_1',
            evaluatorId: 'therapist_1',
            evaluatorName: 'Dr. Roberto',
            level: CompetencyLevel.Intermediate,
            score: 8,
            feedback: 'Demonstra boa técnica de avaliação, precisa melhorar documentação dos achados funcionais',
            evaluatedAt: '2024-06-15',
            type: 'supervisor'
          }
        ],
        lastEvaluatedAt: '2024-06-15',
        progress: 75
      },
      {
        id: 'ic_2',
        internId: 'intern_1',
        competencyId: 'comp_3',
        currentLevel: CompetencyLevel.Advanced,
        targetLevel: CompetencyLevel.Expert,
        evaluations: [
          {
            id: 'eval_2',
            internCompetencyId: 'ic_2',
            evaluatorId: 'therapist_1',
            evaluatorName: 'Dr. Roberto',
            level: CompetencyLevel.Advanced,
            score: 9,
            feedback: 'Excelente rapport com pacientes, comunicação muito efetiva',
            evaluatedAt: '2024-06-15',
            type: 'supervisor'
          }
        ],
        lastEvaluatedAt: '2024-06-15',
        progress: 90
      }
    ],
    clinicalCases: ['case_1', 'case_3']
  },
  {
    id: 'intern_2',
    name: 'Maria Santos',
    email: 'maria.santos@pucsp.edu.br',
    phone: '(11) 91234-5678',
    institution: 'PUC-SP',
    semester: 9,
    startDate: '2024-02-15',
    endDate: '2024-07-15',
    status: InternStatus.Active,
    avatarUrl: 'https://i.pravatar.cc/150?u=intern_2',
    supervisorId: 'therapist_2',
    supervisorName: 'Dra. Camila',
    averageGrade: 9.1,
    totalHours: 400,
    completedHours: 320,
    competencies: [
      {
        id: 'ic_3',
        internId: 'intern_2',
        competencyId: 'comp_2',
        currentLevel: CompetencyLevel.Advanced,
        targetLevel: CompetencyLevel.Expert,
        evaluations: [
          {
            id: 'eval_3',
            internCompetencyId: 'ic_3',
            evaluatorId: 'therapist_2',
            evaluatorName: 'Dra. Camila',
            level: CompetencyLevel.Advanced,
            score: 9,
            feedback: 'Excelente domínio das técnicas manuais, muito precisa na execução',
            evaluatedAt: '2024-06-20',
            type: 'supervisor'
          }
        ],
        lastEvaluatedAt: '2024-06-20',
        progress: 90
      },
      {
        id: 'ic_4',
        internId: 'intern_2',
        competencyId: 'comp_6',
        currentLevel: CompetencyLevel.Intermediate,
        targetLevel: CompetencyLevel.Advanced,
        evaluations: [
          {
            id: 'eval_4',
            internCompetencyId: 'ic_4',
            evaluatorId: 'therapist_2',
            evaluatorName: 'Dra. Camila',
            level: CompetencyLevel.Intermediate,
            score: 8,
            feedback: 'Bom raciocínio clínico, precisa desenvolver mais a formulação de hipóteses',
            evaluatedAt: '2024-06-20',
            type: 'supervisor'
          }
        ],
        lastEvaluatedAt: '2024-06-20',
        progress: 70
      }
    ],
    clinicalCases: ['case_2', 'case_4']
  },
  {
    id: 'intern_3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@usp.br',
    phone: '(11) 95555-1234',
    institution: 'USP',
    semester: 7,
    startDate: '2024-01-10',
    endDate: '2024-06-10',
    status: InternStatus.Graduated,
    avatarUrl: 'https://i.pravatar.cc/150?u=intern_3',
    supervisorId: 'therapist_1',
    supervisorName: 'Dr. Roberto',
    averageGrade: 7.8,
    totalHours: 400,
    completedHours: 400,
    competencies: [],
    clinicalCases: ['case_1', 'case_2']
  },
  {
    id: 'intern_4',
    name: 'Ana Carolina Ferreira',
    email: 'ana.ferreira@mackenzie.br',
    phone: '(11) 94444-5555',
    institution: 'Universidade Presbiteriana Mackenzie',
    semester: 8,
    startDate: '2024-03-01',
    endDate: '2024-08-01',
    status: InternStatus.Active,
    avatarUrl: 'https://i.pravatar.cc/150?u=intern_4',
    supervisorId: 'therapist_3',
    supervisorName: 'Dr. Fernando',
    averageGrade: 8.9,
    totalHours: 400,
    completedHours: 200,
    competencies: [
      {
        id: 'ic_5',
        internId: 'intern_4',
        competencyId: 'comp_4',
        currentLevel: CompetencyLevel.Beginner,
        targetLevel: CompetencyLevel.Intermediate,
        evaluations: [],
        progress: 45
      }
    ],
    clinicalCases: ['case_5']
  }
];

export const mockEducationalCases: EducationalCase[] = [
  {
    id: 'case_1',
    title: 'Reabilitação pós-cirúrgica de LCA em atleta',
    description: 'Paciente de 25 anos, atleta profissional, submetido à reconstrução do ligamento cruzado anterior.',
    specialty: 'Ortopedia',
    difficultyLevel: 4,
    patientProfile: {
      age: 25,
      gender: 'M',
      occupation: 'Jogador de futebol profissional',
      medicalHistory: ['Lesão prévia no joelho contralateral há 3 anos', 'Sem outras comorbidades relevantes'],
      currentComplaints: 'Dor e limitação funcional no joelho direito pós-cirurgia de reconstrução de LCA'
    },
    clinicalPresentation: {
      symptoms: ['Dor moderada no joelho (4/10)', 'Edema peripatelar', 'Limitação de movimento', 'Fraqueza muscular em quadríceps'],
      physicalExam: 'Cicatriz cirúrgica em bom estado de cicatrização, edema moderado (+/4+), ADM limitada em extensão (-5°) e flexão (0-125°)',
      functionalTests: ['Hop test contraindicado nesta fase', 'Single leg stance comprometido', 'Teste de Lachman negativo (enxerto estável)'],
      imaging: ['RM pós-operatória: enxerto bem posicionado', 'RX: sem alterações ósseas significativas', 'Ausência de derrame articular significativo']
    },
    diagnosis: {
      primary: 'Pós-operatório de reconstrução de LCA (3 meses)',
      secondary: ['Hipotrofia de quadríceps direito', 'Déficit proprioceptivo', 'Limitação funcional para atividades esportivas'],
      differentialDiagnosis: ['Complicações pós-operatórias (rigidez articular)', 'Lesões meniscais associadas', 'Síndrome patelofemoral']
    },
    treatmentPlan: {
      goals: [
        'Controle completo da dor e edema',
        'Recuperação total da amplitude de movimento',
        'Fortalecimento muscular progressivo (quadríceps, isquiotibiais, glúteos)',
        'Melhora da propriocepção e controle neuromuscular',
        'Retorno gradual ao esporte de alto nível'
      ],
      interventions: [
        'Crioterapia para controle de edema',
        'Mobilização articular passiva e ativa assistida',
        'Exercícios de fortalecimento em cadeia cinética aberta e fechada',
        'Treino proprioceptivo progressivo',
        'Exercícios funcionais específicos do esporte'
      ],
      duration: '4-6 meses para retorno completo ao esporte',
      frequency: '3x por semana nas primeiras 8 semanas, depois 2x por semana',
      progressIndicators: ['ADM completa', 'Força muscular simétrica', 'Testes funcionais normalizados', 'Retorno aos treinos e jogos']
    },
    outcomes: {
      shortTerm: ['Redução da dor para 0-2/10', 'Melhora da ADM para valores normais', 'Redução significativa do edema'],
      longTerm: ['Retorno ao esporte sem limitações', 'Prevenção de re-lesões', 'Manutenção da performance atlética'],
      complications: ['Rigidez articular (artrofibrose)', 'Ruptura do enxerto', 'Síndrome da dor patelofemoral']
    },
    learningObjectives: [
      'Compreender as fases da reabilitação pós-reconstrução de LCA',
      'Aplicar critérios de progressão baseados em evidências',
      'Identificar sinais de alerta para complicações',
      'Desenvolver programa de exercícios específico para atletas',
      'Integrar aspectos psicológicos do retorno ao esporte'
    ],
    discussionPoints: [
      'Quando é seguro iniciar exercícios de cadeia cinética fechada?',
      'Quais são os critérios objetivos para retorno ao esporte?',
      'Como prevenir re-lesões em atletas?',
      'Qual o papel da propriocepção na reabilitação?',
      'Como abordar o medo de re-lesão?'
    ],
    references: [
      'Myer GD, et al. Rehabilitation after anterior cruciate ligament reconstruction. Sports Med. 2008;38(9):729-46.',
      'Adams D, et al. Current concepts for anterior cruciate ligament reconstruction. Am J Sports Med. 2012;40(10):2309-18.',
      'Grindem H, et al. Simple decision rules can reduce reinjury risk after ACL reconstruction. Br J Sports Med. 2016;50(13):804-8.'
    ],
    createdBy: 'Dr. Roberto',
    createdAt: '2024-06-15',
    lastUpdated: '2024-06-20',
    tags: ['LCA', 'pós-operatório', 'esporte', 'joelho', 'atleta'],
    isPublished: true,
    discussions: [
      {
        id: 'disc_1',
        caseId: 'case_1',
        userId: 'intern_1',
        userName: 'João Silva',
        userRole: 'Estagiário',
        content: 'Quando devemos iniciar os exercícios de cadeia cinética fechada? Li que alguns protocolos começam com 6 semanas e outros com 12 semanas.',
        createdAt: '2024-06-16',
        replies: [
          {
            id: 'reply_1',
            discussionId: 'disc_1',
            userId: 'therapist_1',
            userName: 'Dr. Roberto',
            content: 'Excelente pergunta! Geralmente iniciamos após 6-8 semanas, mas depende da cicatrização do enxerto e da ausência de derrame. O mais importante é respeitar a biologia da cicatrização.',
            createdAt: '2024-06-16',
            votes: 3
          },
          {
            id: 'reply_2',
            discussionId: 'disc_1',
            userId: 'intern_2',
            userName: 'Maria Santos',
            content: 'No meu estágio anterior, começávamos com exercícios isométricos em cadeia fechada já na 4ª semana, mas com carga parcial. Isso está correto?',
            createdAt: '2024-06-17',
            votes: 1
          }
        ],
        votes: 2
      }
    ],
    evaluations: [
      {
        id: 'ceval_1',
        caseId: 'case_1',
        userId: 'intern_1',
        rating: 5,
        difficulty: 4,
        usefulness: 5,
        feedback: 'Caso muito completo e realista. Ajudou muito a entender a progressão da reabilitação.',
        createdAt: '2024-06-17'
      },
      {
        id: 'ceval_2',
        caseId: 'case_1',
        userId: 'intern_2',
        rating: 5,
        difficulty: 4,
        usefulness: 4,
        feedback: 'Excelente detalhamento das fases. Gostaria de mais informações sobre os aspectos psicológicos.',
        createdAt: '2024-06-18'
      }
    ]
  },
  {
    id: 'case_2',
    title: 'AVC isquêmico com hemiplegia direita',
    description: 'Paciente de 58 anos com sequelas de AVC isquêmico, apresentando hemiplegia à direita.',
    specialty: 'Neurologia',
    difficultyLevel: 5,
    patientProfile: {
      age: 58,
      gender: 'F',
      occupation: 'Professora aposentada',
      medicalHistory: ['Hipertensão arterial sistêmica', 'Diabetes mellitus tipo 2', 'Dislipidemia', 'Fibrilação atrial'],
      currentComplaints: 'Paralisia do lado direito do corpo e dificuldade para falar após AVC há 3 meses'
    },
    clinicalPresentation: {
      symptoms: ['Hemiplegia à direita', 'Afasia de expressão (Broca)', 'Disfagia leve', 'Negligência espacial'],
      physicalExam: 'Hemiplegia flácida à direita evoluindo para espástica, reflexos tendinosos aumentados (+3/4), sinal de Babinski presente',
      functionalTests: ['Escala de Fugl-Meyer: 28/66', 'Berg Balance Scale: 12/56', 'Índice de Barthel: 35/100'],
      imaging: ['TC de crânio: área de infarto em território da artéria cerebral média esquerda', 'Angiotomografia: oclusão de ramo da ACM']
    },
    diagnosis: {
      primary: 'Sequelas de AVC isquêmico - hemiplegia direita',
      secondary: ['Afasia de Broca', 'Disfagia neurogênica leve', 'Negligência espacial unilateral'],
      differentialDiagnosis: ['Ataque isquêmico transitório', 'Tumor cerebral', 'Encefalite', 'Hemorragia intracerebral']
    },
    treatmentPlan: {
      goals: [
        'Recuperação do controle motor voluntário',
        'Melhora do equilíbrio e controle postural',
        'Independência nas atividades de vida diária',
        'Prevenção de complicações secundárias',
        'Melhora da comunicação funcional'
      ],
      interventions: [
        'Facilitação neuromuscular proprioceptiva (FNP)',
        'Treino de marcha com suporte parcial de peso',
        'Exercícios de equilíbrio e coordenação',
        'Terapia de contenção induzida',
        'Treino de atividades funcionais'
      ],
      duration: '6-12 meses com possibilidade de ganhos até 2 anos',
      frequency: '5x por semana nas primeiras 12 semanas, depois 3x por semana',
      progressIndicators: ['Escala de Fugl-Meyer', 'Berg Balance Scale', 'Índice de Barthel', 'Velocidade de marcha']
    },
    outcomes: {
      shortTerm: ['Melhora do tônus muscular', 'Início de movimentos voluntários', 'Melhora do controle de tronco'],
      longTerm: ['Marcha independente com ou sem dispositivo auxiliar', 'Independência nas AVDs básicas', 'Comunicação funcional'],
      complications: ['Espasticidade severa', 'Dor no ombro hemiplégico', 'Depressão pós-AVC', 'Quedas']
    },
    learningObjectives: [
      'Compreender os princípios da neuroplasticidade',
      'Aplicar conceitos de facilitação neuromuscular',
      'Avaliar e monitorar o progresso neurológico',
      'Identificar e prevenir complicações secundárias',
      'Integrar abordagem multidisciplinar'
    ],
    discussionPoints: [
      'Quando iniciar o treino de marcha?',
      'Como manejar a espasticidade de forma eficaz?',
      'Qual o papel da terapia de contenção induzida?',
      'Como prevenir o ombro doloroso hemiplégico?',
      'Importância do suporte familiar na reabilitação'
    ],
    references: [
      'Pollock A, et al. Physical rehabilitation approaches for the recovery of function and mobility after stroke. Stroke. 2019;50(5):1383-1390.',
      'Langhorne P, et al. Motor recovery after acute stroke. Lancet Neurol. 2009;8(8):741-754.',
      'Veerbeek JM, et al. What is the evidence for physical therapy poststroke? Arch Phys Med Rehabil. 2014;95(5):986-1001.'
    ],
    createdBy: 'Dra. Camila',
    createdAt: '2024-06-10',
    lastUpdated: '2024-06-18',
    tags: ['AVC', 'hemiplegia', 'neurologia', 'reabilitação', 'neuroplasticidade'],
    isPublished: true,
    discussions: [],
    evaluations: []
  }
];

export const mockEducationalResources: EducationalResource[] = [
  {
    id: 'resource_1',
    title: 'Avaliação da Marcha: Análise Cinemática',
    type: 'video',
    category: 'Avaliação',
    specialty: ['Neurologia', 'Ortopedia'],
    description: 'Vídeo educacional sobre análise cinemática da marcha normal e patológica, incluindo fases da marcha e padrões compensatórios',
    url: 'https://youtube.com/watch?v=example1',
    duration: 45,
    difficulty: 3,
    tags: ['marcha', 'cinemática', 'avaliação', 'biomecânica'],
    author: 'Dr. Roberto Silva',
    publishedAt: '2024-05-15',
    lastUpdated: '2024-06-01',
    views: 1250,
    rating: 4.7,
    reviews: [
      {
        id: 'review_1',
        resourceId: 'resource_1',
        userId: 'intern_1',
        userName: 'João Silva',
        rating: 5,
        review: 'Excelente material, muito didático! Ajudou muito a entender os padrões patológicos.',
        createdAt: '2024-06-02',
        helpful: 8
      }
    ],
    isRecommended: true,
    prerequisites: ['Anatomia básica do sistema locomotor', 'Biomecânica fundamental'],
    learningOutcomes: [
      'Identificar as fases da marcha normal',
      'Reconhecer padrões patológicos comuns',
      'Aplicar análise cinemática na prática clínica'
    ]
  },
  {
    id: 'resource_2',
    title: 'Protocolo de Reabilitação Cardíaca - Fase I',
    type: 'protocol',
    category: 'Protocolos',
    specialty: ['Cardiorrespiratória'],
    description: 'Protocolo completo para reabilitação cardíaca hospitalar (Fase I), incluindo critérios de elegibilidade e progressão',
    content: '## Protocolo de Reabilitação Cardíaca Fase I...',
    difficulty: 4,
    tags: ['cardíaca', 'protocolo', 'hospitalar', 'fase I'],
    author: 'Dra. Maria Fernanda',
    publishedAt: '2024-04-20',
    lastUpdated: '2024-05-30',
    views: 890,
    rating: 4.9,
    reviews: [],
    isRecommended: true,
    prerequisites: ['Fisiologia cardiovascular', 'Fisiopatologia cardíaca'],
    learningOutcomes: [
      'Aplicar protocolo de reabilitação cardíaca fase I',
      'Monitorar sinais vitais adequadamente',
      'Identificar contraindicações e interromper exercícios quando necessário'
    ]
  },
  {
    id: 'resource_3',
    title: 'Técnicas de Mobilização Neural',
    type: 'video',
    category: 'Tratamento',
    specialty: ['Ortopedia', 'Neurologia'],
    description: 'Demonstração prática das principais técnicas de mobilização neural para membros superiores e inferiores',
    url: 'https://youtube.com/watch?v=example3',
    duration: 60,
    difficulty: 4,
    tags: ['mobilização neural', 'nervos periféricos', 'técnicas manuais'],
    author: 'Dr. Fernando Costa',
    publishedAt: '2024-03-10',
    lastUpdated: '2024-05-15',
    views: 2100,
    rating: 4.8,
    reviews: [
      {
        id: 'review_2',
        resourceId: 'resource_3',
        userId: 'intern_2',
        userName: 'Maria Santos',
        rating: 5,
        review: 'Técnicas muito bem demonstradas, material de excelente qualidade.',
        createdAt: '2024-05-16',
        helpful: 12
      }
    ],
    isRecommended: true,
    prerequisites: ['Anatomia do sistema nervoso periférico', 'Técnicas básicas de terapia manual'],
    learningOutcomes: [
      'Executar técnicas de mobilização neural com segurança',
      'Identificar indicações e contraindicações',
      'Integrar mobilização neural no plano de tratamento'
    ]
  }
];

export const mockLearningPaths: LearningPath[] = [
  {
    id: 'path_1',
    name: 'Especialização em Fisioterapia Neurológica',
    description: 'Trilha completa para desenvolvimento em fisioterapia neurológica, desde conceitos básicos até técnicas avançadas',
    specialty: 'Neurologia',
    difficulty: CompetencyLevel.Advanced,
    estimatedDuration: 120,
    resources: ['resource_1', 'resource_2'],
    prerequisites: ['Graduação em Fisioterapia', 'Experiência clínica básica de 6 meses'],
    objectives: [
      'Dominar avaliação neurológica completa',
      'Aplicar técnicas de facilitação neuromuscular',
      'Desenvolver planos de tratamento específicos para condições neurológicas',
      'Compreender princípios de neuroplasticidade aplicados à reabilitação'
    ],
    assessments: ['Prova teórica (70 questões)', 'Avaliação prática com paciente real', 'Estudo de caso detalhado'],
    completionCriteria: ['Completar 80% das atividades', 'Obter nota mínima 7.0 em todas as avaliações', 'Apresentar estudo de caso final'],
    createdBy: 'Dr. Roberto',
    createdAt: '2024-05-01',
    enrollments: 25,
    completions: 8
  },
  {
    id: 'path_2',
    name: 'Fisioterapia Ortopédica e Traumatológica',
    description: 'Formação completa em fisioterapia ortopédica, incluindo avaliação, tratamento e reabilitação',
    specialty: 'Ortopedia',
    difficulty: CompetencyLevel.Intermediate,
    estimatedDuration: 80,
    resources: ['resource_3'],
    prerequisites: ['Graduação em Fisioterapia'],
    objectives: [
      'Realizar avaliação ortopédica sistemática',
      'Aplicar técnicas de terapia manual',
      'Prescrever exercícios terapêuticos baseados em evidências',
      'Desenvolver programas de reabilitação pós-cirúrgica'
    ],
    assessments: ['Avaliação teórica', 'Prática clínica supervisionada', 'Seminário final'],
    completionCriteria: ['75% de presença', 'Nota mínima 7.0', 'Aprovação na prática clínica'],
    createdBy: 'Dra. Camila',
    createdAt: '2024-04-15',
    enrollments: 18,
    completions: 12
  }
];

export const mockCertifications: Certification[] = [
  {
    id: 'cert_1',
    name: 'Certificação em Terapia Manual Ortopédica',
    description: 'Certificação em técnicas avançadas de terapia manual para condições ortopédicas',
    issuer: 'Instituto FisioFlow',
    type: 'competency',
    requirements: [
      {
        type: 'course',
        description: 'Curso de Terapia Manual - 40h',
        target: 'course_tm_40h',
        completed: false
      },
      {
        type: 'assessment',
        description: 'Avaliação Prática',
        target: '8.0',
        completed: false
      },
      {
        type: 'hours',
        description: 'Horas de prática supervisionada',
        target: 20,
        completed: false
      }
    ],
    validityPeriod: 24,
    credits: 10,
    badgeUrl: 'https://example.com/badge-terapia-manual.png'
  },
  {
    id: 'cert_2',
    name: 'Especialista em Reabilitação Neurológica',
    description: 'Certificação avançada em reabilitação de pacientes neurológicos',
    issuer: 'Conselho Regional de Fisioterapia',
    type: 'competency',
    requirements: [
      {
        type: 'course',
        description: 'Curso de Neurologia Aplicada - 60h',
        target: 'course_neuro_60h',
        completed: true,
        completedAt: '2024-05-15'
      },
      {
        type: 'assessment',
        description: 'Exame de Certificação',
        target: '7.5',
        completed: false
      },
      {
        type: 'project',
        description: 'Projeto de Pesquisa',
        target: 'projeto_neuro',
        completed: false
      }
    ],
    validityPeriod: 36,
    credits: 15,
    badgeUrl: 'https://example.com/badge-neuro.png'
  }
];

export const mockMentorshipMetrics: MentorshipMetrics = {
  totalInterns: 4,
  activeInterns: 3,
  graduatedInterns: 1,
  averageCompetencyProgress: 72.5,
  totalCases: 2,
  averageCaseRating: 4.8,
  totalResources: 3,
  totalLearningPaths: 2,
  monthlyProgress: [
    {
      month: '2024-01',
      newInterns: 1,
      graduatedInterns: 0,
      completedCases: 0,
      resourcesAdded: 1
    },
    {
      month: '2024-02',
      newInterns: 2,
      graduatedInterns: 0,
      completedCases: 1,
      resourcesAdded: 1
    },
    {
      month: '2024-03',
      newInterns: 1,
      graduatedInterns: 0,
      completedCases: 1,
      resourcesAdded: 1
    },
    {
      month: '2024-04',
      newInterns: 0,
      graduatedInterns: 0,
      completedCases: 0,
      resourcesAdded: 2
    },
    {
      month: '2024-05',
      newInterns: 0,
      graduatedInterns: 0,
      completedCases: 2,
      resourcesAdded: 1
    },
    {
      month: '2024-06',
      newInterns: 0,
      graduatedInterns: 1,
      completedCases: 1,
      resourcesAdded: 0
    }
  ],
  competencyDistribution: {
    'Avaliação': {
      'Iniciante': 1,
      'Intermediário': 2,
      'Avançado': 1,
      'Expert': 0
    },
    'Tratamento': {
      'Iniciante': 1,
      'Intermediário': 1,
      'Avançado': 2,
      'Expert': 0
    },
    'Comunicação': {
      'Iniciante': 0,
      'Intermediário': 1,
      'Avançado': 2,
      'Expert': 1
    },
    'Documentação': {
      'Iniciante': 2,
      'Intermediário': 1,
      'Avançado': 1,
      'Expert': 0
    }
  }
};