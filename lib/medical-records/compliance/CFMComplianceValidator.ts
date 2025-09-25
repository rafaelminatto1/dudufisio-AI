/**
 * Validador de Compliance CFM (Conselho Federal de Medicina)
 * Implementa validações específicas para documentos médicos
 */

import {
  ClinicalDocument,
  ComplianceViolation,
  ValidationResult,
  TherapistId,
  DocumentType,
  DomainError
} from '../../types/medical-records';

export class CFMComplianceValidator {
  private readonly therapistRegistry: TherapistRegistry;
  private readonly documentRepository: DocumentRepository;

  constructor(
    therapistRegistry: TherapistRegistry,
    documentRepository: DocumentRepository
  ) {
    this.therapistRegistry = therapistRegistry;
    this.documentRepository = documentRepository;
  }

  /**
   * Valida documento clínico contra regulamentações CFM
   */
  async validateClinicalDocument(document: ClinicalDocument): Promise<ValidationResult> {
    const violations: ComplianceViolation[] = [];

    try {
      // Validar identificação do profissional
      const therapistViolations = await this.validateTherapistRegistration(document.createdBy);
      violations.push(...therapistViolations);

      // Validar assinatura digital
      const signatureViolations = await this.validateDigitalSignature(document);
      violations.push(...signatureViolations);

      // Validar conteúdo mínimo
      const contentViolations = await this.validateMinimumContent(document);
      violations.push(...contentViolations);

      // Validar prazo de assinatura
      const timingViolations = await this.validateSigningTiming(document);
      violations.push(...timingViolations);

      // Validar retenção de dados
      const retentionViolations = await this.validateDataRetention(document);
      violations.push(...retentionViolations);

      return new ValidationResult(violations.length === 0, violations);
    } catch (error) {
      violations.push(new ComplianceViolation(
        'CFM_VALIDATION_ERROR',
        `Validation error: ${error.message}`,
        'critical'
      ));
      return new ValidationResult(false, violations);
    }
  }

  /**
   * Valida registro do terapeuta no CFM
   */
  private async validateTherapistRegistration(therapistId: TherapistId): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    try {
      const therapist = await this.therapistRegistry.getTherapist(therapistId);
      
      if (!therapist) {
        violations.push(new ComplianceViolation(
          'CFM_001',
          'Therapist not found in registry',
          'critical',
          'createdBy'
        ));
        return violations;
      }

      // Verificar se o terapeuta está ativo
      if (!therapist.isActive) {
        violations.push(new ComplianceViolation(
          'CFM_002',
          'Therapist registration is not active',
          'critical',
          'createdBy'
        ));
      }

      // Verificar se o terapeuta tem especialidade adequada
      if (!therapist.specialties || therapist.specialties.length === 0) {
        violations.push(new ComplianceViolation(
          'CFM_003',
          'Therapist must have at least one specialty registered',
          'high',
          'createdBy'
        ));
      }

      // Verificar validade do registro
      if (therapist.registrationExpiry && therapist.registrationExpiry < new Date()) {
        violations.push(new ComplianceViolation(
          'CFM_004',
          'Therapist registration has expired',
          'critical',
          'createdBy'
        ));
      }

      return violations;
    } catch (error) {
      violations.push(new ComplianceViolation(
        'CFM_005',
        `Error validating therapist registration: ${error.message}`,
        'critical',
        'createdBy'
      ));
      return violations;
    }
  }

  /**
   * Valida assinatura digital
   */
  private async validateDigitalSignature(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Verificar se documento requer assinatura
    if (document.requiresSignature()) {
      if (!document.isSigned()) {
        violations.push(new ComplianceViolation(
          'CFM_006',
          'Clinical document requires digital signature',
          'critical',
          'signature'
        ));
        return violations;
      }

      // Verificar integridade da assinatura
      if (!document.validateIntegrity()) {
        violations.push(new ComplianceViolation(
          'CFM_007',
          'Document signature integrity validation failed',
          'critical',
          'signature'
        ));
      }

      // Verificar se assinatura é recente (não mais de 30 dias)
      const signature = document.getSignature();
      if (signature) {
        const daysSinceSignature = Math.floor(
          (Date.now() - signature.timestamp.time.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceSignature > 30) {
          violations.push(new ComplianceViolation(
            'CFM_008',
            'Document signature is older than 30 days',
            'medium',
            'signature'
          ));
        }
      }
    }

    return violations;
  }

  /**
   * Valida conteúdo mínimo obrigatório
   */
  private async validateMinimumContent(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar identificação do paciente
    if (!content.data.patientId) {
      violations.push(new ComplianceViolation(
        'CFM_009',
        'Patient identification is required',
        'critical',
        'content.patientId'
      ));
    }

    // Verificar data da consulta
    if (!content.data.consultationDate) {
      violations.push(new ComplianceViolation(
        'CFM_010',
        'Consultation date is required',
        'critical',
        'content.consultationDate'
      ));
    }

    // Verificar anamnese
    if (!content.data.anamnesis || content.data.anamnesis.trim().length < 50) {
      violations.push(new ComplianceViolation(
        'CFM_011',
        'Anamnesis must be at least 50 characters',
        'high',
        'content.anamnesis'
      ));
    }

    // Verificar exame físico
    if (!content.data.physicalExam || content.data.physicalExam.trim().length < 30) {
      violations.push(new ComplianceViolation(
        'CFM_012',
        'Physical exam description must be at least 30 characters',
        'high',
        'content.physicalExam'
      ));
    }

    // Verificar diagnóstico
    if (!content.data.diagnosis || content.data.diagnosis.trim().length < 10) {
      violations.push(new ComplianceViolation(
        'CFM_013',
        'Diagnosis is required and must be at least 10 characters',
        'critical',
        'content.diagnosis'
      ));
    }

    // Verificar conduta
    if (!content.data.conduct || content.data.conduct.trim().length < 20) {
      violations.push(new ComplianceViolation(
        'CFM_014',
        'Conduct/treatment plan must be at least 20 characters',
        'high',
        'content.conduct'
      ));
    }

    return violations;
  }

  /**
   * Valida timing de assinatura
   */
  private async validateSigningTiming(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    if (document.isSigned()) {
      const signature = document.getSignature();
      if (signature) {
        const signatureTime = signature.timestamp.time;
        const documentTime = document.createdAt;

        // Verificar se assinatura não é anterior à criação do documento
        if (signatureTime < documentTime) {
          violations.push(new ComplianceViolation(
            'CFM_015',
            'Signature timestamp cannot be before document creation',
            'critical',
            'signature.timestamp'
          ));
        }

        // Verificar se assinatura não é muito posterior à criação (máximo 7 dias)
        const daysDifference = Math.floor(
          (signatureTime.getTime() - documentTime.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDifference > 7) {
          violations.push(new ComplianceViolation(
            'CFM_016',
            'Document must be signed within 7 days of creation',
            'high',
            'signature.timestamp'
          ));
        }
      }
    }

    return violations;
  }

  /**
   * Valida retenção de dados
   */
  private async validateDataRetention(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Verificar se documento tem política de retenção definida
    const content = document.getContent();
    if (!content.metadata.retentionPolicy) {
      violations.push(new ComplianceViolation(
        'CFM_017',
        'Document must have retention policy defined',
        'medium',
        'metadata.retentionPolicy'
      ));
    }

    // Verificar se dados sensíveis estão adequadamente protegidos
    if (this.containsSensitiveData(content.data)) {
      if (!content.metadata.encryptionLevel || content.metadata.encryptionLevel !== 'high') {
        violations.push(new ComplianceViolation(
          'CFM_018',
          'Sensitive data must be encrypted with high-level encryption',
          'high',
          'metadata.encryptionLevel'
        ));
      }
    }

    return violations;
  }

  /**
   * Verifica se conteúdo contém dados sensíveis
   */
  private containsSensitiveData(data: any): boolean {
    const sensitiveFields = [
      'cpf', 'rg', 'cnh', 'passport', 'socialSecurity',
      'medicalRecord', 'diagnosis', 'treatment', 'medication'
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return sensitiveFields.some(field => dataString.includes(field));
  }

  /**
   * Gera relatório de compliance
   */
  async generateComplianceReport(documentId: string): Promise<ComplianceReport> {
    const document = await this.documentRepository.getDocument(documentId);
    if (!document) {
      throw new DomainError('Document not found', 'DOCUMENT_NOT_FOUND_ERROR');
    }

    const validationResult = await this.validateClinicalDocument(document);
    
    return new ComplianceReport({
      documentId,
      documentType: document.type,
      validationResult,
      complianceScore: this.calculateComplianceScore(validationResult.violations),
      recommendations: this.generateRecommendations(validationResult.violations),
      generatedAt: new Date()
    });
  }

  /**
   * Calcula score de compliance
   */
  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 100;

    let totalPenalty = 0;
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          totalPenalty += 25;
          break;
        case 'high':
          totalPenalty += 15;
          break;
        case 'medium':
          totalPenalty += 10;
          break;
        case 'low':
          totalPenalty += 5;
          break;
      }
    }

    return Math.max(0, 100 - totalPenalty);
  }

  /**
   * Gera recomendações baseadas nas violações
   */
  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.code) {
        case 'CFM_001':
        case 'CFM_002':
        case 'CFM_004':
          recommendations.push('Verificar e atualizar registro profissional no CFM');
          break;
        case 'CFM_006':
          recommendations.push('Assinar digitalmente o documento clínico');
          break;
        case 'CFM_007':
          recommendations.push('Verificar integridade da assinatura digital');
          break;
        case 'CFM_009':
          recommendations.push('Incluir identificação completa do paciente');
          break;
        case 'CFM_011':
          recommendations.push('Expandir descrição da anamnese');
          break;
        case 'CFM_012':
          recommendations.push('Detalhar melhor o exame físico');
          break;
        case 'CFM_013':
          recommendations.push('Incluir diagnóstico mais detalhado');
          break;
        case 'CFM_014':
          recommendations.push('Elaborar plano de conduta mais específico');
          break;
        case 'CFM_016':
          recommendations.push('Assinar documento dentro do prazo de 7 dias');
          break;
        case 'CFM_017':
          recommendations.push('Definir política de retenção de dados');
          break;
        case 'CFM_018':
          recommendations.push('Aplicar criptografia de alto nível para dados sensíveis');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicatas
  }
}

/**
 * Relatório de compliance
 */
export class ComplianceReport {
  constructor(
    public readonly documentId: string,
    public readonly documentType: DocumentType,
    public readonly validationResult: ValidationResult,
    public readonly complianceScore: number,
    public readonly recommendations: string[],
    public readonly generatedAt: Date
  ) {}

  get isCompliant(): boolean {
    return this.complianceScore >= 80 && this.validationResult.isValid;
  }

  get criticalViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'critical');
  }

  get highViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'high');
  }
}

/**
 * Interface do registro de terapeutas
 */
export interface TherapistRegistry {
  getTherapist(id: TherapistId): Promise<Therapist | null>;
}

/**
 * Interface do repositório de documentos
 */
export interface DocumentRepository {
  getDocument(id: string): Promise<ClinicalDocument | null>;
}

/**
 * Modelo de terapeuta
 */
export interface Therapist {
  id: TherapistId;
  name: string;
  isActive: boolean;
  specialties: string[];
  registrationExpiry?: Date;
  cfmRegistration: string;
}
