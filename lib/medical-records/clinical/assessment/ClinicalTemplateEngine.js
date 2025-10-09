/**
 * Sistema de Templates Clínicos Dinâmicos
 * Engine para geração e validação de templates clínicos por especialidade
 */
import { DomainError } from '../../../../types/medical-records';
export class ClinicalTemplateEngine {
    constructor(repository) {
        this.templates = new Map();
        this.repository = repository;
        this.loadTemplates();
    }
    /**
     * Gera formulário de avaliação baseado na especialidade
     */
    async generateAssessmentForm(specialty) {
        const template = this.templates.get(`assessment_${specialty}`);
        if (!template) {
            throw new TemplateNotFoundError(`No template for specialty: ${specialty}`);
        }
        return AssessmentForm.fromTemplate(template);
    }
    /**
     * Gera formulário de evolução baseado no tipo de sessão
     */
    async generateEvolutionForm(patientId, sessionType) {
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
    validateAgainstTemplate(template, data) {
        const violations = [];
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
    async createTemplate(name, type, specialty, schema, createdBy) {
        const template = {
            id: this.generateTemplateId(),
            name,
            type,
            specialty,
            schema,
            templateSchema: schema,
            defaultValues: {},
            validationRules: [],
            active: true,
            version: 1,
            createdAt: new Date(),
            createdBy: createdBy
        };
        await this.repository.saveTemplate(template);
        this.templates.set(`${type}_${specialty}`, template);
        return template;
    }
    /**
     * Atualiza um template existente
     */
    async updateTemplate(templateId, updates, updatedBy) {
        const existingTemplate = await this.repository.getTemplate(templateId);
        if (!existingTemplate) {
            throw new TemplateNotFoundError(`Template not found: ${templateId}`);
        }
        const updatedTemplate = {
            id: existingTemplate.id,
            name: updates.name || existingTemplate.name,
            type: updates.type || existingTemplate.type,
            specialty: updates.specialty || existingTemplate.specialty,
            schema: updates.schema || existingTemplate.schema,
            templateSchema: updates.schema || existingTemplate.schema,
            defaultValues: updates.defaultValues || existingTemplate.defaultValues,
            validationRules: updates.validationRules || existingTemplate.validationRules,
            active: updates.active !== undefined ? updates.active : existingTemplate.active,
            version: existingTemplate.version + 1,
            createdAt: existingTemplate.createdAt,
            createdBy: existingTemplate.createdBy
        };
        await this.repository.saveTemplate(updatedTemplate);
        this.templates.set(`${updatedTemplate.type}_${updatedTemplate.specialty}`, updatedTemplate);
        return updatedTemplate;
    }
    /**
     * Carrega templates do repositório
     */
    async loadTemplates() {
        try {
            const templates = await this.repository.getAllTemplates();
            for (const template of templates) {
                if (template.active) {
                    this.templates.set(`${template.type}_${template.specialty}`, template);
                }
            }
        }
        catch (error) {
            console.error('Error loading templates:', error);
        }
    }
    /**
     * Valida um campo específico
     */
    validateField(field, value) {
        const violations = [];
        // Verificar se campo obrigatório está preenchido
        if (field.required && (value === undefined || value === null || value === '')) {
            violations.push(new ValidationViolation('REQUIRED_FIELD', `Field '${field.label}' is required`, 'high', field.id));
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
    validateFieldType(field, value) {
        const violations = [];
        if (value === undefined || value === null) {
            return violations; // Já validado como obrigatório
        }
        switch (field.type) {
            case 'text':
            case 'textarea':
                if (typeof value !== 'string') {
                    violations.push(new ValidationViolation('INVALID_TYPE', `Field '${field.label}' must be text`, 'medium', field.id));
                }
                break;
            case 'number':
                if (typeof value !== 'number' && !this.isNumeric(value)) {
                    violations.push(new ValidationViolation('INVALID_TYPE', `Field '${field.label}' must be a number`, 'medium', field.id));
                }
                break;
            case 'date':
                if (!this.isValidDate(value)) {
                    violations.push(new ValidationViolation('INVALID_TYPE', `Field '${field.label}' must be a valid date`, 'medium', field.id));
                }
                break;
            case 'select':
                if (field.options && !field.options.includes(value)) {
                    violations.push(new ValidationViolation('INVALID_OPTION', `Field '${field.label}' must be one of: ${field.options.join(', ')}`, 'medium', field.id));
                }
                break;
            case 'checkbox':
                if (typeof value !== 'boolean') {
                    violations.push(new ValidationViolation('INVALID_TYPE', `Field '${field.label}' must be true or false`, 'medium', field.id));
                }
                break;
            case 'radio':
                if (field.options && !field.options.includes(value)) {
                    violations.push(new ValidationViolation('INVALID_OPTION', `Field '${field.label}' must be one of: ${field.options.join(', ')}`, 'medium', field.id));
                }
                break;
        }
        return violations;
    }
    /**
     * Valida regra específica
     */
    validateRule(rule, value, fieldId) {
        const violations = [];
        switch (rule.type) {
            case 'min':
                if (typeof value === 'string' && value.length < rule.value) {
                    violations.push(new ValidationViolation('MIN_LENGTH', rule.message, 'medium', fieldId));
                }
                else if (typeof value === 'number' && value < rule.value) {
                    violations.push(new ValidationViolation('MIN_VALUE', rule.message, 'medium', fieldId));
                }
                break;
            case 'max':
                if (typeof value === 'string' && value.length > rule.value) {
                    violations.push(new ValidationViolation('MAX_LENGTH', rule.message, 'medium', fieldId));
                }
                else if (typeof value === 'number' && value > rule.value) {
                    violations.push(new ValidationViolation('MAX_VALUE', rule.message, 'medium', fieldId));
                }
                break;
            case 'pattern':
                if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
                    violations.push(new ValidationViolation('PATTERN_MISMATCH', rule.message, 'medium', fieldId));
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
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    /**
     * Verifica se valor é uma data válida
     */
    isValidDate(value) {
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
    generateTemplateId() {
        const crypto = require('crypto');
        return crypto.randomUUID();
    }
}
/**
 * Formulário de avaliação gerado a partir de template
 */
export class AssessmentForm {
    constructor(template, fields, sections) {
        this.template = template;
        this.fields = fields;
        this.sections = sections;
    }
    static fromTemplate(template) {
        const fields = template.schema.fields.map((field) => FormField.fromTemplateField(field, template.defaultValues[field.id]));
        const sections = template.schema.sections.map((section) => FormSection.fromTemplateSection(section, fields.filter((field) => section.fields.includes(field.id))));
        return new AssessmentForm(template, fields, sections);
    }
    /**
     * Valida dados do formulário
     */
    validate(data) {
        const violations = [];
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
    getData() {
        const data = {};
        for (const field of this.fields) {
            data[field.id] = field.value;
        }
        return data;
    }
    /**
     * Define valor de um campo
     */
    setFieldValue(fieldId, value) {
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
    constructor(template, fields, sections, context) {
        this.template = template;
        this.fields = fields;
        this.sections = sections;
        this.context = context;
    }
    static fromTemplate(template, context) {
        const fields = template.schema.fields.map((field) => {
            let defaultValue = template.defaultValues[field.id];
            // Aplicar contexto específico se disponível
            if (context.previousSessions.length > 0) {
                const lastSession = context.previousSessions[0];
                switch (field.id) {
                    case 'pain_level_before':
                        defaultValue = lastSession.painLevelAfter;
                        break;
                    case 'previous_treatment':
                        defaultValue = lastSession.techniquesApplied.map((t) => t.name).join(', ');
                        break;
                }
            }
            return FormField.fromTemplateField(field, defaultValue);
        });
        const sections = template.schema.sections.map((section) => FormSection.fromTemplateSection(section, fields.filter((field) => section.fields.includes(field.id))));
        return new EvolutionForm(template, fields, sections, context);
    }
}
/**
 * Campo de formulário
 */
export class FormField {
    constructor(id, type, label, required, options, validation, value) {
        this.id = id;
        this.type = type;
        this.label = label;
        this.required = required;
        this.options = options;
        this.validation = validation;
        this.value = value;
    }
    static fromTemplateField(field, defaultValue) {
        return new FormField(field.id, field.type, field.label, field.required, field.options || [], field.validation || [], defaultValue);
    }
    setValue(value) {
        this.value = value;
    }
    validate(value) {
        const violations = [];
        if (this.required && (value === undefined || value === null || value === '')) {
            violations.push(new ValidationViolation('REQUIRED_FIELD', `Field '${this.label}' is required`, 'high', this.id));
        }
        return violations;
    }
}
/**
 * Seção de formulário
 */
export class FormSection {
    constructor(id, title, fields, order) {
        this.id = id;
        this.title = title;
        this.fields = fields;
        this.order = order;
    }
    static fromTemplateSection(section, fields) {
        return new FormSection(section.id, section.title, fields, section.order);
    }
}
/**
 * Resultado de validação
 */
export class ValidationResult {
    constructor(isValid, violations) {
        this.isValid = isValid;
        this.violations = violations;
    }
}
/**
 * Violação de validação
 */
export class ValidationViolation {
    constructor(code, message, severity, field) {
        this.code = code;
        this.message = message;
        this.severity = severity;
        this.field = field;
    }
}
/**
 * Erro de template não encontrado
 */
export class TemplateNotFoundError extends DomainError {
    constructor(message) {
        super(message, 'TEMPLATE_NOT_FOUND_ERROR');
        this.name = 'TemplateNotFoundError';
    }
}
