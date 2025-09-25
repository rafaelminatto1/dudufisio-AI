/**
 * Entidade de Domínio: SessionEvolution
 * Representa a evolução de uma sessão de fisioterapia
 * Integrada com o sistema de mapa corporal
 */

import {
  EvolutionId,
  PatientId,
  TherapistId,
  SessionId,
  Technique,
  Exercise,
  BodyMapPoint,
  CreateEvolutionData,
  DomainError,
  ValidationError
} from '../../../types/medical-records';

export class SessionEvolution {
  private constructor(
    public readonly id: EvolutionId,
    public readonly patientId: PatientId,
    public readonly sessionId: SessionId,
    public readonly subjectiveAssessment: string,
    public readonly painLevelBefore: number,
    public readonly painLevelAfter: number,
    public readonly objectiveFindings: string,
    public readonly measurements: Record<string, any>,
    public readonly techniquesApplied: Technique[],
    public readonly exercisesPerformed: Exercise[],
    public readonly equipmentUsed: string[],
    public readonly patientResponse: string,
    public readonly adverseReactions?: string,
    public readonly nextSessionPlan: string,
    public readonly homeExercises: Exercise[],
    public readonly recommendations: string,
    public readonly bodyMapPoints: BodyMapPoint[],
    public readonly createdBy: TherapistId,
    public readonly createdAt: Date
  ) {
    this.validateInvariants();
  }

  /**
   * Cria uma nova evolução de sessão
   */
  static create(data: CreateEvolutionData): SessionEvolution {
    const id = this.generateId();
    const now = new Date();

    // Validar dados de entrada
    this.validateCreateData(data);

    return new SessionEvolution(
      id,
      data.patientId,
      data.sessionId,
      data.subjectiveAssessment,
      data.painLevelBefore,
      data.painLevelAfter,
      data.objectiveFindings,
      data.measurements,
      data.techniquesApplied,
      data.exercisesPerformed,
      data.equipmentUsed,
      data.patientResponse,
      data.adverseReactions,
      data.nextSessionPlan,
      data.homeExercises,
      data.recommendations,
      data.bodyMapPoints || [],
      data.createdBy,
      now
    );
  }

  /**
   * Atualiza a evolução da sessão
   */
  update(
    updates: Partial<CreateEvolutionData>,
    updatedBy: TherapistId
  ): SessionEvolution {
    // Validar se a evolução pode ser atualizada
    this.validateUpdatePermissions(updatedBy);

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      updates.subjectiveAssessment ?? this.subjectiveAssessment,
      updates.painLevelBefore ?? this.painLevelBefore,
      updates.painLevelAfter ?? this.painLevelAfter,
      updates.objectiveFindings ?? this.objectiveFindings,
      updates.measurements ?? this.measurements,
      updates.techniquesApplied ?? this.techniquesApplied,
      updates.exercisesPerformed ?? this.exercisesPerformed,
      updates.equipmentUsed ?? this.equipmentUsed,
      updates.patientResponse ?? this.patientResponse,
      updates.adverseReactions ?? this.adverseReactions,
      updates.nextSessionPlan ?? this.nextSessionPlan,
      updates.homeExercises ?? this.homeExercises,
      updates.recommendations ?? this.recommendations,
      updates.bodyMapPoints ?? this.bodyMapPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona uma nova técnica aplicada
   */
  addTechnique(technique: Technique): SessionEvolution {
    this.validateTechnique(technique);

    const updatedTechniques = [...this.techniquesApplied, technique];

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      this.subjectiveAssessment,
      this.painLevelBefore,
      this.painLevelAfter,
      this.objectiveFindings,
      this.measurements,
      updatedTechniques,
      this.exercisesPerformed,
      this.equipmentUsed,
      this.patientResponse,
      this.adverseReactions,
      this.nextSessionPlan,
      this.homeExercises,
      this.recommendations,
      this.bodyMapPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona um novo exercício realizado
   */
  addExercise(exercise: Exercise): SessionEvolution {
    this.validateExercise(exercise);

    const updatedExercises = [...this.exercisesPerformed, exercise];

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      this.subjectiveAssessment,
      this.painLevelBefore,
      this.painLevelAfter,
      this.objectiveFindings,
      this.measurements,
      this.techniquesApplied,
      updatedExercises,
      this.equipmentUsed,
      this.patientResponse,
      this.adverseReactions,
      this.nextSessionPlan,
      this.homeExercises,
      this.recommendations,
      this.bodyMapPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona um novo exercício para casa
   */
  addHomeExercise(exercise: Exercise): SessionEvolution {
    this.validateExercise(exercise);

    const updatedHomeExercises = [...this.homeExercises, exercise];

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      this.subjectiveAssessment,
      this.painLevelBefore,
      this.painLevelAfter,
      this.objectiveFindings,
      this.measurements,
      this.techniquesApplied,
      this.exercisesPerformed,
      this.equipmentUsed,
      this.patientResponse,
      this.adverseReactions,
      this.nextSessionPlan,
      updatedHomeExercises,
      this.recommendations,
      this.bodyMapPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Adiciona pontos do mapa corporal
   */
  addBodyMapPoints(points: BodyMapPoint[]): SessionEvolution {
    this.validateBodyMapPoints(points);

    const updatedPoints = [...this.bodyMapPoints, ...points];

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      this.subjectiveAssessment,
      this.painLevelBefore,
      this.painLevelAfter,
      this.objectiveFindings,
      this.measurements,
      this.techniquesApplied,
      this.exercisesPerformed,
      this.equipmentUsed,
      this.patientResponse,
      this.adverseReactions,
      this.nextSessionPlan,
      this.homeExercises,
      this.recommendations,
      updatedPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Atualiza o nível de dor
   */
  updatePainLevel(before: number, after: number): SessionEvolution {
    this.validatePainLevel(before);
    this.validatePainLevel(after);

    return new SessionEvolution(
      this.id,
      this.patientId,
      this.sessionId,
      this.subjectiveAssessment,
      before,
      after,
      this.objectiveFindings,
      this.measurements,
      this.techniquesApplied,
      this.exercisesPerformed,
      this.equipmentUsed,
      this.patientResponse,
      this.adverseReactions,
      this.nextSessionPlan,
      this.homeExercises,
      this.recommendations,
      this.bodyMapPoints,
      this.createdBy,
      this.createdAt
    );
  }

  /**
   * Calcula a melhoria da dor
   */
  calculatePainImprovement(): number {
    return this.painLevelBefore - this.painLevelAfter;
  }

  /**
   * Calcula a porcentagem de melhoria
   */
  calculatePainImprovementPercentage(): number {
    if (this.painLevelBefore === 0) return 0;
    return (this.calculatePainImprovement() / this.painLevelBefore) * 100;
  }

  /**
   * Obtém resumo da evolução
   */
  getSummary() {
    return {
      id: this.id,
      patientId: this.patientId,
      sessionId: this.sessionId,
      painLevelBefore: this.painLevelBefore,
      painLevelAfter: this.painLevelAfter,
      painImprovement: this.calculatePainImprovement(),
      painImprovementPercentage: this.calculatePainImprovementPercentage(),
      techniquesCount: this.techniquesApplied.length,
      exercisesCount: this.exercisesPerformed.length,
      homeExercisesCount: this.homeExercises.length,
      bodyMapPointsCount: this.bodyMapPoints.length,
      hasAdverseReactions: !!this.adverseReactions,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }

  /**
   * Obtém dados para análise
   */
  getAnalysisData() {
    return {
      evolution: this,
      summary: this.getSummary(),
      painAnalysis: this.analyzePain(),
      techniqueAnalysis: this.analyzeTechniques(),
      exerciseAnalysis: this.analyzeExercises(),
      bodyMapAnalysis: this.analyzeBodyMap(),
      effectiveness: this.assessEffectiveness()
    };
  }

  /**
   * Analisa o padrão de dor
   */
  private analyzePain() {
    const improvement = this.calculatePainImprovement();
    const improvementPercentage = this.calculatePainImprovementPercentage();

    let trend: 'improving' | 'stable' | 'worsening';
    if (improvement > 0) {
      trend = 'improving';
    } else if (improvement === 0) {
      trend = 'stable';
    } else {
      trend = 'worsening';
    }

    return {
      before: this.painLevelBefore,
      after: this.painLevelAfter,
      improvement,
      improvementPercentage,
      trend,
      significantImprovement: improvementPercentage >= 30,
      moderateImprovement: improvementPercentage >= 15 && improvementPercentage < 30,
      minimalImprovement: improvementPercentage > 0 && improvementPercentage < 15
    };
  }

  /**
   * Analisa as técnicas aplicadas
   */
  private analyzeTechniques() {
    const techniquesByType = this.techniquesApplied.reduce((acc, technique) => {
      const type = technique.name.split(' ')[0]; // Assumindo que o tipo é a primeira palavra
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDuration = this.techniquesApplied.reduce((total, technique) => {
      const duration = this.parseDuration(technique.duration);
      return total + duration;
    }, 0);

    return {
      totalTechniques: this.techniquesApplied.length,
      techniquesByType,
      totalDuration,
      averageDuration: this.techniquesApplied.length > 0 ? totalDuration / this.techniquesApplied.length : 0,
      mostUsedTechnique: this.getMostUsedTechnique()
    };
  }

  /**
   * Analisa os exercícios realizados
   */
  private analyzeExercises() {
    const exercisesByType = this.exercisesPerformed.reduce((acc, exercise) => {
      const type = exercise.name.split(' ')[0]; // Assumindo que o tipo é a primeira palavra
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRepetitions = this.exercisesPerformed.reduce((total, exercise) => {
      return total + (exercise.repetitions * exercise.sets);
    }, 0);

    return {
      totalExercises: this.exercisesPerformed.length,
      exercisesByType,
      totalRepetitions,
      averageRepetitions: this.exercisesPerformed.length > 0 ? totalRepetitions / this.exercisesPerformed.length : 0,
      mostUsedExercise: this.getMostUsedExercise()
    };
  }

  /**
   * Analisa o mapa corporal
   */
  private analyzeBodyMap() {
    if (this.bodyMapPoints.length === 0) {
      return {
        hasPoints: false,
        totalPoints: 0,
        averagePainLevel: 0,
        painDistribution: {},
        mostPainfulArea: null
      };
    }

    const averagePainLevel = this.bodyMapPoints.reduce((sum, point) => sum + point.painLevel, 0) / this.bodyMapPoints.length;

    const painDistribution = this.bodyMapPoints.reduce((acc, point) => {
      const area = this.getBodyArea(point.x, point.y);
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPainfulPoint = this.bodyMapPoints.reduce((max, point) => 
      point.painLevel > max.painLevel ? point : max
    );

    return {
      hasPoints: true,
      totalPoints: this.bodyMapPoints.length,
      averagePainLevel,
      painDistribution,
      mostPainfulArea: this.getBodyArea(mostPainfulPoint.x, mostPainfulPoint.y),
      highestPainLevel: mostPainfulPoint.painLevel
    };
  }

  /**
   * Avalia a efetividade da sessão
   */
  private assessEffectiveness() {
    const painAnalysis = this.analyzePain();
    const techniqueAnalysis = this.analyzeTechniques();
    const exerciseAnalysis = this.analyzeExercises();

    let effectivenessScore = 0;
    let effectivenessLevel: 'low' | 'medium' | 'high';

    // Pontuação baseada na melhoria da dor (0-40 pontos)
    if (painAnalysis.significantImprovement) {
      effectivenessScore += 40;
    } else if (painAnalysis.moderateImprovement) {
      effectivenessScore += 25;
    } else if (painAnalysis.minimalImprovement) {
      effectivenessScore += 10;
    }

    // Pontuação baseada no número de técnicas (0-20 pontos)
    if (techniqueAnalysis.totalTechniques >= 3) {
      effectivenessScore += 20;
    } else if (techniqueAnalysis.totalTechniques >= 2) {
      effectivenessScore += 15;
    } else if (techniqueAnalysis.totalTechniques >= 1) {
      effectivenessScore += 10;
    }

    // Pontuação baseada no número de exercícios (0-20 pontos)
    if (exerciseAnalysis.totalExercises >= 3) {
      effectivenessScore += 20;
    } else if (exerciseAnalysis.totalExercises >= 2) {
      effectivenessScore += 15;
    } else if (exerciseAnalysis.totalExercises >= 1) {
      effectivenessScore += 10;
    }

    // Pontuação baseada na resposta do paciente (0-20 pontos)
    if (this.patientResponse.toLowerCase().includes('melhor') || 
        this.patientResponse.toLowerCase().includes('alívio')) {
      effectivenessScore += 20;
    } else if (this.patientResponse.toLowerCase().includes('bom') || 
               this.patientResponse.toLowerCase().includes('positivo')) {
      effectivenessScore += 15;
    } else if (this.patientResponse.toLowerCase().includes('ok') || 
               this.patientResponse.toLowerCase().includes('normal')) {
      effectivenessScore += 10;
    }

    // Determinar nível de efetividade
    if (effectivenessScore >= 70) {
      effectivenessLevel = 'high';
    } else if (effectivenessScore >= 40) {
      effectivenessLevel = 'medium';
    } else {
      effectivenessLevel = 'low';
    }

    return {
      score: effectivenessScore,
      level: effectivenessLevel,
      factors: {
        painImprovement: painAnalysis.improvementPercentage,
        techniquesUsed: techniqueAnalysis.totalTechniques,
        exercisesPerformed: exerciseAnalysis.totalExercises,
        patientResponse: this.patientResponse
      }
    };
  }

  /**
   * Obtém a técnica mais utilizada
   */
  private getMostUsedTechnique(): string | null {
    if (this.techniquesApplied.length === 0) return null;

    const techniqueCounts = this.techniquesApplied.reduce((acc, technique) => {
      acc[technique.name] = (acc[technique.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(techniqueCounts).reduce((max, [name, count]) => 
      count > max.count ? { name, count } : max
    , { name: '', count: 0 }).name || null;
  }

  /**
   * Obtém o exercício mais utilizado
   */
  private getMostUsedExercise(): string | null {
    if (this.exercisesPerformed.length === 0) return null;

    const exerciseCounts = this.exercisesPerformed.reduce((acc, exercise) => {
      acc[exercise.name] = (acc[exercise.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(exerciseCounts).reduce((max, [name, count]) => 
      count > max.count ? { name, count } : max
    , { name: '', count: 0 }).name || null;
  }

  /**
   * Determina a área corporal baseada nas coordenadas
   */
  private getBodyArea(x: number, y: number): string {
    // Implementação simplificada - pode ser expandida
    if (y < 0.2) return 'head';
    if (y < 0.4) return 'neck';
    if (y < 0.6) return 'torso';
    if (y < 0.8) return 'pelvis';
    return 'legs';
  }

  /**
   * Converte duração em minutos
   */
  private parseDuration(duration: string): number {
    // Implementação simplificada - pode ser expandida
    const match = duration.match(/(\d+)\s*(min|minute|hour|h)/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes('hour') || unit === 'h') {
      return value * 60;
    }
    return value;
  }

  /**
   * Valida as invariantes da evolução
   */
  private validateInvariants(): void {
    if (!this.id) {
      throw new DomainError(
        'Evolution ID is required',
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

    if (!this.sessionId) {
      throw new DomainError(
        'Session ID is required',
        'INVALID_SESSION_ID_ERROR',
        'sessionId'
      );
    }

    if (!this.createdBy) {
      throw new DomainError(
        'Created by is required',
        'INVALID_CREATED_BY_ERROR',
        'createdBy'
      );
    }

    this.validatePainLevel(this.painLevelBefore);
    this.validatePainLevel(this.painLevelAfter);
  }

  /**
   * Valida dados de criação
   */
  private static validateCreateData(data: CreateEvolutionData): void {
    if (!data.patientId) {
      throw new ValidationError('Patient ID is required', 'patientId');
    }

    if (!data.sessionId) {
      throw new ValidationError('Session ID is required', 'sessionId');
    }

    if (!data.subjectiveAssessment) {
      throw new ValidationError('Subjective assessment is required', 'subjectiveAssessment');
    }

    if (!data.objectiveFindings) {
      throw new ValidationError('Objective findings are required', 'objectiveFindings');
    }

    if (!data.patientResponse) {
      throw new ValidationError('Patient response is required', 'patientResponse');
    }

    if (!data.nextSessionPlan) {
      throw new ValidationError('Next session plan is required', 'nextSessionPlan');
    }

    if (!data.createdBy) {
      throw new ValidationError('Created by is required', 'createdBy');
    }

    this.validatePainLevel(data.painLevelBefore);
    this.validatePainLevel(data.painLevelAfter);
  }

  /**
   * Valida nível de dor
   */
  private static validatePainLevel(level: number): void {
    if (level < 0 || level > 10) {
      throw new ValidationError(
        'Pain level must be between 0 and 10',
        'painLevel'
      );
    }
  }

  /**
   * Valida técnica
   */
  private validateTechnique(technique: Technique): void {
    if (!technique.name || technique.name.trim().length === 0) {
      throw new ValidationError(
        'Technique name is required',
        'technique.name'
      );
    }

    if (!technique.duration || technique.duration.trim().length === 0) {
      throw new ValidationError(
        'Technique duration is required',
        'technique.duration'
      );
    }
  }

  /**
   * Valida exercício
   */
  private validateExercise(exercise: Exercise): void {
    if (!exercise.name || exercise.name.trim().length === 0) {
      throw new ValidationError(
        'Exercise name is required',
        'exercise.name'
      );
    }

    if (!exercise.description || exercise.description.trim().length === 0) {
      throw new ValidationError(
        'Exercise description is required',
        'exercise.description'
      );
    }

    if (exercise.repetitions <= 0) {
      throw new ValidationError(
        'Exercise repetitions must be greater than 0',
        'exercise.repetitions'
      );
    }

    if (exercise.sets <= 0) {
      throw new ValidationError(
        'Exercise sets must be greater than 0',
        'exercise.sets'
      );
    }
  }

  /**
   * Valida pontos do mapa corporal
   */
  private validateBodyMapPoints(points: BodyMapPoint[]): void {
    for (const point of points) {
      if (!point.id || point.id.trim().length === 0) {
        throw new ValidationError(
          'Body map point ID is required',
          'bodyMapPoint.id'
        );
      }

      if (point.x < 0 || point.x > 1) {
        throw new ValidationError(
          'Body map point X coordinate must be between 0 and 1',
          'bodyMapPoint.x'
        );
      }

      if (point.y < 0 || point.y > 1) {
        throw new ValidationError(
          'Body map point Y coordinate must be between 0 and 1',
          'bodyMapPoint.y'
        );
      }

      if (point.painLevel < 0 || point.painLevel > 10) {
        throw new ValidationError(
          'Body map point pain level must be between 0 and 10',
          'bodyMapPoint.painLevel'
        );
      }
    }
  }

  /**
   * Valida permissões de atualização
   */
  private validateUpdatePermissions(updatedBy: TherapistId): void {
    if (updatedBy !== this.createdBy) {
      throw new DomainError(
        'Only the creator can update the evolution',
        'UPDATE_PERMISSION_ERROR',
        'updatedBy'
      );
    }
  }

  /**
   * Gera um ID único para a evolução
   */
  private static generateId(): EvolutionId {
    const crypto = require('crypto');
    return crypto.randomUUID();
  }

  /**
   * Reconstrói a evolução a partir dos dados persistidos
   */
  static fromPersistence(data: {
    id: EvolutionId;
    patientId: PatientId;
    sessionId: SessionId;
    subjectiveAssessment: string;
    painLevelBefore: number;
    painLevelAfter: number;
    objectiveFindings: string;
    measurements: Record<string, any>;
    techniquesApplied: Technique[];
    exercisesPerformed: Exercise[];
    equipmentUsed: string[];
    patientResponse: string;
    adverseReactions?: string;
    nextSessionPlan: string;
    homeExercises: Exercise[];
    recommendations: string;
    bodyMapPoints: BodyMapPoint[];
    createdBy: TherapistId;
    createdAt: Date;
  }): SessionEvolution {
    return new SessionEvolution(
      data.id,
      data.patientId,
      data.sessionId,
      data.subjectiveAssessment,
      data.painLevelBefore,
      data.painLevelAfter,
      data.objectiveFindings,
      data.measurements,
      data.techniquesApplied,
      data.exercisesPerformed,
      data.equipmentUsed,
      data.patientResponse,
      data.adverseReactions,
      data.nextSessionPlan,
      data.homeExercises,
      data.recommendations,
      data.bodyMapPoints,
      data.createdBy,
      data.createdAt
    );
  }

  /**
   * Converte a evolução para dados de persistência
   */
  toPersistence() {
    return {
      id: this.id,
      patientId: this.patientId,
      sessionId: this.sessionId,
      subjectiveAssessment: this.subjectiveAssessment,
      painLevelBefore: this.painLevelBefore,
      painLevelAfter: this.painLevelAfter,
      objectiveFindings: this.objectiveFindings,
      measurements: this.measurements,
      techniquesApplied: this.techniquesApplied,
      exercisesPerformed: this.exercisesPerformed,
      equipmentUsed: this.equipmentUsed,
      patientResponse: this.patientResponse,
      adverseReactions: this.adverseReactions,
      nextSessionPlan: this.nextSessionPlan,
      homeExercises: this.homeExercises,
      recommendations: this.recommendations,
      bodyMapPoints: this.bodyMapPoints,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }
}
