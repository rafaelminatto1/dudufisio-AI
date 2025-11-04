// Tipos e interfaces para o sistema de prontuário eletrônico médico

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  lastVisit: Date;
  status: 'active' | 'discharged' | 'pending';
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  type: string;
  version: number;
  content: Record<string, any>;
  isSigned: boolean;
  signedBy?: string;
  signedAt?: Date;
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'signed' | 'archived';
}

export interface DigitalCertificate {
  id: string;
  userId: string;
  certificateData: any;
  publicKey: string;
  algorithm: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface DigitalSignature {
  id: string;
  documentId: string;
  signatureData: any;
  certificateId: string;
  signedAt: Date;
  signedBy: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  createdAt: Date;
}

export interface ClinicalTemplate {
  id: string;
  name: string;
  type: string;
  specialty: string;
  templateSchema: any;
  defaultValues: any;
  validationRules: any;
  active: boolean;
  version: number;
  createdAt: Date;
  createdBy: string;
}

export interface ProgressReport {
  patient: Patient;
  initialAssessment: ClinicalDocument | null;
  sessionEvolutions: ClinicalDocument[];
  painEvolution: {
    summary: string;
    details: any[];
  };
  functionalProgress: {
    summary: string;
    totalSessions: number;
  };
  treatmentCompliance: {
    summary: string;
    rate: number;
  };
  recommendations: string;
  generatedAt: Date;
}

export interface DischargeReport {
  patient: Patient;
  treatmentSummary: string;
  outcomeMeasures: {
    initialPain: number | string;
    finalPain: number | string;
    painImprovement: number | string;
  };
  finalRecommendations: string;
  followUpPlan: string;
  generatedAt: Date;
}

export interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  fhir: 'active' | 'inactive' | 'error';
  signatures: 'active' | 'inactive' | 'error';
  compliance: 'compliant' | 'warning' | 'error';
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'assessment' | 'evolution' | 'report' | 'other';
  documentId?: string;
}

export interface AssessmentFormData {
  patientId: string;
  chiefComplaint: string;
  medicalHistory?: string;
  physicalExam: string;
  diagnosis: string;
  treatmentPlan: string;
  goals?: string;
}

export interface EvolutionFormData {
  patientId: string;
  appointmentId: string;
  subjectiveAssessment?: string;
  painLevelBefore?: number;
  painLevelAfter?: number;
  objectiveFindings?: string;
  techniquesApplied: string;
  patientResponse?: string;
  nextSessionPlan?: string;
  homeExercises?: string;
}

