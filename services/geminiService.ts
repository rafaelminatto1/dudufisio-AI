// Mock service for build purposes - Complete function list
export const generateTreatmentProtocol = () => Promise.resolve('');
export const generateSoapNote = () => Promise.resolve('');
export const analyzePainPatterns = () => Promise.resolve('');
export const parseProtocolForTreatmentPlan = () => Promise.resolve({
  treatmentGoals: [],
  exercises: []
});
export const generateClinicalInsights = () => Promise.resolve('');
export const generatePatientReport = () => Promise.resolve('');
export const generateRiskAnalysis = () => Promise.resolve('');
export const generatePainDiaryAnalysis = () => Promise.resolve('');
export const generateEducationalContent = () => Promise.resolve('');
export const generateRetentionSuggestion = () => Promise.resolve('');
export const generateEvaluationReport = () => Promise.resolve('');
export const generateSessionEvolution = () => Promise.resolve('');
export const generateHep = () => Promise.resolve('');
export const generatePatientProgressSummary = () => Promise.resolve('');
export const generateAppointmentReminder = () => Promise.resolve('');
export const generateInactivePatientEmail = () => Promise.resolve('');
export const generateClinicalMaterialContent = () => Promise.resolve('');
export const generatePatientClinicalSummary = () => Promise.resolve('');

// Mock types exports
export interface PatientProgressData {}
export interface EvaluationFormData {}
export interface SessionEvolutionFormData {}
export interface HepFormData {}
export interface RiskAnalysisFormData {}
export interface AppointmentReminderData {}
export interface InactivePatientEmailData {}
export interface RetentionSuggestionData {}
export interface ParsedTreatmentPlan {
  treatmentGoals: string[];
  exercises: any[];
}