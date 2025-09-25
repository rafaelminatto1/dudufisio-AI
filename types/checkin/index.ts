import { Appointment, Exercise, Message } from '../../types';

// Define types that are specific to check-in system
export interface TreatmentSession {
  id: string;
  patientId: PatientId;
  appointmentId: string;
  date: Date;
  duration: number;
  therapistNotes?: string;
  exercises: string[];
  painLevel?: number;
  progressNotes?: string;
}

export interface TreatmentProgress {
  patientId: PatientId;
  date: Date;
  painLevel: number;
  mobilityScore: number;
  functionalScore: number;
  goals: { description: string; achieved: boolean }[];
  notes?: string;
}

export type PatientId = string;
export type AppointmentId = string;
export type DeviceId = string;

export interface CheckInData {
  deviceId: DeviceId;
  photo?: ImageData;
  searchCriteria?: PatientSearchCriteria;
  healthAnswers: HealthScreeningAnswers;
  printReceipt: boolean;
  metadata?: Record<string, any>;
}

export interface PatientSearchCriteria {
  name?: string;
  phoneNumber?: string;
  cpf?: string;
  dateOfBirth?: Date;
}

export interface HealthScreeningAnswers {
  hasSymptoms: boolean;
  symptoms: string[];
  temperature?: number;
  hasBeenExposed: boolean;
  isVaccinated: boolean;
  additionalInfo?: string;
}

export interface FaceRecognitionConfig {
  apiKey: string;
  confidenceThreshold: number;
  maxFaces: number;
}

export interface EnrollmentResult {
  success: boolean;
  patientId?: PatientId;
  qualityScore?: number;
  enrolledAt?: Date;
  error?: string;
}

export interface RecognitionResult {
  type: 'success' | 'no_face' | 'no_match' | 'low_confidence' | 'error';
  patientId?: PatientId;
  confidence?: number;
  matches?: FaceMatch[];
  error?: string;
}

export interface FaceMatch {
  patientId: PatientId;
  confidence: number;
}

export interface CheckInResult {
  success: boolean;
  checkIn?: CheckIn;
  requiresManualSelection?: PatientMatch[];
  error?: string;
}

export interface CheckIn {
  id: string;
  patientId: PatientId;
  appointmentId: AppointmentId;
  checkInTime: Date;
  method: 'facial_recognition' | 'manual_search' | 'qr_code' | 'phone_number';
  deviceId: DeviceId;
  healthScreeningPassed: boolean;
  status: 'completed' | 'failed' | 'cancelled' | 'requires_review';
  queuePosition?: number;
  estimatedWaitTime?: number;
  additionalData?: Record<string, any>;
}

export interface AppointmentValidation {
  isValid: boolean;
  appointmentId?: AppointmentId;
  reason?: string;
}

export interface HealthScreeningResult {
  isApproved: boolean;
  issues?: string[];
  requiresReview?: boolean;
  riskFactors?: RiskFactor[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface QueueEntry {
  checkIn: CheckIn;
  priority: number;
  estimatedDuration: number;
  addedAt: Date;
}

export interface QueuePosition {
  position: number;
  estimatedWaitTime: number;
}

export interface PatientMatch {
  patientId: PatientId;
  name: string;
  confidence: number;
  matchingFields: string[];
}

export interface TabletConfig {
  deviceId: DeviceId;
  camera: CameraConfig;
  printer: PrinterConfig;
  checkIn: CheckInEngineConfig;
}

export interface CameraConfig {
  resolution: { width: number; height: number };
  facingMode: 'user' | 'environment';
  autoFocus: boolean;
}

export interface PrinterConfig {
  type: 'thermal' | 'inkjet';
  connectionType: 'usb' | 'network';
  address?: string;
}

export interface CheckInEngineConfig {
  faceRecognitionEnabled: boolean;
  healthScreeningRequired: boolean;
  queueManagementEnabled: boolean;
}

export interface ProgressSummary {
  overallImprovement: number;
  painReduction: number;
  mobilityIncrease: number;
  completedExercises: number;
  adherenceRate: number;
  nextGoals: string[];
}

export interface PatientDashboard {
  upcomingAppointments: Appointment[];
  recentSessions: TreatmentSession[];
  treatmentProgress: TreatmentProgress;
  prescribedExercises: Exercise[];
  unreadMessages: Message[];
  nextAppointment?: Appointment;
  progressSummary: ProgressSummary;
}

export interface TreatmentTimeline {
  sessions: TimelineEvent[];
  bodyMapEvents: TimelineEvent[];
  exerciseEvents: TimelineEvent[];

  sortByDate(): TreatmentTimeline;
}

export interface TimelineEvent {
  id: string;
  type: 'session' | 'body_map' | 'exercise';
  date: Date;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface CheckInMetrics {
  totalCheckIns: number;
  faceRecognitionCount: number;
  avgConfidence: number;
  failedCheckIns: number;
  avgCheckInDuration: number;
  dailyBreakdown: DailyMetrics[];
}

export interface DailyMetrics {
  date: Date;
  totalCheckIns: number;
  faceRecognitionCount: number;
  avgConfidence: number;
  failedCheckIns: number;
  avgCheckInDuration: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PushNotification {
  title: string;
  body: string;
  data: {
    type: string;
    [key: string]: any;
  };
  badge?: number;
}

export interface PatientPortalSession {
  id: string;
  patientId: PatientId;
  sessionToken: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  loginMethod: string;
  twoFactorVerified: boolean;
}