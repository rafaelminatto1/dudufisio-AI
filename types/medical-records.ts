/**
 * Tipos TypeScript para Sistema de Prontuário Eletrônico Médico
 * Seguindo padrões HL7 FHIR e compliance CFM/COFFITO
 */

// ============================================================================
// TIPOS BASE DE IDENTIFICAÇÃO
// ============================================================================

export type DocumentId = string;
export type PatientId = string;
export type TherapistId = string;
export type AssessmentId = string;
export type EvolutionId = string;
export type SessionId = string;
export type TemplateId = string;
export type CertificateId = string;

// ============================================================================
// ENUMS PRINCIPAIS
// ============================================================================

export enum DocumentType {
  INITIAL_ASSESSMENT = 'initial_assessment',
  EVOLUTION = 'evolution',
  PROGRESS_REPORT = 'progress_report',
  DISCHARGE_REPORT = 'discharge_report',
  DISCHARGE_SUMMARY = 'discharge_summary',
  REFERRAL_LETTER = 'referral_letter',
  PRESCRIPTION = 'prescription',
  CERTIFICATE = 'certificate'
}

export enum Specialty {
  PHYSIOTHERAPY = 'physiotherapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  SPEECH_THERAPY = 'speech_therapy',
  ORTHOPEDICS = 'orthopedics',
  NEUROLOGY = 'neurology',
  SPORTS_MEDICINE = 'sports_medicine'
}

export enum SessionType {
  INITIAL_ASSESSMENT = 'initial_assessment',
  FOLLOW_UP = 'follow_up',
  DISCHARGE = 'discharge',
  REEVALUATION = 'reevaluation'
}

export enum PainLevel {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  VERY_SEVERE = 4,
  WORST_POSSIBLE = 5
}

export enum DocumentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  SIGNED = 'signed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled',
  DELETED = 'deleted'
}

export enum SignatureAlgorithm {
  RSA_SHA256 = 'RSA-SHA256',
  ECDSA_SHA256 = 'ECDSA-SHA256',
  ED25519 = 'ED25519'
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  SIGN = 'SIGN',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
  EXPORT = 'EXPORT'
}

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface Patient {
  readonly id: PatientId;
  readonly name: string;
  readonly birthDate: string;
  readonly gender: 'M' | 'F' | 'Other';
  readonly lastVisit?: Date;
  readonly status: 'active' | 'inactive' | 'discharged';
}

export interface ClinicalDocument {
  readonly id: DocumentId;
  readonly patientId: PatientId;
  readonly type: DocumentType;
  readonly version: number;
  readonly content: Record<string, unknown>;
  readonly specialty?: Specialty;
  readonly isSigned: boolean;
  readonly signatureData?: string;
  readonly signedAt?: Date;
  readonly signedBy?: TherapistId;
  readonly status: DocumentStatus;
  readonly createdBy: TherapistId;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly updatedBy?: TherapistId;
}

export interface DigitalCertificate {
  readonly id: CertificateId;
  readonly userId: TherapistId;
  readonly type: 'A1' | 'A3';
  readonly serialNumber: string;
  readonly issuer: string;
  readonly validFrom: Date;
  readonly validUntil: Date;
  readonly publicKey: string;
  readonly certificateData: string;
  readonly algorithm: SignatureAlgorithm;
  readonly isActive: boolean;
  readonly status: 'active' | 'expired' | 'revoked';
  readonly createdAt: Date;
  readonly createdBy: TherapistId;
}

export interface InitialAssessment {
  readonly id: AssessmentId;
  readonly patientId: PatientId;
  readonly chiefComplaint: ChiefComplaint;
  readonly medicalHistory: MedicalHistory;
  readonly physicalExam: PhysicalExam;
  readonly functionalTests: FunctionalTest[];
  readonly diagnosis: PhysiotherapyDiagnosis;
  readonly treatmentPlan: TreatmentPlan;
  readonly goals: TreatmentGoal[];
  readonly specialty: Specialty;
  readonly createdBy: TherapistId;
  readonly createdAt: Date;
}

// ============================================================================
// INTERFACES DE CONTEÚDO
// ============================================================================

export interface DocumentContent {
  readonly data: Record<string, unknown>;
  readonly metadata: DocumentMetadata;
  readonly version: number;
  readonly checksum: string;
}

export interface DocumentMetadata {
  readonly createdBy: TherapistId;
  readonly createdAt: Date;
  readonly updatedBy?: TherapistId;
  readonly updatedAt?: Date;
  readonly specialty: Specialty;
  readonly sessionId?: SessionId;
  readonly templateId?: TemplateId;
}

// ============================================================================
// INTERFACES CLÍNICAS
// ============================================================================

export interface ChiefComplaint {
  readonly description: string;
  readonly onset: Date;
  readonly duration: string;
  readonly characteristics: PainCharacteristics;
  readonly aggravatingFactors: string[];
  readonly relievingFactors: string[];
  readonly associatedSymptoms: string[];
}

export interface PainCharacteristics {
  readonly location: string[];
  readonly quality: string;
  readonly intensity: PainLevel;
  readonly frequency: string;
  readonly pattern: string;
}

export interface MedicalHistory {
  readonly pastMedicalHistory: string[];
  readonly surgicalHistory: string[];
  readonly medications: Medication[];
  readonly allergies: Allergy[];
  readonly familyHistory: string[];
  readonly socialHistory: SocialHistory;
}

export interface Medication {
  readonly name: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly indication: string;
  readonly startDate: Date;
  readonly endDate?: Date;
}

export interface Allergy {
  readonly allergen: string;
  readonly reaction: string;
  readonly severity: 'mild' | 'moderate' | 'severe';
}

export interface SocialHistory {
  readonly occupation: string;
  readonly lifestyle: string[];
  readonly habits: string[];
  readonly livingSituation: string;
}

export interface PhysicalExam {
  readonly vitalSigns: VitalSigns;
  readonly inspection: string;
  readonly palpation: string;
  readonly rangeOfMotion: RangeOfMotion;
  readonly muscleStrength: MuscleStrength;
  readonly specialTests: SpecialTest[];
  readonly neurologicalExam?: NeurologicalExam;
}

export interface VitalSigns {
  readonly bloodPressure?: string;
  readonly heartRate?: number;
  readonly respiratoryRate?: number;
  readonly temperature?: number;
  readonly oxygenSaturation?: number;
}

export interface RangeOfMotion {
  readonly cervical: JointRange[];
  readonly thoracic: JointRange[];
  readonly lumbar: JointRange[];
  readonly upperExtremities: JointRange[];
  readonly lowerExtremities: JointRange[];
}

export interface JointRange {
  readonly joint: string;
  readonly flexion?: number;
  readonly extension?: number;
  readonly abduction?: number;
  readonly adduction?: number;
  readonly rotation?: number;
  readonly notes?: string;
}

export interface MuscleStrength {
  readonly cervical: MuscleGroup[];
  readonly upperExtremities: MuscleGroup[];
  readonly lowerExtremities: MuscleGroup[];
  readonly trunk: MuscleGroup[];
}

export interface MuscleGroup {
  readonly muscle: string;
  readonly strength: number; // 0-5 scale
  readonly notes?: string;
}

export interface SpecialTest {
  readonly name: string;
  readonly result: 'positive' | 'negative' | 'equivocal';
  readonly notes?: string;
}

export interface NeurologicalExam {
  readonly reflexes: Reflex[];
  readonly sensation: Sensation[];
  readonly coordination: string;
  readonly balance: string;
}

export interface Reflex {
  readonly name: string;
  readonly response: 'normal' | 'hyperactive' | 'hypoactive' | 'absent';
}

export interface Sensation {
  readonly area: string;
  readonly modality: 'light_touch' | 'pinprick' | 'vibration' | 'proprioception';
  readonly result: 'normal' | 'decreased' | 'absent';
}

export interface FunctionalTest {
  readonly name: string;
  readonly result: string;
  readonly score?: number;
  readonly notes?: string;
}

export interface PhysiotherapyDiagnosis {
  readonly primaryDiagnosis: string;
  readonly secondaryDiagnoses: string[];
  readonly icfCode?: string;
  readonly severity: 'mild' | 'moderate' | 'severe';
  readonly prognosis: string;
}

export interface TreatmentPlan {
  readonly goals: TreatmentGoal[];
  readonly interventions: Intervention[];
  readonly frequency: string;
  readonly duration: string;
  readonly expectedOutcomes: string[];
  readonly contraindications: string[];
}

export interface TreatmentGoal {
  readonly description: string;
  readonly targetDate: Date;
  readonly measurable: boolean;
  readonly priority: 'high' | 'medium' | 'low';
}

export interface Intervention {
  readonly type: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
  readonly duration: string;
  readonly frequency: string;
}

// ============================================================================
// INTERFACES DE EVOLUÇÃO
// ============================================================================

export interface SessionEvolution {
  readonly id: EvolutionId;
  readonly patientId: PatientId;
  readonly sessionId: SessionId;
  readonly subjectiveAssessment: string;
  readonly painLevelBefore: number;
  readonly painLevelAfter: number;
  readonly objectiveFindings: string;
  readonly measurements: Record<string, unknown>;
  readonly techniquesApplied: Technique[];
  readonly exercisesPerformed: Exercise[];
  readonly equipmentUsed: string[];
  readonly patientResponse: string;
  readonly adverseReactions?: string;
  readonly nextSessionPlan: string;
  readonly homeExercises: Exercise[];
  readonly recommendations: string;
  readonly bodyMapPoints?: BodyMapPoint[];
  readonly createdBy: TherapistId;
  readonly createdAt: Date;
}

export interface Technique {
  readonly name: string;
  readonly duration: string;
  readonly parameters: Record<string, unknown>;
  readonly response: string;
}

export interface Exercise {
  readonly name: string;
  readonly description: string;
  readonly repetitions: number;
  readonly sets: number;
  readonly duration?: string;
  readonly instructions: string;
}

export interface BodyMapPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly painLevel: number;
  readonly description?: string;
  readonly timestamp: Date;
}

// ============================================================================
// INTERFACES DE ASSINATURA DIGITAL
// ============================================================================

export interface DigitalSignature {
  readonly id: string;
  readonly documentId: string;
  readonly signature: string;
  readonly signatureData: string;
  readonly publicKey: string;
  readonly certificateId: string;
  readonly timestamp: Timestamp;
  readonly documentHash: string;
  readonly algorithm: SignatureAlgorithm;
  readonly signedAt: Date;
  readonly signedBy: TherapistId;
  readonly verificationStatus: 'pending' | 'verified' | 'failed';
  readonly createdAt: Date;
}

export interface Timestamp {
  readonly time: Date;
  readonly authority: string;
  readonly token: string;
}

export interface SignatureVerificationResult {
  readonly isValid: boolean;
  readonly details?: SignatureDetails;
  readonly error?: string;
}

export interface SignatureDetails {
  readonly signedAt: Date;
  readonly certificate: string;
  readonly algorithm: SignatureAlgorithm;
}

// ============================================================================
// INTERFACES DE TEMPLATES
// ============================================================================

export interface ClinicalTemplate {
  readonly id: TemplateId;
  readonly name: string;
  readonly type: DocumentType;
  readonly specialty: Specialty;
  readonly schema: TemplateSchema;
  readonly templateSchema: TemplateSchema;
  readonly defaultValues: Record<string, unknown>;
  readonly validationRules: ValidationRule[];
  readonly active: boolean;
  readonly version: number;
  readonly createdBy: TherapistId;
  readonly createdAt: Date;
}

export interface TemplateSchema {
  readonly fields: TemplateField[];
  readonly sections: TemplateSection[];
  readonly layout: TemplateLayout;
}

export interface TemplateField {
  readonly id: string;
  readonly type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
  readonly label: string;
  readonly required: boolean;
  readonly options?: string[];
  readonly validation?: ValidationRule[];
}

export interface TemplateSection {
  readonly id: string;
  readonly title: string;
  readonly fields: string[];
  readonly order: number;
}

export interface TemplateLayout {
  readonly columns: number;
  readonly sections: string[];
}

export interface ValidationRule {
  readonly type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  readonly value?: unknown;
  readonly message: string;
}

// ============================================================================
// INTERFACES DE COMPLIANCE
// ============================================================================

export interface ComplianceViolation {
  readonly code: string;
  readonly message: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly field?: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly violations: ComplianceViolation[];
}

// ============================================================================
// INTERFACES DE RELATÓRIOS
// ============================================================================

export interface ProgressReport {
  readonly patient: PatientSummary;
  readonly initialAssessment: InitialAssessment;
  readonly sessionEvolutions: SessionEvolution[];
  readonly painEvolution: PainEvolutionAnalysis;
  readonly functionalProgress: FunctionalProgressAnalysis;
  readonly treatmentCompliance: ComplianceAnalysis;
  readonly recommendations: string[];
  readonly generatedAt: Date;
  readonly generatedBy: TherapistId;
}

export interface DischargeReport {
  readonly patient: PatientSummary;
  readonly treatmentSummary: TreatmentSummary;
  readonly outcomeMeasures: OutcomeMeasure[];
  readonly finalRecommendations: string[];
  readonly followUpPlan: FollowUpPlan;
  readonly generatedAt: Date;
  readonly generatedBy: TherapistId;
}

export interface PatientSummary {
  readonly id: PatientId;
  readonly name: string;
  readonly age: number;
  readonly gender: string;
  readonly diagnosis: string;
}

export interface PainEvolutionAnalysis {
  readonly initialLevel: number;
  readonly finalLevel: number;
  readonly improvement: number;
  readonly trend: 'improving' | 'stable' | 'worsening';
  readonly dataPoints: PainDataPoint[];
}

export interface PainDataPoint {
  readonly date: Date;
  readonly level: number;
  readonly location: string;
}

export interface FunctionalProgressAnalysis {
  readonly initialMeasures: Record<string, unknown>;
  readonly finalMeasures: Record<string, unknown>;
  readonly improvements: Record<string, number>;
  readonly goalsAchieved: number;
  readonly totalGoals: number;
}

export interface ComplianceAnalysis {
  readonly attendanceRate: number;
  readonly exerciseCompliance: number;
  readonly homeProgramAdherence: number;
  readonly overallCompliance: number;
}

export interface TreatmentSummary {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly primaryInterventions: string[];
  readonly outcomes: string[];
}

export interface OutcomeMeasure {
  readonly name: string;
  readonly initialScore: number;
  readonly finalScore: number;
  readonly improvement: number;
  readonly unit: string;
}

export interface FollowUpPlan {
  readonly recommendations: string[];
  readonly nextAppointment?: Date;
  readonly homeProgram: Exercise[];
  readonly precautions: string[];
}

// ============================================================================
// INTERFACES DE AUDITORIA
// ============================================================================

export interface AuditTrail {
  readonly id: string;
  readonly documentId: DocumentId;
  readonly action: AuditAction;
  readonly performedBy: TherapistId;
  readonly performedAt: Date;
  readonly details: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

// ============================================================================
// INTERFACES DE ARQUIVAMENTO
// ============================================================================

export interface RetentionPolicy {
  readonly documentType: DocumentType;
  readonly retentionPeriod: number; // em anos
  readonly archiveAfter: number; // em anos
  readonly destroyAfter: number; // em anos
  readonly legalRequirements: string[];
}

export interface ArchiveResult {
  readonly location: string;
  readonly expiresAt: Date;
  readonly encryptionKey: string;
  readonly checksum: string;
}

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', field);
    this.name = 'ValidationError';
  }
}

export class ComplianceError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, 'COMPLIANCE_ERROR', field);
    this.name = 'ComplianceError';
  }
}

export class SignatureError extends DomainError {
  constructor(message: string, field?: string) {
    super(message, 'SIGNATURE_ERROR', field);
    this.name = 'SignatureError';
  }
}

// ============================================================================
// TIPOS DE UTILIDADE
// ============================================================================

export type CreateAssessmentData = Omit<InitialAssessment, 'id' | 'createdAt'>;
export type UpdateAssessmentData = Partial<CreateAssessmentData>;
export type CreateEvolutionData = Omit<SessionEvolution, 'id' | 'createdAt'>;
export type UpdateEvolutionData = Partial<CreateEvolutionData>;

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  readonly query?: string;
  readonly filters?: Record<string, unknown>;
  readonly pagination?: PaginationParams;
}
