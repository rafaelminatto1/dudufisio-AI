// services/mentoriaService.ts
import { 
  Intern, 
  EducationalCase, 
  InternStatus, 
  Competency,
  InternCompetency,
  CompetencyEvaluation,
  EducationalResource,
  LearningPath,
  Certification,
  MentorshipMetrics,
  CompetencyLevel,
  InternshipPlan,
  LearningObjective,
  ProgressReport
} from '../types';

import { 
  mockInterns, 
  mockEducationalCases, 
  mockCompetencies,
  mockEducationalResources,
  mockLearningPaths,
  mockCertifications,
  mockMentorshipMetrics
} from '../data/mockMentoriaData';

import { mockTherapists } from '../data/mockData';

// In-memory storage for development
let interns: Intern[] = [...mockInterns];
let cases: EducationalCase[] = [...mockEducationalCases];
let competencies: Competency[] = [...mockCompetencies];
let resources: EducationalResource[] = [...mockEducationalResources];
let learningPaths: LearningPath[] = [...mockLearningPaths];
let certifications: Certification[] = [...mockCertifications];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ============================================================================
// MENTORIA DATA - MAIN DASHBOARD
// ============================================================================

export const getMentoriaData = async (): Promise<{ 
  interns: Intern[], 
  cases: EducationalCase[], 
  metrics: MentorshipMetrics 
}> => {
  await delay(500);
  return {
    interns: [...interns].sort((a, b) => a.name.localeCompare(b.name)),
    cases: [...cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    metrics: mockMentorshipMetrics
  };
};

// ============================================================================
// INTERN MANAGEMENT
// ============================================================================

export const getInterns = async (): Promise<Intern[]> => {
  await delay(300);
  return [...interns].sort((a, b) => a.name.localeCompare(b.name));
};

export const getInternById = async (id: string): Promise<Intern | null> => {
  await delay(200);
  return interns.find(intern => intern.id === id) || null;
};

export const saveIntern = async (internData: Omit<Intern, 'id' | 'avatarUrl' | 'competencies' | 'clinicalCases'> & { id?: string }): Promise<Intern> => {
  await delay(400);
  
  if (internData.id) {
    // Update existing intern
    const index = interns.findIndex(i => i.id === internData.id);
    if (index > -1) {
      const existingIntern = interns[index];
      const updatedIntern: Intern = { 
        ...existingIntern,
        ...internData,
        // Preserve existing competencies and clinical cases
        competencies: existingIntern.competencies,
        clinicalCases: existingIntern.clinicalCases
      };
      interns[index] = updatedIntern;
      return updatedIntern;
    }
    throw new Error("Intern not found");
  } else {
    // Create new intern
    const newIntern: Intern = {
      id: `intern_${Date.now()}`,
      ...internData,
      avatarUrl: `https://i.pravatar.cc/150?u=intern_${Date.now()}`,
      competencies: [],
      clinicalCases: []
    };
    interns.unshift(newIntern);
    return newIntern;
  }
};

export const deleteIntern = async (id: string): Promise<void> => {
  await delay(300);
  const index = interns.findIndex(i => i.id === id);
  if (index > -1) {
    interns.splice(index, 1);
  } else {
    throw new Error("Intern not found");
  }
};

// ============================================================================
// INTERNSHIP PLAN MANAGEMENT
// ============================================================================

export const createInternshipPlan = async (internId: string, planData: Omit<InternshipPlan, 'id' | 'internId'>): Promise<InternshipPlan> => {
  await delay(400);
  
  const intern = interns.find(i => i.id === internId);
  if (!intern) {
    throw new Error("Intern not found");
  }

  const newPlan: InternshipPlan = {
    id: `plan_${Date.now()}`,
    internId,
    ...planData
  };

  // Update intern with the new plan
  intern.internshipPlan = newPlan;
  
  return newPlan;
};

export const updateInternshipPlan = async (planId: string, updates: Partial<InternshipPlan>): Promise<InternshipPlan> => {
  await delay(400);
  
  const intern = interns.find(i => i.internshipPlan?.id === planId);
  if (!intern || !intern.internshipPlan) {
    throw new Error("Internship plan not found");
  }

  intern.internshipPlan = { ...intern.internshipPlan, ...updates };
  return intern.internshipPlan;
};

// ============================================================================
// COMPETENCY MANAGEMENT
// ============================================================================

export const getCompetencies = async (): Promise<Competency[]> => {
  await delay(200);
  return [...competencies];
};

export const getInternCompetencies = async (internId: string): Promise<InternCompetency[]> => {
  await delay(300);
  const intern = interns.find(i => i.id === internId);
  return intern?.competencies || [];
};

export const addCompetencyToIntern = async (
  internId: string, 
  competencyId: string, 
  targetLevel: CompetencyLevel
): Promise<InternCompetency> => {
  await delay(400);
  
  const intern = interns.find(i => i.id === internId);
  if (!intern) {
    throw new Error("Intern not found");
  }

  const competency = competencies.find(c => c.id === competencyId);
  if (!competency) {
    throw new Error("Competency not found");
  }

  const newInternCompetency: InternCompetency = {
    id: `ic_${Date.now()}`,
    internId,
    competencyId,
    currentLevel: CompetencyLevel.Beginner,
    targetLevel,
    evaluations: [],
    progress: 0
  };

  intern.competencies.push(newInternCompetency);
  return newInternCompetency;
};

export const evaluateCompetency = async (
  internCompetencyId: string,
  evaluation: Omit<CompetencyEvaluation, 'id' | 'internCompetencyId'>
): Promise<CompetencyEvaluation> => {
  await delay(400);
  
  // Find the intern competency
  let internCompetency: InternCompetency | null = null;
  let intern: Intern | null = null;

  for (const i of interns) {
    const ic = i.competencies.find(c => c.id === internCompetencyId);
    if (ic) {
      internCompetency = ic;
      intern = i;
      break;
    }
  }

  if (!internCompetency || !intern) {
    throw new Error("Intern competency not found");
  }

  const newEvaluation: CompetencyEvaluation = {
    id: `eval_${Date.now()}`,
    internCompetencyId,
    ...evaluation
  };

  internCompetency.evaluations.push(newEvaluation);
  internCompetency.lastEvaluatedAt = evaluation.evaluatedAt;
  internCompetency.currentLevel = evaluation.level;
  
  // Update progress based on evaluations
  const avgScore = internCompetency.evaluations.reduce((sum, e) => sum + e.score, 0) / internCompetency.evaluations.length;
  internCompetency.progress = Math.min(avgScore * 10, 100);

  return newEvaluation;
};

// ============================================================================
// EDUCATIONAL CASES MANAGEMENT
// ============================================================================

export const getEducationalCases = async (filters?: {
  specialty?: string;
  difficulty?: number;
  isPublished?: boolean;
}): Promise<EducationalCase[]> => {
  await delay(300);
  
  let filteredCases = [...cases];
  
  if (filters?.specialty) {
    filteredCases = filteredCases.filter(c => c.specialty === filters.specialty);
  }
  
  if (filters?.difficulty) {
    filteredCases = filteredCases.filter(c => c.difficultyLevel === filters.difficulty);
  }
  
  if (filters?.isPublished !== undefined) {
    filteredCases = filteredCases.filter(c => c.isPublished === filters.isPublished);
  }
  
  return filteredCases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getCaseById = async (id: string): Promise<EducationalCase | null> => {
  await delay(200);
  return cases.find(c => c.id === id) || null;
};

export const saveCase = async (caseData: Omit<EducationalCase, 'id' | 'createdAt' | 'createdBy' | 'lastUpdated' | 'discussions' | 'evaluations'> & { id?: string }): Promise<EducationalCase> => {
  await delay(400);
  
  if (caseData.id) {
    // Update existing case
    const index = cases.findIndex(c => c.id === caseData.id);
    if (index > -1) {
      const existingCase = cases[index];
      const updatedCase: EducationalCase = {
        ...existingCase,
        ...caseData,
        lastUpdated: new Date().toISOString().split('T')[0],
        // Preserve existing discussions and evaluations
        discussions: existingCase.discussions,
        evaluations: existingCase.evaluations
      };
      cases[index] = updatedCase;
      return updatedCase;
    }
    throw new Error("Case not found");
  } else {
    // Create new case
    const newCase: EducationalCase = {
      id: `case_${Date.now()}`,
      ...caseData,
      createdBy: mockTherapists[0]?.name || 'Sistema',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      discussions: [],
      evaluations: []
    };
    cases.unshift(newCase);
    return newCase;
  }
};

export const assignCaseToIntern = async (caseId: string, internId: string): Promise<void> => {
  await delay(300);
  
  const intern = interns.find(i => i.id === internId);
  const caseExists = cases.find(c => c.id === caseId);
  
  if (!intern) {
    throw new Error("Intern not found");
  }
  
  if (!caseExists) {
    throw new Error("Case not found");
  }
  
  if (!intern.clinicalCases.includes(caseId)) {
    intern.clinicalCases.push(caseId);
  }
};

export const deleteCase = async (id: string): Promise<void> => {
  await delay(300);
  const index = cases.findIndex(c => c.id === id);
  if (index > -1) {
    cases.splice(index, 1);
    // Remove from interns' assigned cases
    interns.forEach(intern => {
      intern.clinicalCases = intern.clinicalCases.filter(caseId => caseId !== id);
    });
  } else {
    throw new Error("Case not found");
  }
};

// ============================================================================
// EDUCATIONAL RESOURCES
// ============================================================================

export const getEducationalResources = async (filters?: {
  type?: string;
  specialty?: string;
  difficulty?: number;
}): Promise<EducationalResource[]> => {
  await delay(300);
  
  let filteredResources = [...resources];
  
  if (filters?.type) {
    filteredResources = filteredResources.filter(r => r.type === filters.type);
  }
  
  if (filters?.specialty) {
    filteredResources = filteredResources.filter(r => r.specialty.includes(filters.specialty));
  }
  
  if (filters?.difficulty) {
    filteredResources = filteredResources.filter(r => r.difficulty === filters.difficulty);
  }
  
  return filteredResources.sort((a, b) => b.rating - a.rating);
};

export const getResourceById = async (id: string): Promise<EducationalResource | null> => {
  await delay(200);
  return resources.find(r => r.id === id) || null;
};

export const saveResource = async (resourceData: Omit<EducationalResource, 'id' | 'publishedAt' | 'views' | 'rating' | 'reviews'> & { id?: string }): Promise<EducationalResource> => {
  await delay(400);
  
  if (resourceData.id) {
    // Update existing resource
    const index = resources.findIndex(r => r.id === resourceData.id);
    if (index > -1) {
      const existingResource = resources[index];
      const updatedResource: EducationalResource = {
        ...existingResource,
        ...resourceData,
        lastUpdated: new Date().toISOString().split('T')[0],
        // Preserve existing metrics
        views: existingResource.views,
        rating: existingResource.rating,
        reviews: existingResource.reviews
      };
      resources[index] = updatedResource;
      return updatedResource;
    }

    throw new Error('Resource not found');
  }

  // Create new resource
  const newResource: EducationalResource = {
    id: `resource_${Date.now()}`,
    ...resourceData,
    publishedAt: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    views: 0,
    rating: 0,
    reviews: []
  };
  resources.unshift(newResource);
  return newResource;
};

// ============================================================================
// LEARNING PATHS
// ============================================================================

export const getLearningPaths = async (): Promise<LearningPath[]> => {
  await delay(300);
  return [...learningPaths].sort((a, b) => b.enrollments - a.enrollments);
};

export const getLearningPathById = async (id: string): Promise<LearningPath | null> => {
  await delay(200);
  return learningPaths.find(p => p.id === id) || null;
};

export const enrollInLearningPath = async (pathId: string, internId: string): Promise<void> => {
  await delay(300);
  
  const path = learningPaths.find(p => p.id === pathId);
  const intern = interns.find(i => i.id === internId);
  
  if (!path) {
    throw new Error("Learning path not found");
  }
  
  if (!intern) {
    throw new Error("Intern not found");
  }
  
  // Increment enrollment count
  path.enrollments += 1;
};

// ============================================================================
// CERTIFICATIONS
// ============================================================================

export const getCertifications = async (): Promise<Certification[]> => {
  await delay(300);
  return [...certifications];
};

export const getCertificationById = async (id: string): Promise<Certification | null> => {
  await delay(200);
  return certifications.find(c => c.id === id) || null;
};

// ============================================================================
// PROGRESS REPORTS
// ============================================================================

export const generateProgressReport = async (
  internId: string, 
  period: string
): Promise<ProgressReport> => {
  await delay(500);
  
  const intern = interns.find(i => i.id === internId);
  if (!intern) {
    throw new Error("Intern not found");
  }

  const report: ProgressReport = {
    id: `report_${Date.now()}`,
    internId,
    supervisorId: intern.supervisorId,
    period,
    competencyProgress: {},
    achievements: [
      'Completou avaliação de paciente neurológico',
      'Demonstrou melhora significativa em terapia manual',
      'Participou ativamente das discussões de casos'
    ],
    challenges: [
      'Documentação clínica precisa ser mais detalhada',
      'Confiança em técnicas avançadas ainda em desenvolvimento'
    ],
    nextSteps: [
      'Focar na documentação estruturada',
      'Praticar técnicas de mobilização neural',
      'Participar de mais casos neurológicos'
    ],
    overallRating: intern.averageGrade || 8,
    createdAt: new Date().toISOString()
  };

  // Calculate competency progress
  intern.competencies.forEach(comp => {
    report.competencyProgress[comp.competencyId] = {
      previousLevel: CompetencyLevel.Beginner, // Mock previous level
      currentLevel: comp.currentLevel,
      progress: comp.progress
    };
  });

  return report;
};

// ============================================================================
// ANALYTICS AND METRICS
// ============================================================================

export const getMentorshipMetrics = async (): Promise<MentorshipMetrics> => {
  await delay(400);
  
  // Calculate real-time metrics based on current data
  const activeInterns = interns.filter(i => i.status === InternStatus.Active).length;
  const graduatedInterns = interns.filter(i => i.status === InternStatus.Graduated).length;
  
  const avgCompetencyProgress = interns.reduce((sum, intern) => {
    const internAvg = intern.competencies.reduce((compSum, comp) => compSum + comp.progress, 0) / (intern.competencies.length || 1);
    return sum + internAvg;
  }, 0) / (interns.length || 1);

  const avgCaseRating = cases.reduce((sum, mentorshipCase) => {
    const caseAvg = mentorshipCase.evaluations.reduce((evaluationSum, evaluation) => evaluationSum + evaluation.rating, 0) / (mentorshipCase.evaluations.length || 1);
    return sum + caseAvg;
  }, 0) / (cases.length || 1);

  return {
    ...mockMentorshipMetrics,
    totalInterns: interns.length,
    activeInterns,
    graduatedInterns,
    averageCompetencyProgress: avgCompetencyProgress,
    totalCases: cases.length,
    averageCaseRating: avgCaseRating || 0,
    totalResources: resources.length,
    totalLearningPaths: learningPaths.length
  };
};
