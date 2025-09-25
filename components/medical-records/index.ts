// Sistema de Prontuário Eletrônico Médico
// Componentes principais do sistema

export { MedicalRecordsSystem } from './MedicalRecordsSystem';
export { MedicalRecordsDashboard } from './MedicalRecordsDashboard';
export { ClinicalTemplatesManager } from './ClinicalTemplatesManager';
export { DigitalSignatureManager } from './DigitalSignatureManager';
export { ClinicalReportsGenerator } from './ClinicalReportsGenerator';

// Componentes de formulários
export { AssessmentForm } from './AssessmentForm';
export { EvolutionEditor } from './EvolutionEditor';

// Componentes de visualização
export { ClinicalTimeline } from './ClinicalTimeline';
export { DocumentViewer } from './DocumentViewer';

// Tipos e interfaces
export type {
  Patient,
  ClinicalDocument,
  DigitalCertificate,
  DigitalSignature,
  ClinicalTemplate,
  ProgressReport,
  DischargeReport,
  SystemStatus
} from './types';

