/**
 * 🔒 Compliance System - Sistema de Conformidade LGPD/COFFITO
 * 
 * Exportações principais do sistema de compliance:
 * - LGPD Compliance Service
 * - COFFITO Compliance Service
 * - Compliance Manager
 * - Tipos e interfaces
 */

// Services
export { LGPDComplianceService } from './LGPDComplianceService';
export { COFFITOComplianceService } from './COFFITOComplianceService';
export { ComplianceManager } from './ComplianceManager';

// Types
export type {
  LGPDConsent,
  LGPDDataSubject,
  LGPDAuditLog,
  LGPDDataBreach,
  LGPDDataRetention,
  LGPDPrivacyPolicy
} from './LGPDComplianceService';

export type {
  COFFITOGuideline,
  COFFITOSupervision,
  COFFITODocumentation,
  COFFITOContinuingEducation,
  COFFITOEthicsViolation,
  COFFITOCompetency,
  COFFITOAudit
} from './COFFITOComplianceService';

export type {
  ComplianceStatus,
  ComplianceAlert,
  ComplianceDashboard,
  ComplianceReport
} from './ComplianceManager';

// Factory Functions
export function createComplianceManager(): ComplianceManager {
  return new ComplianceManager();
}

export function createLGPDComplianceService(): LGPDComplianceService {
  return new LGPDComplianceService();
}

export function createCOFFITOComplianceService(): COFFITOComplianceService {
  return new COFFITOComplianceService();
}

// Utility Functions
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateConsentId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateViolationId(): string {
  return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Constants
export const LGPD_CONSENT_TYPES = {
  DATA_PROCESSING: 'data_processing',
  MARKETING: 'marketing',
  RESEARCH: 'research',
  THIRD_PARTY_SHARING: 'third_party_sharing'
} as const;

export const LGPD_LEGAL_BASIS = {
  CONSENT: 'consent',
  CONTRACT: 'contract',
  LEGAL_OBLIGATION: 'legal_obligation',
  VITAL_INTERESTS: 'vital_interests',
  PUBLIC_TASK: 'public_task',
  LEGEGITIMATE_INTERESTS: 'legitimate_interests'
} as const;

export const COFFITO_CATEGORIES = {
  PROFESSIONAL_CONDUCT: 'professional_conduct',
  CLINICAL_PRACTICE: 'clinical_practice',
  DOCUMENTATION: 'documentation',
  EDUCATION: 'education',
  ETHICS: 'ethics'
} as const;

export const COFFITO_COMPLIANCE_LEVELS = {
  MANDATORY: 'mandatory',
  RECOMMENDED: 'recommended',
  OPTIONAL: 'optional'
} as const;

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non_compliant',
  REQUIRES_ATTENTION: 'requires_attention',
  CRITICAL: 'critical'
} as const;

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const ALERT_TYPES = {
  LGPD: 'lgpd',
  COFFITO: 'coffito',
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Default Configurations
export const DEFAULT_LGPD_CONFIG = {
  retentionPeriods: {
    personalData: 2555, // 7 anos
    healthData: 2555, // 7 anos
    financialData: 1825, // 5 anos
    marketingData: 365 // 1 ano
  },
  consentExpiry: 365, // 1 ano
  auditRetention: 2555, // 7 anos
  breachNotificationTime: 72 // 72 horas
};

export const DEFAULT_COFFITO_CONFIG = {
  continuingEducationHours: 40, // horas/ano
  supervisionRequired: true,
  documentationStandards: 'SOAP',
  auditFrequency: 12, // meses
  competencyAssessment: 6 // meses
};

// Error Types
export class LGPDComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'LGPDComplianceError';
  }
}

export class COFFITOComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'COFFITOComplianceError';
  }
}

export class ComplianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'ComplianceError';
  }
}

// Version
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
