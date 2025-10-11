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
  // ============================================
  // CASOS ORTOPÉDICOS (8 casos)
  // ============================================
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
    discussions: [],
    evaluations: []
  },
  {
    id: 'case_2',
    title: 'Síndrome do Impacto do Ombro - Atleta de Natação',
    description: 'Paciente de 22 anos, nadadora competitiva, com dor crônica no ombro direito há 6 meses.',
    specialty: 'Ortopedia',
    difficultyLevel: 3,
    patientProfile: {
      age: 22,
      gender: 'F',
      occupation: 'Nadadora competitiva - modalidade livre',
      medicalHistory: ['Treinamento intensivo há 8 anos', 'Lesão prévia no ombro esquerdo (2019)', 'Sem comorbidades'],
      currentComplaints: 'Dor no ombro direito durante e após treinos, especialmente nos nados livre e costas'
    },
    clinicalPresentation: {
      symptoms: ['Dor no ombro direito (6/10)', 'Sensação de travamento ocasional', 'Fadiga muscular precoce', 'Dificuldade para dormir sobre o lado direito'],
      physicalExam: 'Dor à palpação no manguito rotador, teste de Neer positivo, teste de Hawkins positivo, força 4/5 em rotação externa',
      functionalTests: ['DASH: 45/100', 'Teste de Apley: limitado em rotação externa', 'Single arm lift test: positivo'],
      imaging: ['RM: tendinopatia do supraespinhal', 'RX: acrômio tipo III (curvado)', 'USG: bursite subacromial']
    },
    diagnosis: {
      primary: 'Síndrome do impacto do ombro com tendinopatia do supraespinhal',
      secondary: ['Bursite subacromial', 'Instabilidade funcional do ombro', 'Disfunção escapular'],
      differentialDiagnosis: ['Luxação recidivante', 'Lesão labral', 'Capsulite adesiva', 'Artrose acromioclavicular']
    },
    treatmentPlan: {
      goals: [
        'Eliminação da dor e inflamação',
        'Restauração da função completa do ombro',
        'Correção da disfunção escapular',
        'Retorno ao treinamento competitivo',
        'Prevenção de recidivas'
      ],
      interventions: [
        'Modificação temporária do treinamento',
        'Exercícios de fortalecimento do manguito rotador',
        'Correção da postura escapular',
        'Alongamentos específicos',
        'Técnicas de terapia manual'
      ],
      duration: '3-4 meses para retorno completo',
      frequency: '3x por semana por 8 semanas, depois 2x por semana',
      progressIndicators: ['Redução da dor', 'Melhora da força', 'Retorno gradual aos treinos', 'Testes funcionais negativos']
    },
    outcomes: {
      shortTerm: ['Redução da dor para 2/10', 'Melhora da ADM', 'Retorno ao treinamento parcial'],
      longTerm: ['Retorno completo à competição', 'Manutenção da performance', 'Prevenção de recidivas'],
      complications: ['Ruptura do manguito', 'Capsulite adesiva', 'Atraso no retorno ao esporte']
    },
    learningObjectives: [
      'Identificar fatores de risco em atletas de overhead',
      'Aplicar exercícios específicos para manguito rotador',
      'Entender a importância da estabilização escapular',
      'Desenvolver programa de prevenção',
      'Integrar modificações no treinamento'
    ],
    discussionPoints: [
      'Quando é indicada cirurgia no impacto do ombro?',
      'Como modificar o treinamento durante o tratamento?',
      'Qual a importância da correção postural?',
      'Como prevenir recidivas em atletas?',
      'Critérios para retorno ao esporte'
    ],
    references: [
      'Wilk KE, et al. Rehabilitation of the overhead athlete\'s elbow. Sports Health. 2012;4(5):404-14.',
      'Cools AM, et al. Rehabilitation of scapular muscle balance. Am J Sports Med. 2007;35(10):1744-51.',
      'Kibler WB, et al. The disabled throwing shoulder. Am J Sports Med. 2013;41(3):560-73.'
    ],
    createdBy: 'Dra. Camila',
    createdAt: '2024-06-12',
    lastUpdated: '2024-06-19',
    tags: ['ombro', 'impacto', 'manguito rotador', 'natação', 'overhead'],
    isPublished: true,
    discussions: [],
    evaluations: []
  },
  {
    id: 'case_3',
    title: 'Lombalgia Crônica - Funcionário de Escritório',
    description: 'Paciente de 35 anos, analista de sistemas, com dor lombar crônica há 2 anos.',
    specialty: 'Ortopedia',
    difficultyLevel: 2,
    patientProfile: {
      age: 35,
      gender: 'M',
      occupation: 'Analista de sistemas',
      medicalHistory: ['Sedentarismo há 10 anos', 'Tabagismo (10 cigarros/dia)', 'Obesidade grau I (IMC 28)'],
      currentComplaints: 'Dor lombar constante (5/10) que piora com posições prolongadas sentado'
    },
    clinicalPresentation: {
      symptoms: ['Dor lombar constante (5/10)', 'Rigidez matinal', 'Dor que irradia para glúteos', 'Piora ao ficar sentado >30min'],
      physicalExam: 'Espasmo muscular paravertebral, teste de Lasègue negativo, força normal, reflexos preservados',
      functionalTests: ['Oswestry: 35/100', 'Teste de Schober: 4cm', 'Finger-to-floor: 15cm'],
      imaging: ['RX: perda da lordose lombar', 'RM: protrusão discal L4-L5 sem compressão neural']
    },
    diagnosis: {
      primary: 'Lombalgia crônica inespecífica',
      secondary: ['Protusão discal L4-L5', 'Disfunção da cadeia posterior', 'Síndrome postural'],
      differentialDiagnosis: ['Hérnia discal', 'Espondilolistese', 'Artrite inflamatória', 'Tumor vertebral']
    },
    treatmentPlan: {
      goals: [
        'Redução da dor para níveis aceitáveis',
        'Melhora da função nas atividades diárias',
        'Correção da postura e ergonomia',
        'Aumento da atividade física',
        'Prevenção de recidivas'
      ],
      interventions: [
        'Educação sobre ergonomia',
        'Exercícios de fortalecimento do core',
        'Alongamentos da cadeia posterior',
        'Técnicas de relaxamento',
        'Modificação do estilo de vida'
      ],
      duration: '3-6 meses',
      frequency: '2x por semana por 12 semanas',
      progressIndicators: ['Escala Oswestry', 'Redução da dor', 'Melhora da função', 'Adesão aos exercícios']
    },
    outcomes: {
      shortTerm: ['Redução da dor para 3/10', 'Melhora da flexibilidade', 'Melhora da ergonomia'],
      longTerm: ['Controle da dor', 'Retorno às atividades normais', 'Manutenção do estilo de vida ativo'],
      complications: ['Cronificação da dor', 'Depressão', 'Dependência de medicamentos']
    },
    learningObjectives: [
      'Compreender a lombalgia crônica inespecífica',
      'Aplicar princípios de ergonomia',
      'Prescrever exercícios para core',
      'Integrar abordagem biopsicossocial',
      'Desenvolver estratégias de prevenção'
    ],
    discussionPoints: [
      'Qual o papel da educação do paciente?',
      'Como abordar fatores psicossociais?',
      'Importância da ergonomia no trabalho?',
      'Critérios para encaminhamento cirúrgico?',
      'Estratégias de adesão ao tratamento?'
    ],
    references: [
      'Maher C, et al. Non-specific low back pain. Lancet. 2017;390(10090):736-47.',
      'Delitto A, et al. Low back pain clinical practice guidelines. J Orthop Sports Phys Ther. 2012;42(4):A1-57.',
      'Chou R, et al. Diagnosis and treatment of low back pain. Ann Intern Med. 2007;147(7):478-91.'
    ],
    createdBy: 'Dr. Fernando',
    createdAt: '2024-06-08',
    lastUpdated: '2024-06-16',
    tags: ['lombalgia', 'crônica', 'postura', 'ergonomia', 'escritório'],
    isPublished: true,
    discussions: [],
    evaluations: []
  },
  {
    id: 'case_4',
    title: 'Fratura de Fêmur - Idoso com Osteoporose',
    description: 'Paciente de 78 anos, fratura de fêmur proximal após queda doméstica.',
    specialty: 'Ortopedia',
    difficultyLevel: 4,
    patientProfile: {
      age: 78,
      gender: 'F',
      occupation: 'Aposentada',
      medicalHistory: ['Osteoporose', 'Hipertensão arterial', 'Diabetes tipo 2', 'Queda prévia há 2 anos'],
      currentComplaints: 'Dor intensa no quadril direito e impossibilidade de deambular após queda há 5 dias'
    },
    clinicalPresentation: {
      symptoms: ['Dor intensa no quadril direito (8/10)', 'Impossibilidade de deambular', 'Encurtamento do membro', 'Rotações externa do pé'],
      physicalExam: 'Membro inferior direito encurtado e em rotação externa, dor à palpação da região trocantérica',
      functionalTests: ['Impossibilidade de teste de marcha', 'Força 0/5 em flexão de quadril', 'Reflexos preservados'],
      imaging: ['RX: fratura transtrocanteriana', 'DEXA: osteoporose severa (T-score -3.2)', 'TC: boa redução após osteossíntese']
    },
    diagnosis: {
      primary: 'Fratura transtrocanteriana de fêmur direito pós-osteossíntese',
      secondary: ['Osteoporose severa', 'Síndrome pós-queda', 'Dependência funcional'],
      differentialDiagnosis: ['Fratura patológica', 'Tumor ósseo', 'Infecção óssea']
    },
    treatmentPlan: {
      goals: [
        'Controle da dor pós-operatória',
        'Prevenção de complicações (trombose, pneumonia)',
        'Recuperação da marcha independente',
        'Prevenção de novas quedas',
        'Tratamento da osteoporose'
      ],
      interventions: [
        'Mobilização precoce',
        'Exercícios respiratórios',
        'Treino de transferências',
        'Treino de marcha progressivo',
        'Exercícios de equilíbrio e força'
      ],
      duration: '3-6 meses',
      frequency: 'Diário nas primeiras 2 semanas, depois 3x por semana',
      progressIndicators: ['Independência nas transferências', 'Retorno da marcha', 'Prevenção de complicações']
    },
    outcomes: {
      shortTerm: ['Controle da dor', 'Independência nas transferências', 'Retorno da marcha com auxílio'],
      longTerm: ['Marcha independente ou com auxílio mínimo', 'Prevenção de novas quedas', 'Manutenção da autonomia'],
      complications: ['Trombose venosa profunda', 'Pneumonia', 'Úlcera de pressão', 'Nova queda']
    },
    learningObjectives: [
      'Compreender complicações das fraturas em idosos',
      'Aplicar protocolos de mobilização precoce',
      'Prevenir complicações sistêmicas',
      'Desenvolver programa de prevenção de quedas',
      'Integrar tratamento da osteoporose'
    ],
    discussionPoints: [
      'Quando iniciar a deambulação?',
      'Como prevenir complicações sistêmicas?',
      'Importância do tratamento da osteoporose?',
      'Critérios para alta hospitalar?',
      'Estratégias de prevenção de quedas?'
    ],
    references: [
      'Handoll HH, et al. Rehabilitation for hip fracture. Cochrane Database Syst Rev. 2011;(10):CD003624.',
      'Dyer SM, et al. A critical review of the long-term disability outcomes following hip fracture. BMC Geriatr. 2016;16:158.',
      'Giusti A, et al. Atypical femoral fractures. Osteoporos Int. 2011;22(8):2279-91.'
    ],
    createdBy: 'Dra. Ana',
    createdAt: '2024-06-05',
    lastUpdated: '2024-06-14',
    tags: ['fratura', 'fêmur', 'idoso', 'osteoporose', 'queda'],
    isPublished: true,
    discussions: [],
    evaluations: []
  },

  // ============================================
  // CASOS NEUROLÓGICOS (5 casos)
  // ============================================
  {
    id: 'case_5',
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
  },
  {
    id: 'case_6',
    title: 'Doença de Parkinson - Fase Moderada',
    description: 'Paciente de 65 anos com doença de Parkinson há 5 anos, em fase moderada da doença.',
    specialty: 'Neurologia',
    difficultyLevel: 4,
    patientProfile: {
      age: 65,
      gender: 'M',
      occupation: 'Aposentado (ex-engenheiro)',
      medicalHistory: ['Doença de Parkinson (5 anos)', 'Depressão leve', 'Constipação crônica'],
      currentComplaints: 'Rigidez muscular, tremor de repouso, lentidão nos movimentos e dificuldades de equilíbrio'
    },
    clinicalPresentation: {
      symptoms: ['Bradicinesia', 'Rigidez muscular generalizada', 'Tremor de repouso', 'Instabilidade postural', 'Micrografia'],
      physicalExam: 'Rigidez em roda denteada, tremor de repouso em membros superiores, marcha com passos curtos, ausência de balanço dos braços',
      functionalTests: ['UPDRS-III: 28/56', 'Timed Up and Go: 15 segundos', 'Berg Balance Scale: 38/56'],
      imaging: ['SPECT: redução da captação de dopamina', 'RM: atrofia leve dos gânglios da base']
    },
    diagnosis: {
      primary: 'Doença de Parkinson - fase moderada (Hoehn & Yahr estágio 2.5)',
      secondary: ['Bradicinesia', 'Rigidez', 'Tremor', 'Instabilidade postural'],
      differentialDiagnosis: ['Parkinsonismo atípico', 'Tremor essencial', 'Parkinsonismo vascular', 'Medicação']
    },
    treatmentPlan: {
      goals: [
        'Manter independência nas AVDs',
        'Melhorar a qualidade da marcha',
        'Reduzir o risco de quedas',
        'Preservar a amplitude de movimento',
        'Manter a função cognitiva'
      ],
      interventions: [
        'Exercícios de amplitude de movimento',
        'Treino de equilíbrio e coordenação',
        'Exercícios de força muscular',
        'Treino de marcha com estratégias compensatórias',
        'Exercícios vocais e respiratórios'
      ],
      duration: 'Contínuo - programa de manutenção',
      frequency: '3x por semana',
      progressIndicators: ['UPDRS-III', 'Timed Up and Go', 'Berg Balance Scale', 'Escala de Schwab & England']
    },
    outcomes: {
      shortTerm: ['Melhora da flexibilidade', 'Redução do risco de quedas', 'Melhora da qualidade da marcha'],
      longTerm: ['Manutenção da independência', 'Retardamento da progressão', 'Melhora da qualidade de vida'],
      complications: ['Quedas', 'Frozen gait', 'Disfagia', 'Demência', 'Depressão']
    },
    learningObjectives: [
      'Compreender a fisiopatologia da doença de Parkinson',
      'Aplicar exercícios específicos para cada sintoma',
      'Desenvolver estratégias compensatórias',
      'Integrar abordagem multidisciplinar',
      'Monitorar a progressão da doença'
    ],
    discussionPoints: [
      'Qual o papel do exercício na neuroproteção?',
      'Como adaptar exercícios conforme a progressão?',
      'Importância da regularidade do tratamento?',
      'Como manejar os períodos "off"?',
      'Estratégias para melhorar a adesão?'
    ],
    references: [
      'Goodwin VA, et al. The effectiveness of exercise interventions for people with Parkinson\'s disease. Cochrane Database Syst Rev. 2008;(4):CD004817.',
      'Hirsch MA, et al. Exercise and neuroplasticity in persons living with Parkinson\'s disease. Eur J Phys Rehabil Med. 2009;45(2):215-29.',
      'Tomlinson CL, et al. Physiotherapy intervention in Parkinson\'s disease. Cochrane Database Syst Rev. 2012;(8):CD002817.'
    ],
    createdBy: 'Dr. Roberto',
    createdAt: '2024-06-07',
    lastUpdated: '2024-06-15',
    tags: ['Parkinson', 'neurologia', 'equilíbrio', 'marcha', 'bradicinesia'],
    isPublished: true,
    discussions: [],
    evaluations: []
  },

  // ============================================
  // CASOS ESPORTIVOS (4 casos)
  // ============================================
  {
    id: 'case_7',
    title: 'Lesão de Isquiotibiais - Corredor de Fundo',
    description: 'Paciente de 28 anos, corredor de maratona, com lesão muscular nos isquiotibiais.',
    specialty: 'Esportiva',
    difficultyLevel: 3,
    patientProfile: {
      age: 28,
      gender: 'M',
      occupation: 'Corredor amador de maratona',
      medicalHistory: ['Lesão prévia nos isquiotibiais (2019)', 'Treinamento 80km/semana', 'Sem outras lesões'],
      currentComplaints: 'Dor súbita na região posterior da coxa direita durante treino de velocidade há 3 dias'
    },
    clinicalPresentation: {
      symptoms: ['Dor aguda na coxa posterior direita (7/10)', 'Hematoma visível', 'Dificuldade para caminhar', 'Dor à contração isométrica'],
      physicalExam: 'Dor à palpação no ventre muscular do bíceps femoral, equimose, teste de Thompson positivo',
      functionalTests: ['Impossibilidade de teste de força', 'ADM limitada em flexão de quadril', 'Marcha antálgica'],
      imaging: ['USG: lesão grau 2 no bíceps femoral', 'RM: confirmou lesão de 3cm no ventre muscular']
    },
    diagnosis: {
      primary: 'Lesão muscular grau 2 dos isquiotibiais direito',
      secondary: ['Hematoma intramuscular', 'Disfunção da cadeia posterior', 'Alteração da biomecânica da marcha'],
      differentialDiagnosis: ['Tendinopatia proximal', 'Síndrome compartimental', 'Lesão nervosa', 'Fratura por estresse']
    },
    treatmentPlan: {
      goals: [
        'Controle da dor e inflamação',
        'Promoção da cicatrização muscular',
        'Restauração da força e flexibilidade',
        'Retorno gradual ao treinamento',
        'Prevenção de recidivas'
      ],
      interventions: [
        'Protocolo RICE (Repouso, Gelo, Compressão, Elevação)',
        'Mobilização precoce controlada',
        'Exercícios excêntricos progressivos',
        'Treino de força da cadeia posterior',
        'Exercícios de agilidade e velocidade'
      ],
      duration: '6-8 semanas para retorno completo',
      frequency: '3x por semana por 4 semanas, depois 2x por semana',
      progressIndicators: ['Redução da dor', 'Melhora da força', 'Retorno gradual aos treinos', 'Testes funcionais']
    },
    outcomes: {
      shortTerm: ['Controle da dor', 'Cicatrização da lesão', 'Retorno da força muscular'],
      longTerm: ['Retorno completo ao treinamento', 'Prevenção de recidivas', 'Manutenção da performance'],
      complications: ['Fibrose muscular', 'Recidiva da lesão', 'Atraso no retorno ao esporte']
    },
    learningObjectives: [
      'Compreender as fases de cicatrização muscular',
      'Aplicar protocolos de reabilitação progressiva',
      'Desenvolver programa de prevenção',
      'Integrar retorno gradual ao esporte',
      'Monitorar sinais de recidiva'
    ],
    discussionPoints: [
      'Quando iniciar exercícios excêntricos?',
      'Como prevenir recidivas?',
      'Importância do aquecimento?',
      'Critérios para retorno ao esporte?',
      'Papel da biomecânica na prevenção?'
    ],
    references: [
      'Heiderscheit BC, et al. Hamstring strain injuries. J Orthop Sports Phys Ther. 2010;40(2):67-81.',
      'Askling CM, et al. Acute first-time hamstring strains during high-speed running. Am J Sports Med. 2007;35(2):197-206.',
      'Sherry MA, et al. A comparison of 2 rehabilitation programs in the treatment of acute hamstring strains. J Orthop Sports Phys Ther. 2004;34(3):116-25.'
    ],
    createdBy: 'Dr. Fernando',
    createdAt: '2024-06-03',
    lastUpdated: '2024-06-11',
    tags: ['isquiotibiais', 'corrida', 'lesão muscular', 'esporte', 'prevenção'],
    isPublished: true,
    discussions: [],
    evaluations: []
  },

  // ============================================
  // CASOS GERIÁTRICOS (3 casos)
  // ============================================
  {
    id: 'case_8',
    title: 'Síndrome de Fragilidade - Idoso Independente',
    description: 'Paciente de 72 anos com sinais iniciais de fragilidade, mas ainda independente.',
    specialty: 'Geriátrica',
    difficultyLevel: 3,
    patientProfile: {
      age: 72,
      gender: 'F',
      occupation: 'Aposentada (ex-enfermeira)',
      medicalHistory: ['Hipertensão arterial', 'Osteoartrite de joelhos', 'Depressão leve'],
      currentComplaints: 'Fadiga excessiva, fraqueza muscular e medo de cair há 6 meses'
    },
    clinicalPresentation: {
      symptoms: ['Fadiga', 'Fraqueza muscular generalizada', 'Medo de quedas', 'Redução da atividade física'],
      physicalExam: 'Força muscular reduzida (4/5), reflexos normais, equilíbrio comprometido',
      functionalTests: ['Timed Up and Go: 12 segundos', 'Berg Balance Scale: 45/56', 'Handgrip: 18kg'],
      imaging: ['DEXA: osteopenia', 'Não indicadas outras imagens']
    },
    diagnosis: {
      primary: 'Síndrome de fragilidade (critérios de Fried: 3/5)',
      secondary: ['Sarcopenia leve', 'Medo de quedas', 'Redução da atividade física'],
      differentialDiagnosis: ['Depressão', 'Hipotireoidismo', 'Deficiência de vitamina D', 'Polifarmácia']
    },
    treatmentPlan: {
      goals: [
        'Prevenir a progressão da fragilidade',
        'Melhorar a força muscular',
        'Reduzir o medo de quedas',
        'Aumentar a atividade física',
        'Manter a independência'
      ],
      interventions: [
        'Exercícios de fortalecimento muscular',
        'Treino de equilíbrio e coordenação',
        'Exercícios aeróbicos moderados',
        'Educação sobre prevenção de quedas',
        'Modificação do ambiente domiciliar'
      ],
      duration: '6-12 meses',
      frequency: '3x por semana',
      progressIndicators: ['Timed Up and Go', 'Berg Balance Scale', 'Força de preensão', 'Nível de atividade física']
    },
    outcomes: {
      shortTerm: ['Melhora da força muscular', 'Redução do medo de quedas', 'Aumento da confiança'],
      longTerm: ['Prevenção da progressão da fragilidade', 'Manutenção da independência', 'Melhora da qualidade de vida'],
      complications: ['Quedas', 'Perda de independência', 'Institucionalização', 'Depressão']
    },
    learningObjectives: [
      'Identificar sinais precoces de fragilidade',
      'Aplicar exercícios para idosos frágeis',
      'Desenvolver estratégias de prevenção',
      'Integrar abordagem multidisciplinar',
      'Monitorar progressão da síndrome'
    ],
    discussionPoints: [
      'Como identificar fragilidade precocemente?',
      'Qual a intensidade ideal dos exercícios?',
      'Importância da aderência ao tratamento?',
      'Como envolver a família?',
      'Critérios para encaminhamento?'
    ],
    references: [
      'Fried LP, et al. Frailty in older adults. J Gerontol A Biol Sci Med Sci. 2001;56(3):M146-56.',
      'Clegg A, et al. Frailty in elderly people. Lancet. 2013;381(9868):752-62.',
      'Liu CK, et al. Physical frailty. J Gerontol A Biol Sci Med Sci. 2014;69(5):547-53.'
    ],
    createdBy: 'Dra. Ana',
    createdAt: '2024-06-01',
    lastUpdated: '2024-06-09',
    tags: ['fragilidade', 'idoso', 'sarcopenia', 'quedas', 'prevenção'],
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
