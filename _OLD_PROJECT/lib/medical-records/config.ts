// Configurações do sistema de prontuário eletrônico médico

export const MEDICAL_RECORDS_CONFIG = {
  // Configurações de versionamento
  versioning: {
    maxVersions: 50,
    autoIncrement: true,
    allowVersionDeletion: false
  },

  // Configurações de assinatura digital
  digitalSignature: {
    algorithms: ['RSA_SHA256', 'ECDSA_SHA256'] as const,
    certificateValidityDays: 365,
    timestampRequired: true,
    hashAlgorithm: 'SHA256'
  },

  // Configurações de compliance
  compliance: {
    cfm: {
      requiredFields: ['chiefComplaint', 'diagnosis', 'treatmentPlan'],
      signatureRequired: true,
      retentionYears: 20
    },
    coffito: {
      requiredFields: ['subjectiveAssessment', 'objectiveFindings', 'techniquesApplied'],
      signatureRequired: true,
      retentionYears: 20
    },
    lgpd: {
      dataMinimization: true,
      consentRequired: true,
      anonymizationAfterYears: 5
    }
  },

  // Configurações de templates
  templates: {
    maxTemplatesPerUser: 100,
    maxSchemaSize: 10000, // bytes
    allowedFieldTypes: ['string', 'number', 'boolean', 'date', 'array', 'object'],
    defaultValidationRules: {
      string: { maxLength: 1000 },
      number: { min: 0, max: 999999 },
      date: { format: 'YYYY-MM-DD' }
    }
  },

  // Configurações de auditoria
  audit: {
    logAllActions: true,
    retentionDays: 2555, // 7 anos
    includeIPAddress: true,
    includeUserAgent: true
  },

  // Configurações de arquivamento
  archiving: {
    autoArchiveAfterDays: 365,
    compressionEnabled: true,
    encryptionRequired: true,
    retentionPolicies: {
      active: 7 * 365, // 7 anos
      archived: 20 * 365, // 20 anos
      deleted: 30 // 30 dias
    }
  },

  // Configurações de relatórios
  reports: {
    maxReportSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['pdf', 'docx', 'html', 'json'],
    autoGenerateOnDischarge: true,
    includeCharts: true
  },

  // Configurações de integração FHIR
  fhir: {
    version: 'R4',
    baseUrl: process.env.FHIR_BASE_URL || 'http://localhost:8080/fhir',
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    validateResources: true
  },

  // Configurações de performance
  performance: {
    maxConcurrentRequests: 10,
    cacheTimeout: 300, // 5 minutos
    paginationSize: 20,
    searchTimeout: 5000 // 5 segundos
  },

  // Configurações de segurança
  security: {
    encryptionKeyRotationDays: 90,
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false
  }
} as const;

// Tipos derivados das configurações
export type SignatureAlgorithm = typeof MEDICAL_RECORDS_CONFIG.digitalSignature.algorithms[number];
export type ReportFormat = typeof MEDICAL_RECORDS_CONFIG.reports.supportedFormats[number];
export type FieldType = typeof MEDICAL_RECORDS_CONFIG.templates.allowedFieldTypes[number];

// Validações de configuração
export function validateConfig() {
  const errors: string[] = [];

  if (MEDICAL_RECORDS_CONFIG.versioning.maxVersions < 1) {
    errors.push('maxVersions deve ser maior que 0');
  }

  if (MEDICAL_RECORDS_CONFIG.digitalSignature.certificateValidityDays < 30) {
    errors.push('certificateValidityDays deve ser pelo menos 30 dias');
  }

  if (MEDICAL_RECORDS_CONFIG.compliance.cfm.retentionYears < 5) {
    errors.push('CFM retentionYears deve ser pelo menos 5 anos');
  }

  if (MEDICAL_RECORDS_CONFIG.performance.maxConcurrentRequests < 1) {
    errors.push('maxConcurrentRequests deve ser maior que 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utilitários de configuração
export function getRetentionPolicy(documentType: string): number {
  switch (documentType) {
    case 'initial_assessment':
    case 'discharge_summary':
      return MEDICAL_RECORDS_CONFIG.compliance.cfm.retentionYears * 365;
    case 'session_evolution':
      return MEDICAL_RECORDS_CONFIG.compliance.coffito.retentionYears * 365;
    default:
      return 5 * 365; // 5 anos padrão
  }
}

export function isSignatureRequired(documentType: string): boolean {
  return MEDICAL_RECORDS_CONFIG.compliance.cfm.signatureRequired || 
         MEDICAL_RECORDS_CONFIG.compliance.coffito.signatureRequired;
}

export function getMaxFileSize(format: ReportFormat): number {
  return MEDICAL_RECORDS_CONFIG.reports.maxReportSize;
}

