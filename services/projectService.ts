import { 
  Project, 
  ProjectStatus, 
  ProjectType, 
  ProjectPriority,
  ProjectTemplate,
  ProjectResource,
  ProjectMilestone,
  ProjectComment,
  ProjectAttachment,
  ProjectMetrics,
  ResearchProject,
  ClinicalCaseProject,
  ImprovementProject,
  ResearchType,
  ClinicalCaseType,
  ImprovementType
} from '../types';

// Mock database - in a real app, this would be replaced with actual database calls
let projects: Project[] = [];
let templates: ProjectTemplate[] = [];

// Initialize with mock data
const initializeMockProjects = () => {
  const now = new Date();
  const mockProjectsData: Project[] = [
    {
        id: 'proj_1',
        title: 'Pesquisa sobre Efetividade da Eletroterapia em Dor Lombar',
        description: 'Estudo randomizado controlado para avaliar a efetividade da eletroterapia comparada ao tratamento convencional em pacientes com dor lombar crônica.',
        status: ProjectStatus.InProgress,
        type: ProjectType.Research,
        priority: ProjectPriority.High,
        startDate: '2024-06-01',
        estimatedEndDate: '2025-03-01',
        createdBy: 'user_1',
        assignedTo: ['user_1', 'therapist_2'],
        tags: ['pesquisa', 'eletroterapia', 'dor-lombar', 'estudo-randomizado'],
        resources: [
            { id: 'res_1', name: 'Pesquisador Principal', type: 'Human', allocated: 20, total: 40, unit: 'horas/semana' },
            { id: 'res_2', name: 'Assistente de Pesquisa', type: 'Human', allocated: 15, total: 40, unit: 'horas/semana' },
            { id: 'res_3', name: 'Equipamento TENS', type: 'Equipment', allocated: 2, total: 3, unit: 'unidades' },
            { id: 'res_4', name: 'Orçamento Pesquisa', type: 'Budget', allocated: 8500, total: 15000, unit: 'reais' }
        ],
        budget: {
            planned: 15000,
            actual: 8500,
            currency: 'BRL',
            breakdown: [
                { category: 'Equipamentos', planned: 5000, actual: 3200 },
                { category: 'Material de Consumo', planned: 2000, actual: 1800 },
                { category: 'Análise Estatística', planned: 3000, actual: 2500 },
                { category: 'Publicação', planned: 5000, actual: 1000 }
            ]
        },
        team: [
            { userId: 'user_1', role: 'Pesquisador Principal', hoursAllocated: 240, hoursWorked: 156 },
            { userId: 'therapist_2', role: 'Assistente de Pesquisa', hoursAllocated: 180, hoursWorked: 98 }
        ],
        milestones: [
            { id: 'mile_1', title: 'Aprovação Comitê de Ética', description: 'Projeto aprovado pelo CEP', dueDate: '2024-07-15', completed: true, completedAt: '2024-07-10T10:00:00Z', deliverables: ['Parecer aprovado CEP'] },
            { id: 'mile_2', title: 'Recrutamento de Participantes', description: '50 participantes recrutados', dueDate: '2024-09-30', completed: true, completedAt: '2024-09-25T15:30:00Z', deliverables: ['Lista de participantes', 'Termos de consentimento'] },
            { id: 'mile_3', title: 'Coleta de Dados - 50%', description: 'Metade da coleta concluída', dueDate: '2024-11-30', completed: false, deliverables: ['Banco de dados parcial'] },
            { id: 'mile_4', title: 'Coleta de Dados Completa', description: 'Toda coleta finalizada', dueDate: '2025-01-31', completed: false, deliverables: ['Banco de dados completo'] },
            { id: 'mile_5', title: 'Análise Estatística', description: 'Análise dos resultados', dueDate: '2025-02-28', completed: false, deliverables: ['Relatório estatístico'] },
            { id: 'mile_6', title: 'Artigo Submetido', description: 'Manuscrito enviado para revista', dueDate: '2025-03-31', completed: false, deliverables: ['Artigo científico'] }
        ],
        progress: 65,
        metrics: {
            tasksCompleted: 12,
            totalTasks: 18,
            hoursSpent: 254,
            budgetSpent: 8500,
            milestonesCompleted: 2,
            totalMilestones: 6,
            impactScore: 8.5
        },
        attachments: [
            { id: 'att_1', name: 'Protocolo_Pesquisa_v2.pdf', type: 'application/pdf', url: '/files/protocolo_v2.pdf', uploadedAt: '2024-06-15T09:00:00Z', uploadedBy: 'user_1', size: 2048576 },
            { id: 'att_2', name: 'Parecer_CEP.pdf', type: 'application/pdf', url: '/files/parecer_cep.pdf', uploadedAt: '2024-07-10T14:30:00Z', uploadedBy: 'user_1', size: 1024000 }
        ],
        comments: [
            { id: 'comm_1', content: 'Recrutamento está indo bem, já temos 35 participantes confirmados.', authorId: 'therapist_2', authorName: 'Dr. Carlos', createdAt: '2024-09-15T11:20:00Z' },
            { id: 'comm_2', content: 'Equipamento TENS apresentou problema técnico, precisamos de manutenção.', authorId: 'user_1', authorName: 'Dra. Ana', createdAt: '2024-10-02T16:45:00Z' }
        ],
        researchData: {
            researchType: ResearchType.Effectiveness,
            hypothesis: 'A eletroterapia (TENS) é mais efetiva que o tratamento convencional para redução da dor lombar crônica em adultos.',
            methodology: 'Estudo randomizado controlado duplo-cego com 100 participantes, divididos em dois grupos: eletroterapia + exercícios vs. placebo + exercícios.',
            inclusionCriteria: ['Idade entre 18-65 anos', 'Dor lombar crônica > 3 meses', 'Intensidade da dor ≥ 4 (EVA)', 'Sem contraindicação para eletroterapia'],
            exclusionCriteria: ['Gravidez', 'Marcapasso', 'Cirurgia lombar prévia', 'Dor radicular'],
            sampleSize: 100,
            currentSampleSize: 68,
            dataCollectionPeriod: { start: '2024-08-01', end: '2025-01-31' },
            statisticalMethods: ['ANOVA', 'Teste t de Student', 'Qui-quadrado', 'Regressão linear'],
            expectedOutcomes: ['Redução da dor (EVA)', 'Melhora funcional (Oswestry)', 'Qualidade de vida (SF-36)'],
            publications: [
                { title: 'Efetividade da TENS na Dor Lombar Crônica: Estudo Randomizado', status: 'Planning' }
            ],
            collaboratingInstitutions: ['UNIFESP', 'Hospital das Clínicas'],
            ethicsApproval: {
                approved: true,
                approvalNumber: 'CEP/UNIFESP-2024-0856',
                approvalDate: '2024-07-10',
                institution: 'Comitê de Ética UNIFESP'
            }
        },
        createdAt: '2024-06-01T08:00:00Z',
        updatedAt: '2024-10-15T14:30:00Z'
    },
    {
        id: 'proj_2',
        title: 'Caso Clínico: Sra. Helena - Reabilitação Pós-AVC',
        description: 'Acompanhamento longitudinal de paciente de 72 anos com sequelas de AVC isquêmico, apresentando hemiparesia à direita e afasia de expressão.',
        status: ProjectStatus.InProgress,
        type: ProjectType.ClinicalCase,
        priority: ProjectPriority.High,
        startDate: '2024-08-15',
        estimatedEndDate: '2025-02-15',
        patientId: '3',
        createdBy: 'therapist_1',
        assignedTo: ['therapist_1', 'therapist_3'],
        tags: ['caso-clínico', 'avc', 'hemiparesia', 'neurologia'],
        resources: [
            { id: 'res_5', name: 'Fisioterapeuta Neuro', type: 'Human', allocated: 8, total: 40, unit: 'horas/semana' },
            { id: 'res_6', name: 'Fonoaudióloga', type: 'Human', allocated: 4, total: 40, unit: 'horas/semana' },
            { id: 'res_7', name: 'Equipamentos de Reabilitação', type: 'Equipment', allocated: 1, total: 1, unit: 'conjunto' }
        ],
        team: [
            { userId: 'therapist_1', role: 'Fisioterapeuta Responsável', hoursAllocated: 120, hoursWorked: 72 },
            { userId: 'therapist_3', role: 'Fonoaudióloga', hoursAllocated: 60, hoursWorked: 36 }
        ],
        milestones: [
            { id: 'mile_7', title: 'Avaliação Inicial Completa', description: 'Avaliação neurológica e funcional completa', dueDate: '2024-08-30', completed: true, completedAt: '2024-08-28T10:00:00Z', deliverables: ['Relatório de avaliação', 'Fotos iniciais', 'Vídeos de movimentação'] },
            { id: 'mile_8', title: 'Plano de Tratamento', description: 'Protocolo individualizado definido', dueDate: '2024-09-15', completed: true, completedAt: '2024-09-12T14:00:00Z', deliverables: ['Plano de tratamento detalhado'] },
            { id: 'mile_9', title: 'Reavaliação 1º Mês', description: 'Primeira reavaliação mensal', dueDate: '2024-10-15', completed: true, completedAt: '2024-10-14T11:30:00Z', deliverables: ['Relatório de progresso', 'Vídeos comparativos'] },
            { id: 'mile_10', title: 'Reavaliação 2º Mês', description: 'Segunda reavaliação mensal', dueDate: '2024-11-15', completed: false, deliverables: ['Relatório de progresso'] },
            { id: 'mile_11', title: 'Avaliação Final', description: 'Avaliação final e alta', dueDate: '2025-02-15', completed: false, deliverables: ['Relatório final', 'Recomendações'] }
        ],
        progress: 55,
        metrics: {
            tasksCompleted: 8,
            totalTasks: 15,
            hoursSpent: 108,
            budgetSpent: 0,
            milestonesCompleted: 3,
            totalMilestones: 5,
            impactScore: 9.2
        },
        attachments: [
            { id: 'att_3', name: 'Exames_Iniciais_Helena.pdf', type: 'application/pdf', url: '/files/exames_helena.pdf', uploadedAt: '2024-08-20T10:00:00Z', uploadedBy: 'therapist_1', size: 5242880 },
            { id: 'att_4', name: 'Video_Marcha_Inicial.mp4', type: 'video/mp4', url: '/files/marcha_inicial.mp4', uploadedAt: '2024-08-28T15:30:00Z', uploadedBy: 'therapist_1', size: 15728640 }
        ],
        comments: [
            { id: 'comm_3', content: 'Paciente apresentou melhora significativa na força do MSD. Consegue realizar flexão ativa do cotovelo contra gravidade.', authorId: 'therapist_1', authorName: 'Dra. Maria', createdAt: '2024-10-01T09:15:00Z' },
            { id: 'comm_4', content: 'Evolução na fala também é notável. Consegue formar frases simples com 3-4 palavras.', authorId: 'therapist_3', authorName: 'Fga. Paula', createdAt: '2024-10-14T16:20:00Z' }
        ],
        clinicalCaseData: {
            caseType: ClinicalCaseType.Complex,
            patientAge: 72,
            patientGender: 'F',
            primaryDiagnosis: 'Sequelas de AVC isquêmico em território de ACM esquerda',
            secondaryDiagnoses: ['Hemiparesia à direita', 'Afasia de expressão', 'Disfagia leve'],
            comorbidities: ['Hipertensão arterial', 'Diabetes mellitus tipo 2', 'Dislipidemia'],
            treatmentProtocol: 'Reabilitação neurológica intensiva com foco em recuperação motora e de linguagem',
            outcomesMeasured: ['Força muscular (MRC)', 'Amplitude de movimento', 'Marcha (escala FAC)', 'Linguagem (escala Boston)', 'AVDs (índice de Barthel)'],
            followUpPeriod: 6,
            initialAssessment: {
                date: '2024-08-28',
                findings: 'Hemiparesia à direita grau 3-4/5, afasia de expressão moderada, marcha com auxílio de bengala, dependência parcial para AVDs.',
                photos: ['/files/fotos_iniciais_helena_1.jpg', '/files/fotos_iniciais_helena_2.jpg'],
                videos: ['/files/video_marcha_inicial.mp4', '/files/video_mmss_inicial.mp4']
            },
            progressNotes: [
                {
                    date: '2024-09-15',
                    findings: 'Melhora da força em MSD, especialmente flexores de cotovelo e punho. Vocabulário aumentou para cerca de 50 palavras.',
                    interventions: ['FNP para MMSS', 'Treino de marcha', 'Exercícios de linguagem'],
                    photos: ['/files/progresso_15set_1.jpg'],
                    biomechanicalAnalysis: 'Análise cinemática mostra melhora de 15% na amplitude de flexão do cotovelo'
                },
                {
                    date: '2024-10-14',
                    findings: 'Paciente consegue caminhar 50m sem apoio. Forma frases simples de 3-4 palavras.',
                    interventions: ['Treino de equilíbrio dinâmico', 'Atividades funcionais', 'Terapia de linguagem'],
                    photos: ['/files/progresso_14out_1.jpg', '/files/progresso_14out_2.jpg'],
                    videos: ['/files/video_marcha_outubro.mp4']
                }
            ],
            multidisciplinaryTeam: [
                { role: 'Fisioterapeuta', name: 'Dra. Maria Santos', contributions: ['Reabilitação motora', 'Treino de marcha', 'Atividades funcionais'] },
                { role: 'Fonoaudióloga', name: 'Paula Oliveira', contributions: ['Terapia de linguagem', 'Reabilitação da disfagia'] },
                { role: 'Neurologista', name: 'Dr. João Silva', contributions: ['Acompanhamento médico', 'Ajuste medicamentoso'] }
            ],
            literatureReview: {
                references: [
                    'Stroke rehabilitation guidelines 2023',
                    'Neuroplasticity in stroke recovery - Nature Reviews 2024',
                    'Intensive therapy protocols for hemiparesis - JNNP 2023'
                ],
                keyFindings: [
                    'Terapia intensiva nas primeiras 6 semanas pós-AVC é crucial',
                    'Combinação de FNP e treino funcional mostra melhores resultados',
                    'Terapia de linguagem precoce melhora prognóstico da afasia'
                ]
            },
            presentationHistory: [
                { event: 'Discussão de Caso - Equipe Neuro', date: '2024-10-20', type: 'Case Discussion' }
            ]
        },
        createdAt: '2024-08-15T09:00:00Z',
        updatedAt: '2024-10-15T11:30:00Z'
    }
  ];
  
  projects = mockProjectsData;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Project CRUD Operations
export const getProjects = async (filters?: {
  status?: ProjectStatus[];
  type?: ProjectType[];
  priority?: ProjectPriority[];
  assignedTo?: string;
  tags?: string[];
  search?: string;
}): Promise<Project[]> => {
  await delay(300);
  
  let filteredProjects = [...projects];
  
  if (filters) {
    if (filters.status?.length) {
      filteredProjects = filteredProjects.filter(p => filters.status!.includes(p.status));
    }
    
    if (filters.type?.length) {
      filteredProjects = filteredProjects.filter(p => filters.type!.includes(p.type));
    }
    
    if (filters.priority?.length) {
      filteredProjects = filteredProjects.filter(p => filters.priority!.includes(p.priority));
    }
    
    if (filters.assignedTo) {
      filteredProjects = filteredProjects.filter(p => 
        p.assignedTo.includes(filters.assignedTo!) || p.createdBy === filters.assignedTo
      );
    }
    
    if (filters.tags?.length) {
      filteredProjects = filteredProjects.filter(p => 
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
  }
  
  return filteredProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  await delay(200);
  return projects.find(p => p.id === id) || null;
};

export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Project> => {
  await delay(500);
  
  const now = new Date().toISOString();
  const newProject: Project = {
    ...projectData,
    id: `proj_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    metrics: {
      tasksCompleted: 0,
      totalTasks: 0,
      hoursSpent: 0,
      budgetSpent: 0,
      milestonesCompleted: 0,
      totalMilestones: projectData.milestones.length,
    }
  };
  
  projects.push(newProject);
  return newProject;
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  await delay(400);
  
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return null;
  
  const updatedProject = {
    ...projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  return updatedProject;
};

export const deleteProject = async (id: string): Promise<boolean> => {
  await delay(300);
  
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return false;
  
  projects.splice(projectIndex, 1);
  return true;
};

// Project Analytics and Metrics
export const getProjectMetrics = async (id: string): Promise<ProjectMetrics | null> => {
  await delay(200);
  
  const project = projects.find(p => p.id === id);
  if (!project) return null;
  
  return project.metrics;
};

export const getProjectsOverview = async (): Promise<{
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByType: Record<ProjectType, number>;
  projectsByPriority: Record<ProjectPriority, number>;
  avgCompletionRate: number;
  totalBudgetSpent: number;
  totalHoursSpent: number;
  upcomingDeadlines: { projectId: string; projectTitle: string; milestone: string; dueDate: string; }[];
}> => {
  await delay(400);
  
  const overview = {
    totalProjects: projects.length,
    projectsByStatus: {} as Record<ProjectStatus, number>,
    projectsByType: {} as Record<ProjectType, number>,
    projectsByPriority: {} as Record<ProjectPriority, number>,
    avgCompletionRate: 0,
    totalBudgetSpent: 0,
    totalHoursSpent: 0,
    upcomingDeadlines: [] as { projectId: string; projectTitle: string; milestone: string; dueDate: string; }[]
  };
  
  // Initialize counters
  Object.values(ProjectStatus).forEach(status => overview.projectsByStatus[status] = 0);
  Object.values(ProjectType).forEach(type => overview.projectsByType[type] = 0);
  Object.values(ProjectPriority).forEach(priority => overview.projectsByPriority[priority] = 0);
  
  let totalProgress = 0;
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  projects.forEach(project => {
    overview.projectsByStatus[project.status]++;
    overview.projectsByType[project.type]++;
    overview.projectsByPriority[project.priority]++;
    
    totalProgress += project.progress;
    overview.totalBudgetSpent += project.metrics.budgetSpent;
    overview.totalHoursSpent += project.metrics.hoursSpent;
    
    // Check for upcoming deadlines
    project.milestones.forEach(milestone => {
      if (!milestone.completed) {
        const dueDate = new Date(milestone.dueDate);
        if (dueDate >= now && dueDate <= nextWeek) {
          overview.upcomingDeadlines.push({
            projectId: project.id,
            projectTitle: project.title,
            milestone: milestone.title,
            dueDate: milestone.dueDate
          });
        }
      }
    });
  });
  
  overview.avgCompletionRate = projects.length > 0 ? totalProgress / projects.length : 0;
  overview.upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return overview;
};

// Template Management
export const getProjectTemplates = async (type?: ProjectType): Promise<ProjectTemplate[]> => {
  await delay(200);
  
  let filteredTemplates = templates.filter(t => t.isActive);
  
  if (type) {
    filteredTemplates = filteredTemplates.filter(t => t.type === type);
  }
  
  return filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
};

export const getTemplateById = async (id: string): Promise<ProjectTemplate | null> => {
  await delay(150);
  return templates.find(t => t.id === id) || null;
};

export const createProjectFromTemplate = async (templateId: string, customData: {
  title: string;
  description: string;
  startDate: string;
  assignedTo: string[];
  patientId?: string;
  customFields?: Record<string, any>;
}): Promise<Project> => {
  await delay(600);
  
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error('Template não encontrado');
  
  const now = new Date().toISOString();
  const startDate = new Date(customData.startDate);
  
  // Create milestones based on template
  const milestones: ProjectMilestone[] = template.defaultMilestones.map(tm => ({
    id: `milestone_${Date.now()}_${Math.random()}`,
    title: tm.title,
    description: tm.description,
    dueDate: new Date(startDate.getTime() + tm.daysFromStart * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: false,
    deliverables: tm.deliverables
  }));
  
  // Create resources based on template
  const resources: ProjectResource[] = template.requiredResources.map(tr => ({
    id: `resource_${Date.now()}_${Math.random()}`,
    name: tr.description,
    type: tr.type,
    allocated: tr.quantity,
    total: tr.quantity,
    unit: tr.unit
  }));
  
  const newProject: Project = {
    id: `proj_${Date.now()}`,
    title: customData.title,
    description: customData.description,
    status: ProjectStatus.Planning,
    type: template.type,
    priority: ProjectPriority.Medium,
    startDate: customData.startDate,
    estimatedEndDate: new Date(startDate.getTime() + template.estimatedDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    patientId: customData.patientId,
    createdBy: 'current_user', // This would come from auth context
    assignedTo: customData.assignedTo,
    tags: [...template.tags],
    resources,
    team: customData.assignedTo.map(userId => ({
      userId,
      role: 'Team Member',
      hoursAllocated: template.estimatedDuration * 8, // 8 hours per day
      hoursWorked: 0
    })),
    milestones,
    progress: 0,
    metrics: {
      tasksCompleted: 0,
      totalTasks: template.defaultTasks.length,
      hoursSpent: 0,
      budgetSpent: 0,
      milestonesCompleted: 0,
      totalMilestones: milestones.length,
    },
    attachments: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
    ...(customData.customFields || {})
  };
  
  projects.push(newProject);
  return newProject;
};

// Comments and Attachments
export const addProjectComment = async (projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt'>): Promise<ProjectComment | null> => {
  await delay(300);
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  
  const newComment: ProjectComment = {
    ...comment,
    id: `comment_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  project.comments.push(newComment);
  project.updatedAt = new Date().toISOString();
  
  return newComment;
};

export const addProjectAttachment = async (projectId: string, attachment: Omit<ProjectAttachment, 'id' | 'uploadedAt'>): Promise<ProjectAttachment | null> => {
  await delay(400);
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  
  const newAttachment: ProjectAttachment = {
    ...attachment,
    id: `attachment_${Date.now()}`,
    uploadedAt: new Date().toISOString()
  };
  
  project.attachments.push(newAttachment);
  project.updatedAt = new Date().toISOString();
  
  return newAttachment;
};

// Milestone Management
export const updateMilestone = async (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone | null> => {
  await delay(250);
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  
  const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) return null;
  
  const updatedMilestone = {
    ...project.milestones[milestoneIndex],
    ...updates
  };
  
  if (updates.completed && !project.milestones[milestoneIndex].completed) {
    updatedMilestone.completedAt = new Date().toISOString();
    project.metrics.milestonesCompleted++;
  } else if (!updates.completed && project.milestones[milestoneIndex].completed) {
    updatedMilestone.completedAt = undefined;
    project.metrics.milestonesCompleted--;
  }
  
  project.milestones[milestoneIndex] = updatedMilestone;
  project.updatedAt = new Date().toISOString();
  
  // Recalculate progress
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  project.progress = project.milestones.length > 0 ? (completedMilestones / project.milestones.length) * 100 : 0;
  
  return updatedMilestone;
};

// Resource Management
export const updateProjectResource = async (projectId: string, resourceId: string, updates: Partial<ProjectResource>): Promise<ProjectResource | null> => {
  await delay(200);
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  
  const resourceIndex = project.resources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) return null;
  
  project.resources[resourceIndex] = {
    ...project.resources[resourceIndex],
    ...updates
  };
  
  project.updatedAt = new Date().toISOString();
  
  return project.resources[resourceIndex];
};

// Initialize with default templates
export const initializeDefaultTemplates = () => {
  const defaultTemplates: ProjectTemplate[] = [
    {
      id: 'template_research_effectiveness',
      name: 'Projeto de Pesquisa - Efetividade',
      description: 'Template para estudos de efetividade de tratamentos fisioterapêuticos',
      type: ProjectType.Research,
      category: 'Pesquisa Clínica',
      defaultTasks: [
        { title: 'Definir hipótese de pesquisa', description: 'Elaborar hipótese clara e testável', estimatedHours: 8, dependencies: [], phase: 'Planejamento' },
        { title: 'Desenvolver metodologia', description: 'Definir desenho do estudo e métodos de coleta', estimatedHours: 16, dependencies: ['Definir hipótese de pesquisa'], phase: 'Planejamento' },
        { title: 'Definir critérios de inclusão/exclusão', description: 'Estabelecer critérios para seleção de participantes', estimatedHours: 4, dependencies: ['Desenvolver metodologia'], phase: 'Planejamento' },
        { title: 'Submeter ao Comitê de Ética', description: 'Preparar e submeter projeto para aprovação ética', estimatedHours: 12, dependencies: ['Definir critérios de inclusão/exclusão'], phase: 'Aprovação' },
        { title: 'Recrutar participantes', description: 'Identificar e recrutar participantes do estudo', estimatedHours: 24, dependencies: ['Submeter ao Comitê de Ética'], phase: 'Execução' },
        { title: 'Coletar dados', description: 'Realizar coleta de dados conforme protocolo', estimatedHours: 80, dependencies: ['Recrutar participantes'], phase: 'Execução' },
        { title: 'Analisar dados', description: 'Realizar análise estatística dos resultados', estimatedHours: 32, dependencies: ['Coletar dados'], phase: 'Análise' },
        { title: 'Redigir artigo científico', description: 'Escrever manuscrito para publicação', estimatedHours: 40, dependencies: ['Analisar dados'], phase: 'Publicação' },
        { title: 'Submeter para publicação', description: 'Enviar artigo para revista científica', estimatedHours: 8, dependencies: ['Redigir artigo científico'], phase: 'Publicação' }
      ],
      defaultMilestones: [
        { title: 'Aprovação do Comitê de Ética', description: 'Projeto aprovado pelo comitê de ética', daysFromStart: 45, deliverables: ['Parecer de aprovação ética'] },
        { title: 'Início da Coleta de Dados', description: 'Primeiro participante incluído no estudo', daysFromStart: 60, deliverables: ['Protocolo de coleta implementado'] },
        { title: 'Conclusão da Coleta', description: 'Todos os dados coletados conforme planejado', daysFromStart: 180, deliverables: ['Base de dados completa'] },
        { title: 'Análise Concluída', description: 'Análise estatística finalizada', daysFromStart: 210, deliverables: ['Relatório de análise estatística'] },
        { title: 'Artigo Submetido', description: 'Manuscrito enviado para revista', daysFromStart: 270, deliverables: ['Artigo científico submetido'] }
      ],
      requiredFields: ['title', 'description', 'startDate', 'assignedTo', 'researchData'],
      optionalFields: ['patientId', 'endDate', 'budget'],
      estimatedDuration: 270,
      estimatedBudget: 15000,
      requiredResources: [
        { type: 'Human', description: 'Pesquisador Principal', quantity: 1, unit: 'pessoa' },
        { type: 'Human', description: 'Assistente de Pesquisa', quantity: 1, unit: 'pessoa' },
        { type: 'Budget', description: 'Orçamento para materiais e análises', quantity: 15000, unit: 'reais' }
      ],
      tags: ['pesquisa', 'efetividade', 'científico', 'publicação'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'template_clinical_case_complex',
      name: 'Caso Clínico Complexo',
      description: 'Template para documentação e acompanhamento de casos clínicos complexos',
      type: ProjectType.ClinicalCase,
      category: 'Casos Clínicos',
      defaultTasks: [
        { title: 'Avaliação inicial detalhada', description: 'Realizar avaliação completa do paciente', estimatedHours: 4, dependencies: [], phase: 'Avaliação' },
        { title: 'Revisão de literatura', description: 'Buscar evidências científicas relacionadas ao caso', estimatedHours: 8, dependencies: ['Avaliação inicial detalhada'], phase: 'Planejamento' },
        { title: 'Elaborar plano de tratamento', description: 'Desenvolver protocolo de tratamento individualizado', estimatedHours: 3, dependencies: ['Revisão de literatura'], phase: 'Planejamento' },
        { title: 'Documentação fotográfica inicial', description: 'Registrar estado inicial do paciente', estimatedHours: 1, dependencies: ['Avaliação inicial detalhada'], phase: 'Documentação' },
        { title: 'Implementar tratamento', description: 'Executar plano de tratamento conforme protocolo', estimatedHours: 60, dependencies: ['Elaborar plano de tratamento'], phase: 'Tratamento' },
        { title: 'Acompanhamento semanal', description: 'Registrar evolução e ajustar tratamento', estimatedHours: 24, dependencies: ['Implementar tratamento'], phase: 'Acompanhamento' },
        { title: 'Reavaliações mensais', description: 'Avaliar progresso e documentar mudanças', estimatedHours: 12, dependencies: ['Acompanhamento semanal'], phase: 'Avaliação' },
        { title: 'Análise de resultados', description: 'Compilar e analisar dados do tratamento', estimatedHours: 8, dependencies: ['Reavaliações mensais'], phase: 'Análise' },
        { title: 'Preparar apresentação do caso', description: 'Elaborar apresentação para discussão clínica', estimatedHours: 6, dependencies: ['Análise de resultados'], phase: 'Apresentação' }
      ],
      defaultMilestones: [
        { title: 'Avaliação Inicial Completa', description: 'Avaliação inicial documentada', daysFromStart: 7, deliverables: ['Relatório de avaliação inicial', 'Fotos iniciais'] },
        { title: 'Plano de Tratamento Aprovado', description: 'Protocolo de tratamento definido', daysFromStart: 14, deliverables: ['Plano de tratamento detalhado'] },
        { title: 'Primeira Reavaliação', description: 'Primeira avaliação de progresso', daysFromStart: 30, deliverables: ['Relatório de progresso mensal'] },
        { title: 'Avaliação Final', description: 'Avaliação final e resultados', daysFromStart: 90, deliverables: ['Relatório final', 'Fotos finais', 'Análise de resultados'] },
        { title: 'Apresentação do Caso', description: 'Caso apresentado em discussão clínica', daysFromStart: 105, deliverables: ['Apresentação do caso', 'Relatório de discussão'] }
      ],
      requiredFields: ['title', 'description', 'startDate', 'assignedTo', 'patientId', 'clinicalCaseData'],
      optionalFields: ['endDate', 'budget'],
      estimatedDuration: 105,
      estimatedBudget: 5000,
      requiredResources: [
        { type: 'Human', description: 'Fisioterapeuta Responsável', quantity: 1, unit: 'pessoa' },
        { type: 'Equipment', description: 'Equipamentos de avaliação', quantity: 1, unit: 'conjunto' },
        { type: 'Budget', description: 'Orçamento para documentação e materiais', quantity: 5000, unit: 'reais' }
      ],
      tags: ['caso-clínico', 'complexo', 'documentação', 'acompanhamento'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'template_improvement_quality',
      name: 'Projeto de Melhoria - Qualidade',
      description: 'Template para projetos de melhoria da qualidade dos serviços',
      type: ProjectType.Operational,
      category: 'Melhoria Operacional',
      defaultTasks: [
        { title: 'Identificar problema', description: 'Definir claramente o problema a ser resolvido', estimatedHours: 4, dependencies: [], phase: 'Identificação' },
        { title: 'Coletar dados baseline', description: 'Estabelecer métricas atuais do problema', estimatedHours: 8, dependencies: ['Identificar problema'], phase: 'Análise' },
        { title: 'Análise de causa raiz', description: 'Identificar causas fundamentais do problema', estimatedHours: 12, dependencies: ['Coletar dados baseline'], phase: 'Análise' },
        { title: 'Desenvolver soluções', description: 'Propor soluções para as causas identificadas', estimatedHours: 16, dependencies: ['Análise de causa raiz'], phase: 'Desenvolvimento' },
        { title: 'Plano de implementação', description: 'Criar plano detalhado de implementação', estimatedHours: 8, dependencies: ['Desenvolver soluções'], phase: 'Planejamento' },
        { title: 'Implementação piloto', description: 'Testar soluções em escala reduzida', estimatedHours: 40, dependencies: ['Plano de implementação'], phase: 'Implementação' },
        { title: 'Avaliar resultados piloto', description: 'Medir efetividade das soluções testadas', estimatedHours: 8, dependencies: ['Implementação piloto'], phase: 'Avaliação' },
        { title: 'Implementação completa', description: 'Implementar soluções em escala total', estimatedHours: 60, dependencies: ['Avaliar resultados piloto'], phase: 'Implementação' },
        { title: 'Monitoramento contínuo', description: 'Acompanhar resultados e sustentabilidade', estimatedHours: 24, dependencies: ['Implementação completa'], phase: 'Monitoramento' }
      ],
      defaultMilestones: [
        { title: 'Problema Definido', description: 'Problema claramente identificado e documentado', daysFromStart: 7, deliverables: ['Definição do problema', 'Dados baseline'] },
        { title: 'Causa Raiz Identificada', description: 'Causas fundamentais do problema identificadas', daysFromStart: 21, deliverables: ['Análise de causa raiz', 'Diagrama de Ishikawa'] },
        { title: 'Soluções Desenvolvidas', description: 'Soluções propostas e priorizadas', daysFromStart: 35, deliverables: ['Lista de soluções priorizadas', 'Plano de implementação'] },
        { title: 'Piloto Concluído', description: 'Implementação piloto finalizada e avaliada', daysFromStart: 70, deliverables: ['Resultados do piloto', 'Lições aprendidas'] },
        { title: 'Implementação Completa', description: 'Soluções implementadas em escala total', daysFromStart: 120, deliverables: ['Sistema implementado', 'Métricas de resultado'] },
        { title: 'Sustentabilidade Confirmada', description: 'Resultados sustentados por período mínimo', daysFromStart: 180, deliverables: ['Relatório de sustentabilidade', 'Plano de monitoramento'] }
      ],
      requiredFields: ['title', 'description', 'startDate', 'assignedTo', 'improvementData'],
      optionalFields: ['patientId', 'endDate', 'budget'],
      estimatedDuration: 180,
      estimatedBudget: 10000,
      requiredResources: [
        { type: 'Human', description: 'Líder do Projeto', quantity: 1, unit: 'pessoa' },
        { type: 'Human', description: 'Equipe de Implementação', quantity: 3, unit: 'pessoas' },
        { type: 'Budget', description: 'Orçamento para implementação', quantity: 10000, unit: 'reais' }
      ],
      tags: ['melhoria', 'qualidade', 'processo', 'implementação'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  ];
  
  templates = defaultTemplates;
};

// Initialize templates and projects when service loads
initializeDefaultTemplates();
initializeMockProjects();

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMetrics,
  getProjectsOverview,
  getProjectTemplates,
  getTemplateById,
  createProjectFromTemplate,
  addProjectComment,
  addProjectAttachment,
  updateMilestone,
  updateProjectResource,
};