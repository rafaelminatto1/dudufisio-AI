/**
 * Validador de Compliance COFFITO (Conselho Federal de Fisioterapia e Terapia Ocupacional)
 * Implementa validações específicas para documentos de fisioterapia
 */

import {
  ClinicalDocument,
  ComplianceViolation,
  ValidationResult,
  TherapistId,
  DocumentType,
  Specialty,
  DomainError
} from '../../types/medical-records';

export class COFFITOValidator {
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
   * Valida documento clínico contra regulamentações COFFITO
   */
  async validateClinicalDocument(document: ClinicalDocument): Promise<ValidationResult> {
    const violations: ComplianceViolation[] = [];

    try {
      // Validar registro profissional COFFITO
      const registrationViolations = await this.validateCOFFITORegistration(document.createdBy);
      violations.push(...registrationViolations);

      // Validar especialidade do profissional
      const specialtyViolations = await this.validateSpecialty(document);
      violations.push(...specialtyViolations);

      // Validar conteúdo específico de fisioterapia
      const contentViolations = await this.validatePhysiotherapyContent(document);
      violations.push(...contentViolations);

      // Validar avaliação funcional
      const functionalViolations = await this.validateFunctionalAssessment(document);
      violations.push(...functionalViolations);

      // Validar plano de tratamento
      const treatmentViolations = await this.validateTreatmentPlan(document);
      violations.push(...treatmentViolations);

      // Validar evolução clínica
      const evolutionViolations = await this.validateClinicalEvolution(document);
      violations.push(...evolutionViolations);

      // Validar prescrição de exercícios
      const exerciseViolations = await this.validateExercisePrescription(document);
      violations.push(...exerciseViolations);

      return new ValidationResult(violations.length === 0, violations);
    } catch (error) {
      violations.push(new ComplianceViolation(
        'COFFITO_VALIDATION_ERROR',
        `Validation error: ${error.message}`,
        'critical'
      ));
      return new ValidationResult(false, violations);
    }
  }

  /**
   * Valida registro COFFITO do terapeuta
   */
  private async validateCOFFITORegistration(therapistId: TherapistId): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    try {
      const therapist = await this.therapistRegistry.getTherapist(therapistId);
      
      if (!therapist) {
        violations.push(new ComplianceViolation(
          'COFFITO_001',
          'Therapist not found in COFFITO registry',
          'critical',
          'createdBy'
        ));
        return violations;
      }

      // Verificar se tem registro COFFITO
      if (!therapist.coffitoRegistration) {
        violations.push(new ComplianceViolation(
          'COFFITO_002',
          'COFFITO registration is required for physiotherapy practice',
          'critical',
          'createdBy'
        ));
      }

      // Verificar se registro está ativo
      if (!therapist.isActive) {
        violations.push(new ComplianceViolation(
          'COFFITO_003',
          'COFFITO registration is not active',
          'critical',
          'createdBy'
        ));
      }

      // Verificar validade do registro
      if (therapist.registrationExpiry && therapist.registrationExpiry < new Date()) {
        violations.push(new ComplianceViolation(
          'COFFITO_004',
          'COFFITO registration has expired',
          'critical',
          'createdBy'
        ));
      }

      // Verificar se tem especialidade registrada
      if (!therapist.specialties || therapist.specialties.length === 0) {
        violations.push(new ComplianceViolation(
          'COFFITO_005',
          'Therapist must have at least one COFFITO specialty registered',
          'high',
          'createdBy'
        ));
      }

      return violations;
    } catch (error) {
      violations.push(new ComplianceViolation(
        'COFFITO_006',
        `Error validating COFFITO registration: ${error.message}`,
        'critical',
        'createdBy'
      ));
      return violations;
    }
  }

  /**
   * Valida especialidade do profissional
   */
  private async validateSpecialty(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    const content = document.getContent();
    const documentSpecialty = content.metadata.specialty;

    try {
      const therapist = await this.therapistRegistry.getTherapist(document.createdBy);
      
      if (therapist && therapist.specialties) {
        const hasSpecialty = therapist.specialties.some(specialty => 
          specialty.toLowerCase() === documentSpecialty.toLowerCase()
        );

        if (!hasSpecialty) {
          violations.push(new ComplianceViolation(
            'COFFITO_007',
            `Therapist does not have registered specialty: ${documentSpecialty}`,
            'high',
            'metadata.specialty'
          ));
        }
      }

      // Validar se especialidade é válida para fisioterapia
      const validSpecialties = [
        'physiotherapy', 'sports_physiotherapy', 'neurological_physiotherapy',
        'orthopedic_physiotherapy', 'respiratory_physiotherapy', 'pediatric_physiotherapy'
      ];

      if (!validSpecialties.includes(documentSpecialty)) {
        violations.push(new ComplianceViolation(
          'COFFITO_008',
          `Invalid specialty for physiotherapy: ${documentSpecialty}`,
          'medium',
          'metadata.specialty'
        ));
      }

      return violations;
    } catch (error) {
      violations.push(new ComplianceViolation(
        'COFFITO_009',
        `Error validating specialty: ${error.message}`,
        'medium',
        'metadata.specialty'
      ));
      return violations;
    }
  }

  /**
   * Valida conteúdo específico de fisioterapia
   */
  private async validatePhysiotherapyContent(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    // Verificar avaliação postural
    if (!content.data.posturalAssessment) {
      violations.push(new ComplianceViolation(
        'COFFITO_010',
        'Postural assessment is required for physiotherapy documents',
        'high',
        'content.posturalAssessment'
      ));
    }

    // Verificar avaliação de amplitude de movimento
    if (!content.data.rangeOfMotion) {
      violations.push(new ComplianceViolation(
        'COFFITO_011',
        'Range of motion assessment is required',
        'high',
        'content.rangeOfMotion'
      ));
    }

    // Verificar avaliação de força muscular
    if (!content.data.muscleStrength) {
      violations.push(new ComplianceViolation(
        'COFFITO_012',
        'Muscle strength assessment is required',
        'high',
        'content.muscleStrength'
      ));
    }

    // Verificar testes especiais
    if (!content.data.specialTests || content.data.specialTests.length === 0) {
      violations.push(new ComplianceViolation(
        'COFFITO_013',
        'At least one special test must be performed',
        'medium',
        'content.specialTests'
      ));
    }

    // Verificar avaliação funcional
    if (!content.data.functionalAssessment) {
      violations.push(new ComplianceViolation(
        'COFFITO_014',
        'Functional assessment is required',
        'high',
        'content.functionalAssessment'
      ));
    }

    return violations;
  }

  /**
   * Valida avaliação funcional
   */
  private async validateFunctionalAssessment(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    if (content.data.functionalAssessment) {
      const assessment = content.data.functionalAssessment;

      // Verificar se tem testes funcionais específicos
      const requiredTests = [
        'balance', 'gait', 'coordination', 'endurance'
      ];

      for (const test of requiredTests) {
        if (!assessment[test]) {
          violations.push(new ComplianceViolation(
            'COFFITO_015',
            `Functional test '${test}' is required`,
            'medium',
            `content.functionalAssessment.${test}`
          ));
        }
      }

      // Verificar se tem escalas funcionais
      if (!assessment.functionalScales || assessment.functionalScales.length === 0) {
        violations.push(new ComplianceViolation(
          'COFFITO_016',
          'At least one functional scale must be used',
          'medium',
          'content.functionalAssessment.functionalScales'
        ));
      }

      // Verificar limitações funcionais
      if (!assessment.functionalLimitations) {
        violations.push(new ComplianceViolation(
          'COFFITO_017',
          'Functional limitations must be documented',
          'medium',
          'content.functionalAssessment.functionalLimitations'
        ));
      }
    }

    return violations;
  }

  /**
   * Valida plano de tratamento
   */
  private async validateTreatmentPlan(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    if (content.data.treatmentPlan) {
      const plan = content.data.treatmentPlan;

      // Verificar objetivos do tratamento
      if (!plan.goals || plan.goals.length === 0) {
        violations.push(new ComplianceViolation(
          'COFFITO_018',
          'Treatment plan must have at least one goal',
          'high',
          'content.treatmentPlan.goals'
        ));
      }

      // Verificar intervenções
      if (!plan.interventions || plan.interventions.length === 0) {
        violations.push(new ComplianceViolation(
          'COFFITO_019',
          'Treatment plan must specify interventions',
          'high',
          'content.treatmentPlan.interventions'
        ));
      }

      // Verificar frequência
      if (!plan.frequency) {
        violations.push(new ComplianceViolation(
          'COFFITO_020',
          'Treatment frequency must be specified',
          'medium',
          'content.treatmentPlan.frequency'
        ));
      }

      // Verificar duração
      if (!plan.duration) {
        violations.push(new ComplianceViolation(
          'COFFITO_021',
          'Treatment duration must be specified',
          'medium',
          'content.treatmentPlan.duration'
        ));
      }

      // Verificar contraindicações
      if (!plan.contraindications) {
        violations.push(new ComplianceViolation(
          'COFFITO_022',
          'Contraindications must be documented',
          'medium',
          'content.treatmentPlan.contraindications'
        ));
      }
    }

    return violations;
  }

  /**
   * Valida evolução clínica
   */
  private async validateClinicalEvolution(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    if (document.type === DocumentType.SESSION_EVOLUTION) {
      const content = document.getContent();

      // Verificar avaliação subjetiva
      if (!content.data.subjectiveAssessment || content.data.subjectiveAssessment.trim().length < 20) {
        violations.push(new ComplianceViolation(
          'COFFITO_023',
          'Subjective assessment must be at least 20 characters',
          'medium',
          'content.subjectiveAssessment'
        ));
      }

      // Verificar avaliação objetiva
      if (!content.data.objectiveFindings || content.data.objectiveFindings.trim().length < 20) {
        violations.push(new ComplianceViolation(
          'COFFITO_024',
          'Objective findings must be at least 20 characters',
          'medium',
          'content.objectiveFindings'
        ));
      }

      // Verificar técnicas aplicadas
      if (!content.data.techniquesApplied || content.data.techniquesApplied.length === 0) {
        violations.push(new ComplianceViolation(
          'COFFITO_025',
          'Applied techniques must be documented',
          'high',
          'content.techniquesApplied'
        ));
      }

      // Verificar resposta do paciente
      if (!content.data.patientResponse || content.data.patientResponse.trim().length < 10) {
        violations.push(new ComplianceViolation(
          'COFFITO_026',
          'Patient response must be documented',
          'medium',
          'content.patientResponse'
        ));
      }

      // Verificar plano para próxima sessão
      if (!content.data.nextSessionPlan || content.data.nextSessionPlan.trim().length < 15) {
        violations.push(new ComplianceViolation(
          'COFFITO_027',
          'Next session plan must be specified',
          'medium',
          'content.nextSessionPlan'
        ));
      }
    }

    return violations;
  }

  /**
   * Valida prescrição de exercícios
   */
  private async validateExercisePrescription(document: ClinicalDocument): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const content = document.getContent();

    if (content.data.exercises || content.data.homeExercises) {
      const exercises = content.data.exercises || content.data.homeExercises;

      if (exercises && exercises.length > 0) {
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];

          // Verificar nome do exercício
          if (!exercise.name || exercise.name.trim().length === 0) {
            violations.push(new ComplianceViolation(
              'COFFITO_028',
              `Exercise ${i + 1} must have a name`,
              'medium',
              `content.exercises[${i}].name`
            ));
          }

          // Verificar descrição
          if (!exercise.description || exercise.description.trim().length < 10) {
            violations.push(new ComplianceViolation(
              'COFFITO_029',
              `Exercise ${i + 1} must have detailed description`,
              'medium',
              `content.exercises[${i}].description`
            ));
          }

          // Verificar repetições
          if (!exercise.repetitions || exercise.repetitions <= 0) {
            violations.push(new ComplianceViolation(
              'COFFITO_030',
              `Exercise ${i + 1} must specify repetitions`,
              'medium',
              `content.exercises[${i}].repetitions`
            ));
          }

          // Verificar séries
          if (!exercise.sets || exercise.sets <= 0) {
            violations.push(new ComplianceViolation(
              'COFFITO_031',
              `Exercise ${i + 1} must specify sets`,
              'medium',
              `content.exercises[${i}].sets`
            ));
          }

          // Verificar instruções
          if (!exercise.instructions || exercise.instructions.trim().length < 15) {
            violations.push(new ComplianceViolation(
              'COFFITO_032',
              `Exercise ${i + 1} must have detailed instructions`,
              'medium',
              `content.exercises[${i}].instructions`
            ));
          }
        }
      }
    }

    return violations;
  }

  /**
   * Gera relatório de compliance COFFITO
   */
  async generateCOFFITOComplianceReport(documentId: string): Promise<COFFITOComplianceReport> {
    const document = await this.documentRepository.getDocument(documentId);
    if (!document) {
      throw new DomainError('Document not found', 'DOCUMENT_NOT_FOUND_ERROR');
    }

    const validationResult = await this.validateClinicalDocument(document);
    
    return new COFFITOComplianceReport({
      documentId,
      documentType: document.type,
      validationResult,
      complianceScore: this.calculateComplianceScore(validationResult.violations),
      recommendations: this.generateRecommendations(validationResult.violations),
      generatedAt: new Date()
    });
  }

  /**
   * Calcula score de compliance COFFITO
   */
  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 100;

    let totalPenalty = 0;
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          totalPenalty += 30;
          break;
        case 'high':
          totalPenalty += 20;
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
   * Gera recomendações baseadas nas violações COFFITO
   */
  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.code) {
        case 'COFFITO_001':
        case 'COFFITO_002':
        case 'COFFITO_003':
        case 'COFFITO_004':
          recommendations.push('Verificar e atualizar registro COFFITO');
          break;
        case 'COFFITO_005':
          recommendations.push('Registrar especialidade no COFFITO');
          break;
        case 'COFFITO_007':
          recommendations.push('Verificar se especialidade está registrada no COFFITO');
          break;
        case 'COFFITO_010':
          recommendations.push('Incluir avaliação postural');
          break;
        case 'COFFITO_011':
          recommendations.push('Documentar avaliação de amplitude de movimento');
          break;
        case 'COFFITO_012':
          recommendations.push('Documentar avaliação de força muscular');
          break;
        case 'COFFITO_013':
          recommendations.push('Realizar e documentar testes especiais');
          break;
        case 'COFFITO_014':
          recommendations.push('Incluir avaliação funcional');
          break;
        case 'COFFITO_015':
          recommendations.push('Realizar testes funcionais específicos');
          break;
        case 'COFFITO_016':
          recommendations.push('Utilizar escalas funcionais padronizadas');
          break;
        case 'COFFITO_017':
          recommendations.push('Documentar limitações funcionais');
          break;
        case 'COFFITO_018':
          recommendations.push('Definir objetivos claros do tratamento');
          break;
        case 'COFFITO_019':
          recommendations.push('Especificar intervenções do tratamento');
          break;
        case 'COFFITO_020':
          recommendations.push('Definir frequência do tratamento');
          break;
        case 'COFFITO_021':
          recommendations.push('Especificar duração do tratamento');
          break;
        case 'COFFITO_022':
          recommendations.push('Documentar contraindicações');
          break;
        case 'COFFITO_023':
          recommendations.push('Expandir avaliação subjetiva');
          break;
        case 'COFFITO_024':
          recommendations.push('Detalhar achados objetivos');
          break;
        case 'COFFITO_025':
          recommendations.push('Documentar técnicas aplicadas');
          break;
        case 'COFFITO_026':
          recommendations.push('Registrar resposta do paciente');
          break;
        case 'COFFITO_027':
          recommendations.push('Planejar próxima sessão');
          break;
        case 'COFFITO_028':
        case 'COFFITO_029':
        case 'COFFITO_030':
        case 'COFFITO_031':
        case 'COFFITO_032':
          recommendations.push('Completar prescrição de exercícios');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicatas
  }
}

/**
 * Relatório de compliance COFFITO
 */
export class COFFITOComplianceReport {
  constructor(
    public readonly documentId: string,
    public readonly documentType: DocumentType,
    public readonly validationResult: ValidationResult,
    public readonly complianceScore: number,
    public readonly recommendations: string[],
    public readonly generatedAt: Date
  ) {}

  get isCompliant(): boolean {
    return this.complianceScore >= 85 && this.validationResult.isValid;
  }

  get criticalViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'critical');
  }

  get highViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => v.severity === 'high');
  }

  get physiotherapySpecificViolations(): ComplianceViolation[] {
    return this.validationResult.violations.filter(v => 
      v.code.startsWith('COFFITO_') && 
      ['COFFITO_010', 'COFFITO_011', 'COFFITO_012', 'COFFITO_013', 'COFFITO_014'].includes(v.code)
    );
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
 * Modelo de terapeuta COFFITO
 */
export interface Therapist {
  id: TherapistId;
  name: string;
  isActive: boolean;
  specialties: string[];
  registrationExpiry?: Date;
  coffitoRegistration: string;
  cfmRegistration?: string;
}
