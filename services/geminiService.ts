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
export interface PatientProgressData {
  patientId: string;
  progress: string;
}

export interface EvaluationFormData {
  nome_paciente: string;
  profissao_paciente: string;
  idade_paciente: string;
  queixa_principal: string;
  hda: string;
  hmp: string;
  inspecao_palpacao: string;
  adm: string;
  teste_forca: string;
  testes_especiais: string;
  escala_dor: string;
  objetivos_paciente: string;
}

export interface SessionEvolutionFormData {
  numero_sessao: string;
  relato_paciente: string;
  escala_dor_hoje: string;
  dados_objetivos: string;
  intervencoes: string;
  analise_fisio: string;
  proximos_passos: string;
}

export interface HepFormData {
  diagnostico_paciente: string;
  objetivo_hep: string;
  lista_exercicios: string;
  series: string;
  repeticoes: string;
  frequencia: string;
  observacoes: string;
}

export interface RiskAnalysisFormData {
  nome_paciente: string;
  sessoes_realizadas: string;
  sessoes_prescritas: string;
  faltas: string;
  remarcacoes: string;
  ultimo_feedback: string;
  aderencia_hep: string;
}
export interface AppointmentReminderData {}
export interface InactivePatientEmailData {}
export interface RetentionSuggestionData {}
export interface ParsedTreatmentPlan {
  treatmentGoals: string[];
  exercises: any[];
}