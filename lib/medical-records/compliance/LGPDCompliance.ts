/**
 * Validador de Compliance LGPD (Lei Geral de Proteção de Dados)
 * Implementa validações específicas para proteção de dados pessoais
 */

import {
  ClinicalDocument,
  ComplianceViolation,
  ValidationResult,
  TherapistId,
  DocumentType,
  DomainError
} from '../../types/medical-records';

export class LGPDComplianceValidator {
  private readonly consentRepository: ConsentRepository;
  private readonly documentRepository: DocumentRepository;

  constructor(
    consentRepository: ConsentRepository,
    documentRepository: DocumentRepository
  ) {
    this.consentRepository = consentRepository;
    this.documentRepository = documentRepository;
  }

  /**
   * Valida documento clínico contra regulamentações LGPD
   */
  async validateClinicalDocument(document: ClinicalDocument): Promise<ValidationResult> {
    const violations: ComplianceViolation[] = [];

    try {
      // Validar consentimento do titular
      const consentViolations = await this.validateDataConsent(document);
      violations.push(...consentViolations);

      // Validar finalidade dos dados
      const purposeViolations = await this.validateDataPurpose(document);
      violations.push(...purposeViolations);

      // Validar minimização de dados
      const minimizationViolations = await this.validateDataMinimization(document);
      violations.push(...minimizationViolations);

      // Validar segurança dos dados
      const securityViolations = await this.validateDataSecurity(document);
      violations.push(...securityViolations);

      // Validar retenção de dados
      const retentionViolations = await this.validateDataRetention(document);
      violations.push(...retentionViolations);

      // Validar direitos do titular
      const rightsViolations = await this.validateDataSubjectRights(document);
      violations.push(...rightsViolations);

      // Validar transferência de dados
      const transferViolations = await this.validateDataTransfer(document);
      violations.push(...transferViolations);

      return new ValidationResult(violations.length === 0, violations);
    } catch (error) {
      violations.push(new ComplianceViolation(
        'LGPD_VALIDATION_ERROR',
        `Validation error: ${error.message}`,
        'critical'
      ));
      return new ValidationResult(false, violations);
    }
  }

  /**
   * Valida consentimento do titular dos dados
   */
  private async validateDataConsent(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    try {
      const patientId = document.patientId;
      const consent = await this.consentRepository.getConsent(patientId);

      if (!consent) {
        violations.push(new ComplianceViolation(
          'LGPD_001',
          'Data processing consent is required',
          'critical',
          'consent'
        ));
        return violations;
      }

      // Verificar se consentimento está ativo
      if (!consent.isActive) {
        violations.push(new ComplianceViolation(
          'LGPD_002',
          'Data processing consent is not active',
          'critical',
          'consent'
        ));
      }

      // Verificar se consentimento não expirou
      if (consent.expiryDate && consent.expiryDate < new Date()) {
        violations.push(new ComplianceViolation(
          'LGPD_003',
          'Data processing consent has expired',
          'critical',
          'consent'
        ));
      }

      // Verificar se consentimento cobre o tipo de documento
      if (!consent.allowedDocumentTypes.includes(document.type)) {
        violations.push(new ComplianceViolation(
          'LGPD_004',
          `Consent does not cover document type: ${document.type}`,
          'high',
          'consent'
        ));
      }

      // Verificar se consentimento foi dado livremente
      if (!consent.freelyGiven) {
        violations.push(new ComplianceViolation(
          'LGPD_005',
          'Consent must be freely given',
          'high',
          'consent'
        ));
      }

      // Verificar se consentimento é específico
      if (!consent.specific) {
        violations.push(new ComplianceViolation(
          'LGPD_006',
          'Consent must be specific to the purpose',
          'medium',
          'consent'
        ));
      }

      // Verificar se consentimento é informado
      if (!consent.informed) {
        violations.push(new ComplianceViolation(
          'LGPD_007',
          'Consent must be informed',
          'medium',
          'consent'
        ));
      }

      return violations;
    } catch (error) {
      violations.push(new ComplianceViolation(
        'LGPD_008',
        `Error validating consent: ${error.message}`,
        'critical',
        'consent'
      ));
      return violations;
    }
  }

  /**
   * Valida finalidade dos dados
   */
  private async validateDataPurpose(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se finalidade está definida
    if (!content.metadata.purpose) {
      violations.push(new ComplianceViolation(
        'LGPD_009',
        'Data processing purpose must be defined',
        'high',
        'metadata.purpose'
      ));
    }

    // Verificar se finalidade é legítima
    const legitimatePurposes = [
      'healthcare_provision',
      'medical_treatment',
      'health_research',
      'public_health',
      'legal_obligation'
    ];

    if (content.metadata.purpose && !legitimatePurposes.includes(content.metadata.purpose)) {
      violations.push(new ComplianceViolation(
        'LGPD_010',
        'Data processing purpose must be legitimate',
        'high',
        'metadata.purpose'
      ));
    }

    // Verificar se finalidade é específica
    if (content.metadata.purpose && content.metadata.purpose === 'general') {
      violations.push(new ComplianceViolation(
        'LGPD_011',
        'Data processing purpose must be specific',
        'medium',
        'metadata.purpose'
      ));
    }

    return violations;
  }

  /**
   * Valida minimização de dados
   */
  private async validateDataMinimization(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se dados são adequados
    if (!this.areDataAdequate(content.data, document.type)) {
      violations.push(new ComplianceViolation(
        'LGPD_012',
        'Data must be adequate for the purpose',
        'medium',
        'content.data'
      ));
    }

    // Verificar se dados são relevantes
    if (!this.areDataRelevant(content.data, document.type)) {
      violations.push(new ComplianceViolation(
        'LGPD_013',
        'Data must be relevant for the purpose',
        'medium',
        'content.data'
      ));
    }

    // Verificar se dados são limitados ao necessário
    if (!this.areDataLimited(content.data, document.type)) {
      violations.push(new ComplianceViolation(
        'LGPD_014',
        'Data must be limited to what is necessary',
        'medium',
        'content.data'
      ));
    }

    // Verificar se dados são exatos
    if (!this.areDataAccurate(content.data)) {
      violations.push(new ComplianceViolation(
        'LGPD_015',
        'Data must be accurate and up-to-date',
        'medium',
        'content.data'
      ));
    }

    return violations;
  }

  /**
   * Valida segurança dos dados
   */
  private async validateDataSecurity(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se dados sensíveis estão criptografados
    if (this.containsSensitiveData(content.data)) {
      if (!content.metadata.encryptionLevel || content.metadata.encryptionLevel !== 'high') {
        violations.push(new ComplianceViolation(
          'LGPD_016',
          'Sensitive data must be encrypted',
          'high',
          'metadata.encryptionLevel'
        ));
      }
    }

    // Verificar se há controle de acesso
    if (!content.metadata.accessControl) {
      violations.push(new ComplianceViolation(
        'LGPD_017',
        'Access control must be implemented',
        'high',
        'metadata.accessControl'
      ));
    }

    // Verificar se há auditoria
    if (!content.metadata.auditTrail) {
      violations.push(new ComplianceViolation(
        'LGPD_018',
        'Audit trail must be maintained',
        'medium',
        'metadata.auditTrail'
      ));
    }

    // Verificar se há backup seguro
    if (!content.metadata.backupPolicy) {
      violations.push(new ComplianceViolation(
        'LGPD_019',
        'Backup policy must be defined',
        'medium',
        'metadata.backupPolicy'
      ));
    }

    return violations;
  }

  /**
   * Valida retenção de dados
   */
  private async validateDataRetention(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se política de retenção está definida
    if (!content.metadata.retentionPolicy) {
      violations.push(new ComplianceViolation(
        'LGPD_020',
        'Data retention policy must be defined',
        'high',
        'metadata.retentionPolicy'
      ));
    }

    // Verificar se prazo de retenção é adequado
    if (content.metadata.retentionPolicy) {
      const retentionPeriod = content.metadata.retentionPolicy.retentionPeriod;
      
      // Verificar se não excede 5 anos para dados de saúde
      if (retentionPeriod > 5) {
        violations.push(new ComplianceViolation(
          'LGPD_021',
          'Data retention period should not exceed 5 years for health data',
          'medium',
          'metadata.retentionPolicy.retentionPeriod'
        ));
      }

      // Verificar se não é inferior a 1 ano
      if (retentionPeriod < 1) {
        violations.push(new ComplianceViolation(
          'LGPD_022',
          'Data retention period should be at least 1 year',
          'medium',
          'metadata.retentionPolicy.retentionPeriod'
        ));
      }
    }

    return violations;
  }

  /**
   * Valida direitos do titular
   */
  private async validateDataSubjectRights(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se há procedimento para acesso
    if (!content.metadata.accessProcedure) {
      violations.push(new ComplianceViolation(
        'LGPD_023',
        'Data subject access procedure must be defined',
        'medium',
        'metadata.accessProcedure'
      ));
    }

    // Verificar se há procedimento para retificação
    if (!content.metadata.rectificationProcedure) {
      violations.push(new ComplianceViolation(
        'LGPD_024',
        'Data rectification procedure must be defined',
        'medium',
        'metadata.rectificationProcedure'
      ));
    }

    // Verificar se há procedimento para exclusão
    if (!content.metadata.deletionProcedure) {
      violations.push(new ComplianceViolation(
        'LGPD_025',
        'Data deletion procedure must be defined',
        'medium',
        'metadata.deletionProcedure'
      ));
    }

    // Verificar se há procedimento para portabilidade
    if (!content.metadata.portabilityProcedure) {
      violations.push(new ComplianceViolation(
        'LGPD_026',
        'Data portability procedure must be defined',
        'low',
        'metadata.portabilityProcedure'
      ));
    }

    return violations;
  }

  /**
   * Valida transferência de dados
   */
  private async validateDataTransfer(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar se há transferência internacional
    if (content.metadata.internationalTransfer) {
      if (!content.metadata.adequacyDecision) {
        violations.push(new ComplianceViolation(
          'LGPD_027',
          'Adequacy decision required for international transfer',
          'high',
          'metadata.adequacyDecision'
        ));
      }

      if (!content.metadata.safeguards) {
        violations.push(new ComplianceViolation(
          'LGPD_028',
          'Appropriate safeguards required for international transfer',
          'high',
          'metadata.safeguards'
        ));
      }
    }

    // Verificar se há compartilhamento com terceiros
    if (content.metadata.thirdPartySharing) {
      if (!content.metadata.thirdPartyAgreements) {
        violations.push(new ComplianceViolation(
          'LGPD_029',
          'Third-party data sharing agreements required',
          'medium',
          'metadata.thirdPartyAgreements'
        ));
      }
    }

    return violations;
  }

  /**
   * Verifica se dados são adequados
   */
  private areDataAdequate(data: any, documentType: DocumentType): boolean {
    // Implementar lógica específica para cada tipo de documento
    switch (documentType) {
      case DocumentType.INITIAL_ASSESSMENT:
        return this.hasRequiredAssessmentData(data);
      case DocumentType.SESSION_EVOLUTION:
        return this.hasRequiredEvolutionData(data);
      case DocumentType.TREATMENT_PLAN:
        return this.hasRequiredTreatmentData(data);
      default:
        return true;
    }
  }

  /**
   * Verifica se dados são relevantes
   */
  private areDataRelevant(data: any, documentType: DocumentType): boolean {
    // Verificar se dados são relevantes para o tipo de documento
    const irrelevantFields = this.getIrrelevantFields(documentType);
    
    for (const field of irrelevantFields) {
      if (data[field] !== undefined) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Verifica se dados são limitados ao necessário
   */
  private areDataLimited(data: any, documentType: DocumentType): boolean {
    // Verificar se não há dados excessivos
    const requiredFields = this.getRequiredFields(documentType);
    const dataFields = Object.keys(data);
    
    // Verificar se há campos desnecessários
    const unnecessaryFields = dataFields.filter(field => 
      !requiredFields.includes(field) && 
      !this.isOptionalField(field, documentType)
    );
    
    return unnecessaryFields.length === 0;
  }

  /**
   * Verifica se dados são exatos
   */
  private areDataAccurate(data: any): boolean {
    // Verificar se dados não estão obviamente incorretos
    if (data.birthDate && new Date(data.birthDate) > new Date()) {
      return false;
    }
    
    if (data.age && (data.age < 0 || data.age > 150)) {
      return false;
    }
    
    return true;
  }

  /**
   * Verifica se contém dados sensíveis
   */
  private containsSensitiveData(data: any): boolean {
    const sensitiveFields = [
      'cpf', 'rg', 'cnh', 'passport', 'socialSecurity',
      'medicalRecord', 'diagnosis', 'treatment', 'medication',
      'geneticData', 'biometricData', 'healthData'
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return sensitiveFields.some(field => dataString.includes(field));
  }

  /**
   * Obtém campos obrigatórios por tipo de documento
   */
  private getRequiredFields(documentType: DocumentType): string[] {
    switch (documentType) {
      case DocumentType.INITIAL_ASSESSMENT:
        return ['patientId', 'chiefComplaint', 'medicalHistory', 'physicalExam', 'diagnosis'];
      case DocumentType.SESSION_EVOLUTION:
        return ['patientId', 'sessionId', 'subjectiveAssessment', 'objectiveFindings', 'patientResponse'];
      case DocumentType.TREATMENT_PLAN:
        return ['patientId', 'goals', 'interventions', 'frequency', 'duration'];
      default:
        return ['patientId'];
    }
  }

  /**
   * Obtém campos irrelevantes por tipo de documento
   */
  private getIrrelevantFields(documentType: DocumentType): string[] {
    switch (documentType) {
      case DocumentType.INITIAL_ASSESSMENT:
        return ['sessionId', 'nextSessionPlan'];
      case DocumentType.SESSION_EVOLUTION:
        return ['chiefComplaint', 'medicalHistory'];
      case DocumentType.TREATMENT_PLAN:
        return ['sessionId', 'subjectiveAssessment'];
      default:
        return [];
    }
  }

  /**
   * Verifica se campo é opcional
   */
  private isOptionalField(field: string, documentType: DocumentType): boolean {
    const optionalFields = [
      'notes', 'comments', 'recommendations', 'observations',
      'additionalInfo', 'metadata', 'tags'
    ];
    
    return optionalFields.includes(field);
  }

  /**
   * Verifica se tem dados obrigatórios de avaliação
   */
  private hasRequiredAssessmentData(data: any): boolean {
    return data.chiefComplaint && 
           data.medicalHistory && 
           data.physicalExam && 
           data.diagnosis;
  }

  /**
   * Verifica se tem dados obrigatórios de evolução
   */
  private hasRequiredEvolutionData(data: any): boolean {
    return data.subjectiveAssessment && 
           data.objectiveFindings && 
           data.patientResponse;
  }

  /**
   * Verifica se tem dados obrigatórios de tratamento
   */
  private hasRequiredTreatmentData(data: any): boolean {
    return data.goals && 
           data.interventions && 
           data.frequency && 
           data.duration;
  }

  /**
   * Gera relatório de compliance LGPD
   */
  async generateLGPDComplianceReport(documentId: string): Promise<LGPDComplianceReport> {
    const document = await this.documentRepository.getDocument(documentId);
    if (!document) {
      throw new DomainError('Document not found', 'DOCUMENT_NOT_FOUND_ERROR');
    }

    const validationResult = await this.validateClinicalDocument(document);
    
    return new LGPDComplianceReport({
      documentId,
      documentType: document.type,
      validationResult,
      complianceScore: this.calculateComplianceScore(validationResult.violations),
      recommendations: this.generateRecommendations(validationResult.violations),
      generatedAt: new Date()
    });
  }

  /**
   * Calcula score de compliance LGPD
   */
  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 100;

    let totalPenalty = 0;
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          totalPenalty += 35;
          break;
        case 'high':
          totalPenalty += 25;
          break;
        case 'medium':
          totalPenalty += 15;
          break;
        case 'low':
          totalPenalty += 5;
          break;
      }
    }

    return Math.max(0, 100 - totalPenalty);
  }

  /**
   * Gera recomendações baseadas nas violações LGPD
   */
  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.code) {
        case 'LGPD_001':
        case 'LGPD_002':
        case 'LGPD_003':
          recommendations.push('Obter consentimento válido do titular dos dados');
          break;
        case 'LGPD_004':
          recommendations.push('Atualizar consentimento para incluir tipo de documento');
          break;
        case 'LGPD_005':
          recommendations.push('Garantir que consentimento seja dado livremente');
          break;
        case 'LGPD_006':
          recommendations.push('Tornar consentimento mais específico');
          break;
        case 'LGPD_007':
          recommendations.push('Fornecer informações claras sobre processamento');
          break;
        case 'LGPD_009':
          recommendations.push('Definir finalidade específica do processamento');
          break;
        case 'LGPD_010':
          recommendations.push('Usar finalidade legítima para processamento');
          break;
        case 'LGPD_011':
          recommendations.push('Especificar finalidade do processamento');
          break;
        case 'LGPD_012':
        case 'LGPD_013':
        case 'LGPD_014':
          recommendations.push('Aplicar princípio de minimização de dados');
          break;
        case 'LGPD_015':
          recommendations.push('Garantir exatidão dos dados');
          break;
        case 'LGPD_016':
          recommendations.push('Implementar criptografia para dados sensíveis');
          break;
        case 'LGPD_017':
          recommendations.push('Implementar controle de acesso');
          break;
        case 'LGPD_018':
          recommendations.push('Manter trilha de auditoria');
          break;
        case 'LGPD_019':
          recommendations.push('Definir política de backup');
          break;
        case 'LGPD_020':
          recommendations.push('Definir política de retenção de dados');
          break;
        case 'LGPD_021':
          recommendations.push('Revisar prazo de retenção (máximo 5 anos)');
          break;
        case 'LGPD_022':
          recommendations.push('Aumentar prazo de retenção (mínimo 1 ano)');
          break;
        case 'LGPD_023':
          recommendations.push('Definir procedimento de acesso aos dados');
          break;
        case 'LGPD_024':
          recommendations.push('Definir procedimento de retificação');
          break;
        case 'LGPD_025':
          recommendations.push('Definir procedimento de exclusão');
          break;
        case 'LGPD_026':
          recommendations.push('Definir procedimento de portabilidade');
          break;
        case 'LGPD_027':
          recommendations.push('Obter decisão de adequação para transferência');
          break;
        case 'LGPD_028':
          recommendations.push('Implementar salvaguardas para transferência');
          break;
        case 'LGPD_029':
          recommendations.push('Estabelecer acordos com terceiros');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicatas
  }
}

/**
 * Relatório de compliance LGPD
 */
export class LGPDComplianceReport {
  constructor(
    public readonly documentId: string,
    public readonly documentType: DocumentType,
    public readonly validationResult: ValidationResult,
    public readonly complianceScore: number,
    public readonly recommendations: string[],
    public readonly generatedAt: Date
  ) {}

  get isCompliant(): boolean {
    return this.complianceScore >= 90 && this.validationResult.isValid;
  }

  get criticalViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'critical');
  }

  get highViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'high');
  }

  get consentViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => 
      v.code.startsWith('LGPD_') && 
      ['LGPD_001', 'LGPD_002', 'LGPD_003', 'LGPD_004', 'LGPD_005', 'LGPD_006', 'LGPD_007'].includes(v.code)
    );
  }

  get securityViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => 
      v.code.startsWith('LGPD_') && 
      ['LGPD_016', 'LGPD_017', 'LGPD_018', 'LGPD_019'].includes(v.code)
    );
  }
}

/**
 * Interface do repositório de consentimento
 */
export interface ConsentRepository {
  getConsent(patientId: string): Promise<DataConsent | null>;
}

/**
 * Interface do repositório de documentos
 */
export interface DocumentRepository {
  getDocument(id: string): Promise<ClinicalDocument | null>;
}

/**
 * Modelo de consentimento de dados
 */
export interface DataConsent {
  id: string;
  patientId: string;
  isActive: boolean;
  expiryDate?: Date;
  allowedDocumentTypes: DocumentType[];
  freelyGiven: boolean;
  specific: boolean;
  informed: boolean;
  purpose: string;
  grantedAt: Date;
  grantedBy: string;
}

