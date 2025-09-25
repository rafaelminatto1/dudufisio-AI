/**
 * Entidade de Domínio: InitialAssessment
 * Representa uma avaliação inicial estruturada seguindo padrões clínicos
 * Integrada com o sistema de prontuário eletrônico
 */

import {
  AssessmentId,
  PatientId,
  TherapistId,
  Specialty,
  ChiefComplaint,
  MedicalHistory,
  PhysicalExam,
  FunctionalTest,
  PhysiotherapyDiagnosis,
  TreatmentPlan,
  TreatmentGoal,
  CreateAssessmentData,
  DomainError,
  ValidationError
} from '../../../types/medical-records';

export class InitialAssessment {
  private constructor(
    public readonly id: AssessmentId,
    public readonly patientId: PatientId,
    public readonly chiefComplaint: ChiefComplaint,
    public readonly medicalHistory: MedicalHistory,
    public readonly physicalExam: PhysicalExam,
    public readonly functionalTests: FunctionalTest[],
    public readonly diagnosis: PhysiotherapyDiagnosis,
    public readonly treatmentPlan: TreatmentPlan,
    public readonly goals: TreatmentGoal[],
    public readonly specialty: Specialty,
    public readonly createdBy: TherapistId,
    public readonly createdAt: Date
  ) {
    this.validateInvariants();
  }

  /**
   * Cria uma nova avaliação inicial
   */
  static create(data: CreateAssessmentData): InitialAssessment {
    const id = this.generateId();
    const now = new Date();

    // Validar dados de entrada
    this.validateCreateData(data);

    return new InitialAssessment(
      id,
      data.patientId,
      data.chiefComplaint,
      data.medicalHistory,
      data.physicalExam,
      data.functionalTests,
      data.diagnosis,
      data.treatmentPlan,
      data.goals,
      data.specialty,
      data.createdBy,
      now
    );
  }

  /**
   * Atualiza a avaliação inicial
   */
  update(
    updates: Partial<CreateAssessmentData>,
    updatedBy: TherapistId
  ): InitialAssessment {
    // Validar se a avaliação pode ser atualizada
    this.validateUpdatePermissions(updatedBy);

    const updatedData = {
      patientId: this.patientId,
      chiefComplaint: updates.chiefComplaint || this.chiefComplaint,
      medicalHistory: updates.medicalHistory || this.medicalHistory,
      physicalExam: updates.physicalExam || this.physicalExam,
      functionalTests: updates.functionalTests || this.functionalTests,
      diagnosis: updates.diagnosis || this.diagnosis,
      treatmentPlan: updates.treatmentPlan || this.treatmentPlan,
      goals: updates.goals || this.goals,
      specialty: updates.specialty || this.specialty,
      createdBy: this.createdBy
    };

    return new InitialAssessment(
      this.id,
      updatedData.patientId,
      updatedData.chiefComplaint,
      updatedData.medicalHistory,
      updatedData.physicalExam,
      updatedData.functionalTests,
      updatedData.diagnosis,
      updatedData.treatmentPlan,
      updatedData.goals,
      updatedData.specialty,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona um novo teste funcional
   */
  addFunctionalTest(test: FunctionalTest): InitialAssessment {
    this.validateFunctionalTest(test);

    const updatedTests = [...this.functionalTests, test];

    return new InitialAssessment(
      this.id,
      this.patientId,
      this.chiefComplaint,
      this.medicalHistory,
      this.physicalExam,
      updatedTests,
      this.diagnosis,
      this.treatmentPlan,
      this.goals,
      this.specialty,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona uma nova meta de tratamento
   */
  addTreatmentGoal(goal: TreatmentGoal): InitialAssessment {
    this.validateTreatmentGoal(goal);

    const updatedGoals = [...this.goals, goal];

    return new InitialAssessment(
      this.id,
      this.patientId,
      this.chiefComplaint,
      this.medicalHistory,
      this.physicalExam,
      this.functionalTests,
      this.diagnosis,
      this.treatmentPlan,
      updatedGoals,
      this.specialty,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Atualiza o diagnóstico fisioterapêutico
   */
  updateDiagnosis(diagnosis: PhysiotherapyDiagnosis): InitialAssessment {
    this.validateDiagnosis(diagnosis);

    return new InitialAssessment(
      this.id,
      this.patientId,
      this.chiefComplaint,
      this.medicalHistory,
      this.physicalExam,
      this.functionalTests,
      diagnosis,
      this.treatmentPlan,
      this.goals,
      this.specialty,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Atualiza o plano de tratamento
   */
  updateTreatmentPlan(plan: TreatmentPlan): InitialAssessment {
    this.validateTreatmentPlan(plan);

    return new InitialAssessment(
      this.id,
      this.patientId,
      this.chiefComplaint,
      this.medicalHistory,
      this.physicalExam,
      this.functionalTests,
      this.diagnosis,
      plan,
      this.goals,
      this.specialty,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Obtém resumo da avaliação
   */
  getSummary() {
    return {
      id: this.id,
      patientId: this.patientId,
      specialty: this.specialty,
      chiefComplaint: this.chiefComplaint.description,
      primaryDiagnosis: this.diagnosis.primaryDiagnosis,
      treatmentGoals: this.goals.length,
      functionalTests: this.functionalTests.length,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }

  /**
   * Obtém dados para relatório
   */
  getReportData() {
    return {
      assessment: this,
      summary: this.getSummary(),
      painAnalysis: this.analyzePain(),
      functionalAnalysis: this.analyzeFunctionalStatus(),
      riskFactors: this.identifyRiskFactors(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Analisa o padrão de dor
   */
  private analyzePain() {
    return {
      location: this.chiefComplaint.characteristics.location,
      intensity: this.chiefComplaint.characteristics.intensity,
      quality: this.chiefComplaint.characteristics.quality,
      pattern: this.chiefComplaint.characteristics.pattern,
      aggravatingFactors: this.chiefComplaint.aggravatingFactors,
      relievingFactors: this.chiefComplaint.relievingFactors
    };
  }

  /**
   * Analisa o status funcional
   */
  private analyzeFunctionalStatus() {
    return {
      rangeOfMotion: this.physicalExam.rangeOfMotion,
      muscleStrength: this.physicalExam.muscleStrength,
      functionalTests: this.functionalTests,
      limitations: this.identifyFunctionalLimitations()
    };
  }

  /**
   * Identifica fatores de risco
   */
  private identifyRiskFactors() {
    const riskFactors: string[] = [];

    // Analisar histórico médico
    if (this.medicalHistory.pastMedicalHistory.length > 3) {
      riskFactors.push('Múltiplas comorbidades');
    }

    // Analisar medicações
    if (this.medicalHistory.medications.length > 5) {
      riskFactors.push('Polifarmácia');
    }

    // Analisar sinais vitais
    if (this.physicalExam.vitalSigns) {
      const vs = this.physicalExam.vitalSigns;
      if (vs.bloodPressure && vs.bloodPressure.includes('140/90')) {
        riskFactors.push('Hipertensão arterial');
      }
      if (vs.heartRate && vs.heartRate > 100) {
        riskFactors.push('Taquicardia');
      }
    }

    // Analisar força muscular
    const weakMuscles = this.physicalExam.muscleStrength.upperExtremities
      .concat(this.physicalExam.muscleStrength.lowerExtremities)
      .filter(muscle => muscle.strength < 3);

    if (weakMuscles.length > 0) {
      riskFactors.push('Fraqueza muscular significativa');
    }

    return riskFactors;
  }

  /**
   * Identifica limitações funcionais
   */
  private identifyFunctionalLimitations() {
    const limitations: string[] = [];

    // Analisar amplitude de movimento
    const restrictedROM = this.physicalExam.rangeOfMotion.cervical
      .concat(this.physicalExam.rangeOfMotion.upperExtremities)
      .concat(this.physicalExam.rangeOfMotion.lowerExtremities)
      .filter(joint => 
        (joint.flexion && joint.flexion < 50) ||
        (joint.extension && joint.extension < 50)
      );

    if (restrictedROM.length > 0) {
      limitations.push('Amplitude de movimento restrita');
    }

    // Analisar testes funcionais
    const failedTests = this.functionalTests.filter(test => 
      test.result.toLowerCase().includes('limitado') ||
      test.result.toLowerCase().includes('dificuldade')
    );

    if (failedTests.length > 0) {
      limitations.push('Testes funcionais alterados');
    }

    return limitations;
  }

  /**
   * Gera recomendações baseadas na avaliação
   */
  private generateRecommendations() {
    const recommendations: string[] = [];

    // Recomendações baseadas no diagnóstico
    if (this.diagnosis.severity === 'severe') {
      recommendations.push('Tratamento intensivo recomendado');
    }

    // Recomendações baseadas nos fatores de risco
    const riskFactors = this.identifyRiskFactors();
    if (riskFactors.includes('Múltiplas comorbidades')) {
      recommendations.push('Acompanhamento multidisciplinar');
    }

    // Recomendações baseadas nas limitações funcionais
    const limitations = this.identifyFunctionalLimitations();
    if (limitations.includes('Amplitude de movimento restrita')) {
      recommendations.push('Foco em alongamento e mobilização');
    }

    return recommendations;
  }

  /**
   * Valida as invariantes da avaliação
   */
  private validateInvariants(): void {
    if (!this.id) {
      throw new DomainError(
        'Assessment ID is required',
        'INVALID_ID_ERROR',
        'id'
      );
    }

    if (!this.patientId) {
      throw new DomainError(
        'Patient ID is required',
        'INVALID_PATIENT_ID_ERROR',
        'patientId'
      );
    }

    if (!this.chiefComplaint) {
      throw new DomainError(
        'Chief complaint is required',
        'INVALID_CHIEF_COMPLAINT_ERROR',
        'chiefComplaint'
      );
    }

    if (!this.diagnosis) {
      throw new DomainError(
        'Diagnosis is required',
        'INVALID_DIAGNOSIS_ERROR',
        'diagnosis'
      );
    }

    if (!this.treatmentPlan) {
      throw new DomainError(
        'Treatment plan is required',
        'INVALID_TREATMENT_PLAN_ERROR',
        'treatmentPlan'
      );
    }

    if (!this.createdBy) {
      throw new DomainError(
        'Created by is required',
        'INVALID_CREATED_BY_ERROR',
        'createdBy'
      );
    }
  }

  /**
   * Valida dados de criação
   */
  private static validateCreateData(data: CreateAssessmentData): void {
    if (!data.patientId) {
      throw new ValidationError('Patient ID is required', 'patientId');
    }

    if (!data.chiefComplaint) {
      throw new ValidationError('Chief complaint is required', 'chiefComplaint');
    }

    if (!data.medicalHistory) {
      throw new ValidationError('Medical history is required', 'medicalHistory');
    }

    if (!data.physicalExam) {
      throw new ValidationError('Physical exam is required', 'physicalExam');
    }

    if (!data.diagnosis) {
      throw new ValidationError('Diagnosis is required', 'diagnosis');
    }

    if (!data.treatmentPlan) {
      throw new ValidationError('Treatment plan is required', 'treatmentPlan');
    }

    if (!data.createdBy) {
      throw new ValidationError('Created by is required', 'createdBy');
    }

    // Validar queixa principal
    this.validateChiefComplaint(data.chiefComplaint);

    // Validar exame físico
    this.validatePhysicalExam(data.physicalExam);

    // Validar diagnóstico
    this.validateDiagnosis(data.diagnosis);
  }

  /**
   * Valida queixa principal
   */
  private static validateChiefComplaint(complaint: ChiefComplaint): void {
    if (!complaint.description || complaint.description.trim().length === 0) {
      throw new ValidationError(
        'Chief complaint description is required',
        'chiefComplaint.description'
      );
    }

    if (complaint.description.length < 10) {
      throw new ValidationError(
        'Chief complaint description must be at least 10 characters',
        'chiefComplaint.description'
      );
    }

    if (!complaint.onset) {
      throw new ValidationError(
        'Pain onset date is required',
        'chiefComplaint.onset'
      );
    }

    if (!complaint.characteristics) {
      throw new ValidationError(
        'Pain characteristics are required',
        'chiefComplaint.characteristics'
      );
    }
  }

  /**
   * Valida exame físico
   */
  private static validatePhysicalExam(exam: PhysicalExam): void {
    if (!exam.inspection || exam.inspection.trim().length === 0) {
      throw new ValidationError(
        'Inspection findings are required',
        'physicalExam.inspection'
      );
    }

    if (!exam.palpation || exam.palpation.trim().length === 0) {
      throw new ValidationError(
        'Palpation findings are required',
        'physicalExam.palpation'
      );
    }

    if (!exam.rangeOfMotion) {
      throw new ValidationError(
        'Range of motion assessment is required',
        'physicalExam.rangeOfMotion'
      );
    }

    if (!exam.muscleStrength) {
      throw new ValidationError(
        'Muscle strength assessment is required',
        'physicalExam.muscleStrength'
      );
    }
  }

  /**
   * Valida diagnóstico
   */
  private static validateDiagnosis(diagnosis: PhysiotherapyDiagnosis): void {
    if (!diagnosis.primaryDiagnosis || diagnosis.primaryDiagnosis.trim().length === 0) {
      throw new ValidationError(
        'Primary diagnosis is required',
        'diagnosis.primaryDiagnosis'
      );
    }

    if (!diagnosis.severity) {
      throw new ValidationError(
        'Diagnosis severity is required',
        'diagnosis.severity'
      );
    }

    if (!['mild', 'moderate', 'severe'].includes(diagnosis.severity)) {
      throw new ValidationError(
        'Invalid diagnosis severity',
        'diagnosis.severity'
      );
    }
  }

  /**
   * Valida teste funcional
   */
  private validateFunctionalTest(test: FunctionalTest): void {
    if (!test.name || test.name.trim().length === 0) {
      throw new ValidationError(
        'Functional test name is required',
        'functionalTest.name'
      );
    }

    if (!test.result || test.result.trim().length === 0) {
      throw new ValidationError(
        'Functional test result is required',
        'functionalTest.result'
      );
    }
  }

  /**
   * Valida meta de tratamento
   */
  private validateTreatmentGoal(goal: TreatmentGoal): void {
    if (!goal.description || goal.description.trim().length === 0) {
      throw new ValidationError(
        'Treatment goal description is required',
        'treatmentGoal.description'
      );
    }

    if (!goal.targetDate) {
      throw new ValidationError(
        'Treatment goal target date is required',
        'treatmentGoal.targetDate'
      );
    }

    if (goal.targetDate < new Date()) {
      throw new ValidationError(
        'Treatment goal target date cannot be in the past',
        'treatmentGoal.targetDate'
      );
    }

    if (!goal.priority) {
      throw new ValidationError(
        'Treatment goal priority is required',
        'treatmentGoal.priority'
      );
    }

    if (!['high', 'medium', 'low'].includes(goal.priority)) {
      throw new ValidationError(
        'Invalid treatment goal priority',
        'treatmentGoal.priority'
      );
    }
  }

  /**
   * Valida plano de tratamento
   */
  private validateTreatmentPlan(plan: TreatmentPlan): void {
    if (!plan.goals || plan.goals.length === 0) {
      throw new ValidationError(
        'Treatment plan must have at least one goal',
        'treatmentPlan.goals'
      );
    }

    if (!plan.interventions || plan.interventions.length === 0) {
      throw new ValidationError(
        'Treatment plan must have at least one intervention',
        'treatmentPlan.interventions'
      );
    }

    if (!plan.frequency || plan.frequency.trim().length === 0) {
      throw new ValidationError(
        'Treatment frequency is required',
        'treatmentPlan.frequency'
      );
    }

    if (!plan.duration || plan.duration.trim().length === 0) {
      throw new ValidationError(
        'Treatment duration is required',
        'treatmentPlan.duration'
      );
    }
  }

  /**
   * Valida permissões de atualização
   */
  private validateUpdatePermissions(updatedBy: TherapistId): void {
    if (updatedBy !== this.createdBy) {
      throw new DomainError(
        'Only the creator can update the assessment',
        'UPDATE_PERMISSION_ERROR',
        'updatedBy'
      );
    }
  }

  /**
   * Gera um ID único para a avaliação
   */
  private static generateId(): AssessmentId {
    const crypto = require('crypto');
    return crypto.randomUUID();
  }

  /**
   * Reconstrói a avaliação a partir dos dados persistidos
   */
  static fromPersistence(data: {
    id: AssessmentId;
    patientId: PatientId;
    chiefComplaint: ChiefComplaint;
    medicalHistory: MedicalHistory;
    physicalExam: PhysicalExam;
    functionalTests: FunctionalTest[];
    diagnosis: PhysiotherapyDiagnosis;
    treatmentPlan: TreatmentPlan;
    goals: TreatmentGoal[];
    specialty: Specialty;
    createdBy: TherapistId;
    createdAt: Date;
  }): InitialAssessment {
    return new InitialAssessment(
      data.id,
      data.patientId,
      data.chiefComplaint,
      data.medicalHistory,
      data.physicalExam,
      data.functionalTests,
      data.diagnosis,
      data.treatmentPlan,
      data.goals,
      data.specialty,
      data.createdBy,
      data.createdAt
    );
  }

  /**
   * Converte a avaliação para dados de persistência
   */
  toPersistence() {
    return {
      id: this.id,
      patientId: this.patientId,
      chiefComplaint: this.chiefComplaint,
      medicalHistory: this.medicalHistory,
      physicalExam: this.physicalExam,
      functionalTests: this.functionalTests,
      diagnosis: this.diagnosis,
      treatmentPlan: this.treatmentPlan,
      goals: this.goals,
      specialty: this.specialty,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }
}
