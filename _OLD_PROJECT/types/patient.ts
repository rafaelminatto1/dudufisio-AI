// types/patient.ts - Interface completa para pacientes

export type PatientStatus = 'Active' | 'Inactive' | 'Discharged' | 'Suspended';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';
export type InsuranceType = 'none' | 'private' | 'public' | 'both';

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  phone2?: string;
  email?: string;
}

export interface Insurance {
  type: InsuranceType;
  provider?: string;
  planName?: string;
  policyNumber?: string;
  validUntil?: string;
  coveragePercentage?: number;
}

export interface MedicalHistory {
  allergies: string[];
  chronicDiseases: string[];
  previousSurgeries: string[];
  currentMedications: string[];
  familyHistory: string[];
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'never' | 'occasional' | 'moderate' | 'heavy';
  physicalActivityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  observations?: string;
}

export interface Condition {
  id: string;
  name: string;
  diagnosisDate: string;
  severity: 'low' | 'moderate' | 'high';
  status: 'active' | 'resolved' | 'chronic';
  description?: string;
  treatmentPlan?: string;
}

export interface SessionProgress {
  currentSession: number;
  totalPlannedSessions: number;
  completedSessions: number;
  canceledSessions: number;
  noShowSessions: number;
  firstSessionDate: string;
  lastSessionDate?: string;
  weeksInTreatment: number;
  daysInTreatment: number;
  averageSessionsPerWeek: number;
  adherenceRate: number; // Porcentagem de presença
  nextScheduledSession?: string;
}

export interface TreatmentMetrics {
  painLevel: {
    initial: number; // 0-10
    current: number; // 0-10
    improvement: number; // Porcentagem
  };
  mobility: {
    initial: number; // 0-100%
    current: number; // 0-100%
    improvement: number; // Porcentagem
  };
  functionality: {
    initial: number; // 0-100%
    current: number; // 0-100%
    improvement: number; // Porcentagem
  };
  satisfaction: number; // 0-10
  goals: string[];
  goalsAchieved: number;
}

export interface FinancialInfo {
  totalSpent: number;
  totalPending: number;
  totalPaid: number;
  averageSessionCost: number;
  lastPaymentDate?: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'insurance' | 'pix' | 'other';
  hasOutstandingBalance: boolean;
  outstandingBalance: number;
}

export interface Patient {
  // Identificação Básica
  id: string;
  code: string; // Código único do paciente (ex: PAC-0001)
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  age: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation?: string;
  avatarUrl?: string;
  
  // Endereço
  address: Address;
  
  // Contato de Emergência
  emergencyContact: EmergencyContact;
  
  // Informações de Saúde
  bloodType?: BloodType;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  medicalHistory: MedicalHistory;
  
  // Condições e Tratamento
  conditions: Condition[];
  mainDiagnosis?: string;
  referringDoctor?: string;
  referringDoctorCRM?: string;
  
  // Status e Datas
  status: PatientStatus;
  registrationDate: string;
  firstAppointmentDate?: string;
  lastAppointmentDate?: string;
  dischargeDate?: string;
  dischargeReason?: string;
  
  // Progresso das Sessões
  sessionProgress: SessionProgress;
  
  // Métricas de Tratamento
  treatmentMetrics: TreatmentMetrics;
  
  // Informações Financeiras
  insurance: Insurance;
  financialInfo: FinancialInfo;
  
  // Observações e Notas
  observations?: string;
  internalNotes?: string;
  
  // Preferências
  preferredTherapist?: string;
  preferredDaysOfWeek?: string[];
  preferredTimeSlots?: string[];
  communicationPreference?: 'email' | 'phone' | 'whatsapp' | 'sms';
  
  // Documentos
  hasConsentForm: boolean;
  hasDataPrivacyConsent: boolean;
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface PatientFormData {
  // Dados Pessoais
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation?: string;
  
  // Endereço
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contato de Emergência
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyPhone2?: string;
  emergencyEmail?: string;
  
  // Informações de Saúde
  bloodType?: BloodType;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  previousSurgeries?: string;
  familyHistory?: string;
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'never' | 'occasional' | 'moderate' | 'heavy';
  physicalActivityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  
  // Diagnóstico e Encaminhamento
  mainDiagnosis?: string;
  conditions?: string;
  referringDoctor?: string;
  referringDoctorCRM?: string;
  
  // Plano de Tratamento
  totalPlannedSessions?: number;
  preferredDaysOfWeek?: string[];
  preferredTimeSlots?: string[];
  
  // Convênio
  insuranceType: InsuranceType;
  insuranceProvider?: string;
  insurancePlanName?: string;
  insurancePolicyNumber?: string;
  insuranceValidUntil?: string;
  
  // Status e Observações
  status: PatientStatus;
  observations?: string;
  internalNotes?: string;
  
  // Consentimentos
  hasConsentForm: boolean;
  hasDataPrivacyConsent: boolean;
}

export interface PatientListItem {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  status: PatientStatus;
  avatarUrl?: string;
  age: number;
  conditions: string[];
  currentSession: number;
  totalSessions: number;
  weeksInTreatment: number;
  lastAppointmentDate?: string;
  nextScheduledSession?: string;
  adherenceRate: number;
  painImprovement: number;
  hasOutstandingBalance: boolean;
}
