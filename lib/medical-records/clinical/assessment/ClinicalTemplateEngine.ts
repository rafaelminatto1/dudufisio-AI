/**
 * Sistema de Templates Clínicos Dinâmicos
 * Engine para geração e validação de templates clínicos por especialidade
 */

import {
  ClinicalTemplate,
  TemplateId,
  DocumentType,
  Specialty,
  TherapistId,
  TemplateSchema,
  TemplateField,
  TemplateSection,
  ValidationRule,
  DomainError,
  ValidationError
} from '../../../types/medical-records';

export class ClinicalTemplateEngine {
  private templates = new Map<string, ClinicalTemplate>();
  private repository: TemplateRepository;

  constructor(repository: TemplateRepository) {
    this.repository = repository;
    this.loadTemplates();
  }

  /**
   * Gera formulário de avaliação baseado na especialidade
   */
  async generateAssessmentForm(specialty: Specialty): Promise<AssessmentForm> {
    const template = this.templates.get(`assessment_${specialty}`);
    if (!template) {
      throw new TemplateNotFoundError(`No template for specialty: ${specialty}`);
    }

    return AssessmentForm.fromTemplate(template);
  }

  /**
   * Gera formulário de evolução baseado no tipo de sessão
   */
  async generateEvolutionForm(
    patientId: string,
    sessionType: string
  ): Promise<EvolutionForm> {
    const patientHistory = await this.repository.getPatientHistory(patientId);
    const template = this.templates.get(`evolution_${sessionType}`);

    if (!template) {
      throw new TemplateNotFoundError(`No template for session type: ${sessionType}`);
    }

    return EvolutionForm.fromTemplate(template, {
      previousSessions: patientHistory.sessions,
      currentTreatmentPlan: patientHistory.activeTreatmentPlan,
      bodyMapPoints: patientHistory.bodyMapPoints
    });
  }

  /**
   * Valida dados contra template
   */
  validateAgainstTemplate(
    template: ClinicalTemplate,
    data: Record<string, any>
  ): ValidationResult {
    const violations: ValidationViolation[] = [];

    for (const field of template.schema.fields) {
      const value = data[field.id];
      const fieldViolations = this.validateField(field, value);
      violations.push(...fieldViolations);
    }

    return new ValidationResult(violations.length === 0, violations);
  }

  /**
   * Cria um novo template
   */
  async createTemplate(
    name: string,
    type: DocumentType,
    specialty: Specialty,
    schema: TemplateSchema,
    createdBy: TherapistId
  ): Promise<ClinicalTemplate> {
    const template = new ClinicalTemplate(
      this.generateTemplateId(),
      name,
      type,
      specialty,
      schema,
      {},
      [],
      true,
      1,
      new Date(),
      createdBy
    );

    await this.repository.saveTemplate(template);
    this.templates.set(`${type}_${specialty}`, template);

    return template;
  }

  /**
   * Atualiza um template existente
   */
  async updateTemplate(
    templateId: TemplateId,
    updates: Partial<ClinicalTemplate>,
    updatedBy: TherapistId
  ): Promise<ClinicalTemplate> {
    const existingTemplate = await this.repository.getTemplate(templateId);
    if (!existingTemplate) {
      throw new TemplateNotFoundError(`Template not found: ${templateId}`);
    }

    const updatedTemplate = new ClinicalTemplate(
      existingTemplate.id,
      updates.name || existingTemplate.name,
      updates.type || existingTemplate.type,
      updates.specialty || existingTemplate.specialty,
      updates.schema || existingTemplate.schema,
      updates.defaultValues || existingTemplate.defaultValues,
      updates.validationRules || existingTemplate.validationRules,
      updates.active !== undefined ? updates.active : existingTemplate.active,
      existingTemplate.version + 1,
      existingTemplate.createdAt,
      existingTemplate.createdBy
    );

    await this.repository.saveTemplate(updatedTemplate);
    this.templates.set(`${updatedTemplate.type}_${updatedTemplate.specialty}`, updatedTemplate);

    return updatedTemplate;
  }

  /**
   * Carrega templates do repositório
   */
  private async loadTemplates(): Promise<void> {
    try {
      const templates = await this.repository.getAllTemplates();
      for (const template of templates) {
        if (template.active) {
          this.templates.set(`${template.type}_${template.specialty}`, template);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  /**
   * Valida um campo específico
   */
  private validateField(
    field: TemplateField,
    value: any
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    // Verificar se campo obrigatório está preenchido
    if (field.required && (value === undefined || value === null || value === '')) {
      violations.push(new ValidationViolation(
        'REQUIRED_FIELD',
        `Field '${field.label}' is required`,
        'high',
        field.id
      ));
      return violations; // Não validar mais se campo obrigatório está vazio
    }

    // Validar tipo de campo
    const typeViolations = this.validateFieldType(field, value);
    violations.push(...typeViolations);

    // Validar regras específicas
    if (field.validation) {
      for (const rule of field.validation) {
        const ruleViolations = this.validateRule(rule, value, field.id);
        violations.push(...ruleViolations);
      }
    }

    return violations;
  }

  /**
   * Valida tipo de campo
   */
  private validateFieldType(
    field: TemplateField,
    value: any
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    if (value === undefined || value === null) {
      return violations; // Já validado como obrigatório
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          violations.push(new ValidationViolation(
            'INVALID_TYPE',
            `Field '${field.label}' must be text`,
            'medium',
            field.id
          ));
        }
        break;

      case 'number':
        if (typeof value !== 'number' && !this.isNumeric(value)) {
          violations.push(new ValidationViolation(
            'INVALID_TYPE',
            `Field '${field.label}' must be a number`,
            'medium',
            field.id
          ));
        }
        break;

      case 'date':
        if (!this.isValidDate(value)) {
          violations.push(new ValidationViolation(
            'INVALID_TYPE',
            `Field '${field.label}' must be a valid date`,
            'medium',
            field.id
          ));
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(value)) {
          violations.push(new ValidationViolation(
            'INVALID_OPTION',
            `Field '${field.label}' must be one of: ${field.options.join(', ')}`,
            'medium',
            field.id
          ));
        }
        break;

      case 'checkbox':
        if (typeof value !== 'boolean') {
          violations.push(new ValidationViolation(
            'INVALID_TYPE',
            `Field '${field.label}' must be true or false`,
            'medium',
            field.id
          ));
        }
        break;

      case 'radio':
        if (field.options && !field.options.includes(value)) {
          violations.push(new ValidationViolation(
            'INVALID_OPTION',
            `Field '${field.label}' must be one of: ${field.options.join(', ')}`,
            'medium',
            field.id
          ));
        }
        break;
    }

    return violations;
  }

  /**
   * Valida regra específica
   */
  private validateRule(
    rule: ValidationRule,
    value: any,
    fieldId: string
  ): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    switch (rule.type) {
      case 'min':
        if (typeof value === 'string' && value.length < rule.value) {
          violations.push(new ValidationViolation(
            'MIN_LENGTH',
            rule.message,
            'medium',
            fieldId
          ));
        } else if (typeof value === 'number' && value < rule.value) {
          violations.push(new ValidationViolation(
            'MIN_VALUE',
            rule.message,
            'medium',
            fieldId
          ));
        }
        break;

      case 'max':
        if (typeof value === 'string' && value.length > rule.value) {
          violations.push(new ValidationViolation(
            'MAX_LENGTH',
            rule.message,
            'medium',
            fieldId
          ));
        } else if (typeof value === 'number' && value > rule.value) {
          violations.push(new ValidationViolation(
            'MAX_VALUE',
            rule.message,
            'medium',
            fieldId
          ));
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          violations.push(new ValidationViolation(
            'PATTERN_MISMATCH',
            rule.message,
            'medium',
            fieldId
          ));
        }
        break;

      case 'custom':
        // Implementar validações customizadas
        break;
    }

    return violations;
  }

  /**
   * Verifica se valor é numérico
   */
  private isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Verifica se valor é uma data válida
   */
  private isValidDate(value: any): boolean {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }

  /**
   * Gera ID único para template
   */
  private generateTemplateId(): TemplateId {
    const crypto = require('crypto');
    return crypto.randomUUID();
  }
}

/**
 * Formulário de avaliação gerado a partir de template
 */
export class AssessmentForm {
  constructor(
    public readonly template: ClinicalTemplate,
    public readonly fields: FormField[],
    public readonly sections: FormSection[]
  ) {}

  static fromTemplate(template: ClinicalTemplate): AssessmentForm {
    const fields = template.schema.fields.map(field => 
      new FormField(field, template.defaultValues[field.id])
    );

    const sections = template.schema.sections.map(section => 
      new FormSection(section, fields.filter(field => 
        section.fields.includes(field.id)
      ))
    );

    return new AssessmentForm(template, fields, sections);
  }

  /**
   * Valida dados do formulário
   */
  validate(data: Record<string, any>): ValidationResult {
    const violations: ValidationViolation[] = [];

    for (const field of this.fields) {
      const value = data[field.id];
      const fieldViolations = field.validate(value);
      violations.push(...fieldViolations);
    }

    return new ValidationResult(violations.length === 0, violations);
  }

  /**
   * Obtém dados do formulário
   */
  getData(): Record<string, any> {
    const data: Record<string, any> = {};
    for (const field of this.fields) {
      data[field.id] = field.value;
    }
    return data;
  }

  /**
   * Define valor de um campo
   */
  setFieldValue(fieldId: string, value: any): void {
    const field = this.fields.find(f => f.id === fieldId);
    if (field) {
      field.setValue(value);
    }
  }
}

/**
 * Formulário de evolução gerado a partir de template
 */
export class EvolutionForm {
  constructor(
    public readonly template: ClinicalTemplate,
    public readonly fields: FormField[],
    public readonly sections: FormSection[],
    public readonly context: EvolutionContext
  ) {}

  static fromTemplate(
    template: ClinicalTemplate,
    context: EvolutionContext
  ): EvolutionForm {
    const fields = template.schema.fields.map(field => {
      let defaultValue = template.defaultValues[field.id];
      
      // Aplicar contexto específico se disponível
      if (context.previousSessions.length > 0) {
        const lastSession = context.previousSessions[0];
        switch (field.id) {
          case 'pain_level_before':
            defaultValue = lastSession.painLevelAfter;
            break;
          case 'previous_treatment':
            defaultValue = lastSession.techniquesApplied.map(t => t.name).join(', ');
            break;
        }
      }

      return new FormField(field, defaultValue);
    });

    const sections = template.schema.sections.map(section => 
      new FormSection(section, fields.filter(field => 
        section.fields.includes(field.id)
      ))
    );

    return new EvolutionForm(template, fields, sections, context);
  }
}

/**
 * Campo de formulário
 */
export class FormField {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly label: string,
    public readonly required: boolean,
    public readonly options: string[],
    public readonly validation: ValidationRule[],
    public value: any
  ) {}

  static fromTemplateField(field: TemplateField, defaultValue?: any): FormField {
    return new FormField(
      field.id,
      field.type,
      field.label,
      field.required,
      field.options || [],
      field.validation || [],
      defaultValue
    );
  }

  setValue(value: any): void {
    this.value = value;
  }

  validate(value: any): ValidationViolation[] {
    const violations: ValidationViolation[] = [];

    if (this.required && (value === undefined || value === null || value === '')) {
      violations.push(new ValidationViolation(
        'REQUIRED_FIELD',
        `Field '${this.label}' is required`,
        'high',
        this.id
      ));
    }

    return violations;
  }
}

/**
 * Seção de formulário
 */
export class FormSection {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly fields: FormField[],
    public readonly order: number
  ) {}

  static fromTemplateSection(
    section: TemplateSection,
    fields: FormField[]
  ): FormSection {
    return new FormSection(
      section.id,
      section.title,
      fields,
      section.order
    );
  }
}

/**
 * Contexto para evolução
 */
export interface EvolutionContext {
  previousSessions: any[];
  currentTreatmentPlan: any;
  bodyMapPoints: any[];
}

/**
 * Resultado de validação
 */
export class ValidationResult {
  constructor(
    public readonly isValid: boolean,
    public readonly violations: ValidationViolation[]
  ) {}
}

/**
 * Violação de validação
 */
export class ValidationViolation {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical',
    public readonly field?: string
  ) {}
}

/**
 * Erro de template não encontrado
 */
export class TemplateNotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'TEMPLATE_NOT_FOUND_ERROR');
    this.name = 'TemplateNotFoundError';
  }
}

/**
 * Interface do repositório de templates
 */
export interface TemplateRepository {
  getTemplate(id: TemplateId): Promise<ClinicalTemplate | null>;
  getAllTemplates(): Promise<ClinicalTemplate[]>;
  saveTemplate(template: ClinicalTemplate): Promise<void>;
  getPatientHistory(patientId: string): Promise<any>;
}
