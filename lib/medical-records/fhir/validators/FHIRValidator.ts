/**
 * Validador FHIR
 * Implementa validação rigorosa de recursos FHIR seguindo padrões HL7
 */

import { z } from 'zod';
import { FHIRPatientSchema } from '../resources/Patient';
import { FHIREncounterSchema } from '../resources/Encounter';
import { FHIRObservation } from '../resources/Observation';
import { FHIRDiagnosticReport } from '../resources/DiagnosticReport';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  details?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  details?: string;
}

export class FHIRValidator {
  private profiles: Map<string, z.ZodSchema> = new Map();
  private extensions: Map<string, z.ZodSchema> = new Map();

  constructor() {
    this.initializeProfiles();
    this.initializeExtensions();
  }

  /**
   * Inicializa os perfis FHIR padrão
   */
  private initializeProfiles(): void {
    this.profiles.set('Patient', FHIRPatientSchema);
    this.profiles.set('Encounter', FHIREncounterSchema);
    // Adicionar outros recursos conforme necessário
  }

  /**
   * Inicializa as extensões FHIR
   */
  private initializeExtensions(): void {
    // Extensões específicas do Brasil
    this.extensions.set('http://www.saude.gov.br/fhir/r4/StructureDefinition/BRPaciente', z.object({
      url: z.literal('http://www.saude.gov.br/fhir/r4/StructureDefinition/BRPaciente'),
      valueString: z.string().optional(),
      valueCodeableConcept: z.object({
        coding: z.array(z.object({
          system: z.string(),
          code: z.string(),
          display: z.string().optional()
        }))
      }).optional()
    }));

    // Extensões para dados clínicos
    this.extensions.set('http://www.saude.gov.br/fhir/r4/StructureDefinition/BRDadosClinicos', z.object({
      url: z.literal('http://www.saude.gov.br/fhir/r4/StructureDefinition/BRDadosClinicos'),
      valueString: z.string().optional(),
      valueCodeableConcept: z.object({
        coding: z.array(z.object({
          system: z.string(),
          code: z.string(),
          display: z.string().optional()
        }))
      }).optional()
    }));
  }

  /**
   * Valida um recurso FHIR
   */
  validate(resource: any, profile?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Validar estrutura básica do recurso
      this.validateBasicStructure(resource, errors, warnings);

      // Validar resourceType
      if (!resource.resourceType) {
        errors.push({
          path: 'resourceType',
          message: 'ResourceType is required',
          severity: 'error',
          code: 'REQUIRED_FIELD'
        });
        return { isValid: false, errors, warnings };
      }

      // Validar contra perfil específico se fornecido
      if (profile && this.profiles.has(profile)) {
        const schema = this.profiles.get(profile)!;
        try {
          schema.parse(resource);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
              errors.push({
                path: err.path.join('.'),
                message: err.message,
                severity: 'error',
                code: 'SCHEMA_VALIDATION_ERROR',
                details: `Expected: ${err.expected}, Received: ${err.received}`
              });
            });
          }
        }
      }

      // Validar regras de negócio específicas
      this.validateBusinessRules(resource, errors, warnings);

      // Validar extensões
      this.validateExtensions(resource, errors, warnings);

      // Validar conformidade com padrões brasileiros
      this.validateBrazilianStandards(resource, errors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        path: 'root',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'VALIDATION_EXCEPTION'
      });

      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Valida estrutura básica do recurso
   */
  private validateBasicStructure(resource: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!resource || typeof resource !== 'object') {
      errors.push({
        path: 'root',
        message: 'Resource must be an object',
        severity: 'error',
        code: 'INVALID_TYPE'
      });
      return;
    }

    // Validar campos obrigatórios básicos
    if (!resource.resourceType) {
      errors.push({
        path: 'resourceType',
        message: 'ResourceType is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar meta se presente
    if (resource.meta) {
      this.validateMeta(resource.meta, errors, warnings);
    }
  }

  /**
   * Valida metadados do recurso
   */
  private validateMeta(meta: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (meta.lastUpdated && !this.isValidISO8601(meta.lastUpdated)) {
      errors.push({
        path: 'meta.lastUpdated',
        message: 'lastUpdated must be a valid ISO 8601 date',
        severity: 'error',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    if (meta.versionId && !/^\d+$/.test(meta.versionId)) {
      errors.push({
        path: 'meta.versionId',
        message: 'versionId must be a positive integer',
        severity: 'error',
        code: 'INVALID_VERSION_ID'
      });
    }

    if (meta.profile && Array.isArray(meta.profile)) {
      meta.profile.forEach((profile: string, index: number) => {
        if (!this.isValidURL(profile)) {
          errors.push({
            path: `meta.profile[${index}]`,
            message: 'Profile must be a valid URL',
            severity: 'error',
            code: 'INVALID_URL'
          });
        }
      });
    }
  }

  /**
   * Valida regras de negócio específicas
   */
  private validateBusinessRules(resource: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    switch (resource.resourceType) {
      case 'Patient':
        this.validatePatientBusinessRules(resource, errors, warnings);
        break;
      case 'Encounter':
        this.validateEncounterBusinessRules(resource, errors, warnings);
        break;
      case 'Observation':
        this.validateObservationBusinessRules(resource, errors, warnings);
        break;
      case 'DiagnosticReport':
        this.validateDiagnosticReportBusinessRules(resource, errors, warnings);
        break;
      // Adicionar outros recursos conforme necessário
    }
  }

  /**
   * Valida regras de negócio para Patient
   */
  private validatePatientBusinessRules(patient: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar que pelo menos um nome seja fornecido
    if (!patient.name || patient.name.length === 0) {
      errors.push({
        path: 'name',
        message: 'At least one name must be provided',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar que pelo menos um identificador seja fornecido
    if (!patient.identifier || patient.identifier.length === 0) {
      warnings.push({
        path: 'identifier',
        message: 'At least one identifier is recommended',
        code: 'RECOMMENDED_FIELD'
      });
    }

    // Validar CPF se presente
    if (patient.identifier) {
      const cpf = patient.identifier.find((id: any) => 
        id.type?.coding?.[0]?.code === 'CPF'
      );
      
      if (cpf && !this.isValidCPF(cpf.value)) {
        errors.push({
          path: 'identifier',
          message: 'CPF is invalid',
          severity: 'error',
          code: 'INVALID_CPF'
        });
      }
    }

    // Validar data de nascimento
    if (patient.birthDate && !this.isValidDate(patient.birthDate)) {
      errors.push({
        path: 'birthDate',
        message: 'Birth date must be a valid date',
        severity: 'error',
        code: 'INVALID_DATE'
      });
    }

    // Validar email se presente
    if (patient.telecom) {
      const email = patient.telecom.find((t: any) => t.system === 'email');
      if (email && !this.isValidEmail(email.value)) {
        errors.push({
          path: 'telecom',
          message: 'Email is invalid',
          severity: 'error',
          code: 'INVALID_EMAIL'
        });
      }
    }
  }

  /**
   * Valida regras de negócio para Encounter
   */
  private validateEncounterBusinessRules(encounter: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar que pelo menos um participante seja fornecido
    if (!encounter.participant || encounter.participant.length === 0) {
      errors.push({
        path: 'participant',
        message: 'At least one participant must be provided',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar que o paciente seja referenciado
    if (!encounter.subject) {
      errors.push({
        path: 'subject',
        message: 'Subject (patient) must be referenced',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar período se presente
    if (encounter.period) {
      if (encounter.period.start && !this.isValidISO8601(encounter.period.start)) {
        errors.push({
          path: 'period.start',
          message: 'Start time must be a valid ISO 8601 date',
          severity: 'error',
          code: 'INVALID_DATE_FORMAT'
        });
      }

      if (encounter.period.end && !this.isValidISO8601(encounter.period.end)) {
        errors.push({
          path: 'period.end',
          message: 'End time must be a valid ISO 8601 date',
          severity: 'error',
          code: 'INVALID_DATE_FORMAT'
        });
      }

      // Validar que end seja posterior a start
      if (encounter.period.start && encounter.period.end) {
        const start = new Date(encounter.period.start);
        const end = new Date(encounter.period.end);
        
        if (end <= start) {
          errors.push({
            path: 'period',
            message: 'End time must be after start time',
            severity: 'error',
            code: 'INVALID_PERIOD'
          });
        }
      }
    }

    // Validar status
    const validStatuses = ['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown'];
    if (encounter.status && !validStatuses.includes(encounter.status)) {
      errors.push({
        path: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        severity: 'error',
        code: 'INVALID_STATUS'
      });
    }
  }

  /**
   * Valida extensões do recurso
   */
  private validateExtensions(resource: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (resource.extension) {
      resource.extension.forEach((ext: any, index: number) => {
        if (!ext.url) {
          errors.push({
            path: `extension[${index}]`,
            message: 'Extension URL is required',
            severity: 'error',
            code: 'REQUIRED_FIELD'
          });
          return;
        }

        // Validar extensão conhecida
        if (this.extensions.has(ext.url)) {
          const schema = this.extensions.get(ext.url)!;
          try {
            schema.parse(ext);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach(err => {
                errors.push({
                  path: `extension[${index}].${err.path.join('.')}`,
                  message: err.message,
                  severity: 'error',
                  code: 'EXTENSION_VALIDATION_ERROR'
                });
              });
            }
          }
        } else {
          warnings.push({
            path: `extension[${index}]`,
            message: `Unknown extension: ${ext.url}`,
            code: 'UNKNOWN_EXTENSION'
          });
        }
      });
    }
  }

  /**
   * Valida conformidade com padrões brasileiros
   */
  private validateBrazilianStandards(resource: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar identificadores brasileiros
    if (resource.identifier) {
      resource.identifier.forEach((id: any, index: number) => {
        if (id.type?.coding?.[0]?.system === 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador') {
          const code = id.type.coding[0].code;
          
          switch (code) {
            case 'CPF':
              if (!this.isValidCPF(id.value)) {
                errors.push({
                  path: `identifier[${index}].value`,
                  message: 'CPF is invalid',
                  severity: 'error',
                  code: 'INVALID_CPF'
                });
              }
              break;
            case 'CNS':
              if (!this.isValidCNS(id.value)) {
                errors.push({
                  path: `identifier[${index}].value`,
                  message: 'CNS is invalid',
                  severity: 'error',
                  code: 'INVALID_CNS'
                });
              }
              break;
          }
        }
      });
    }

    // Validar endereços brasileiros
    if (resource.address) {
      resource.address.forEach((addr: any, index: number) => {
        if (addr.country === 'BR' || !addr.country) {
          if (!addr.state) {
            warnings.push({
              path: `address[${index}].state`,
              message: 'State is recommended for Brazilian addresses',
              code: 'RECOMMENDED_FIELD'
            });
          }

          if (!addr.postalCode) {
            warnings.push({
              path: `address[${index}].postalCode`,
              message: 'Postal code is recommended for Brazilian addresses',
              code: 'RECOMMENDED_FIELD'
            });
          }
        }
      });
    }
  }

  /**
   * Valida se uma string é um CPF válido
   */
  private isValidCPF(cpf: string): boolean {
    if (!cpf) return false;
    
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  }

  /**
   * Valida se uma string é um CNS válido
   */
  private isValidCNS(cns: string): boolean {
    if (!cns) return false;
    
    // Remove caracteres não numéricos
    const cleanCNS = cns.replace(/\D/g, '');
    
    // Verifica se tem 15 dígitos
    if (cleanCNS.length !== 15) return false;
    
    // Validação do algoritmo do CNS
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      sum += parseInt(cleanCNS.charAt(i)) * (15 - i);
    }
    
    return sum % 11 === 0;
  }

  /**
   * Valida se uma string é um email válido
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se uma string é uma data válida
   */
  private isValidDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Valida se uma string é uma data ISO 8601 válida
   */
  private isValidISO8601(date: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(date) && this.isValidDate(date);
  }

  /**
   * Valida se uma string é uma URL válida
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida um bundle FHIR
   */
  validateBundle(bundle: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!bundle || bundle.resourceType !== 'Bundle') {
      errors.push({
        path: 'root',
        message: 'Bundle must have resourceType "Bundle"',
        severity: 'error',
        code: 'INVALID_RESOURCE_TYPE'
      });
      return { isValid: false, errors, warnings };
    }

    if (!bundle.entry || !Array.isArray(bundle.entry)) {
      errors.push({
        path: 'entry',
        message: 'Bundle must have an entry array',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
      return { isValid: false, errors, warnings };
    }

    // Validar cada entrada do bundle
    bundle.entry.forEach((entry: any, index: number) => {
      if (!entry.resource) {
        errors.push({
          path: `entry[${index}]`,
          message: 'Bundle entry must have a resource',
          severity: 'error',
          code: 'REQUIRED_FIELD'
        });
        return;
      }

      const resourceResult = this.validate(entry.resource);
      resourceResult.errors.forEach(error => {
        errors.push({
          ...error,
          path: `entry[${index}].${error.path}`
        });
      });
      resourceResult.warnings.forEach(warning => {
        warnings.push({
          ...warning,
          path: `entry[${index}].${warning.path}`
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida um conjunto de recursos
   */
  validateResources(resources: any[]): ValidationResult[] {
    return resources.map(resource => this.validate(resource));
  }

  /**
   * Obtém estatísticas de validação
   */
  getValidationStats(results: ValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    totalErrors: number;
    totalWarnings: number;
    errorTypes: Record<string, number>;
  } {
    const stats = {
      total: results.length,
      valid: 0,
      invalid: 0,
      totalErrors: 0,
      totalWarnings: 0,
      errorTypes: {} as Record<string, number>
    };

    results.forEach(result => {
      if (result.isValid) {
        stats.valid++;
      } else {
        stats.invalid++;
      }

      stats.totalErrors += result.errors.length;
      stats.totalWarnings += result.warnings.length;

      result.errors.forEach(error => {
        stats.errorTypes[error.code] = (stats.errorTypes[error.code] || 0) + 1;
      });
    });

    return stats;
  }

  /**
   * Valida regras de negócio para Observation
   */
  private validateObservationBusinessRules(observation: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar que o código seja fornecido
    if (!observation.code) {
      errors.push({
        path: 'code',
        message: 'Observation code is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar que o status seja válido
    const validStatuses = ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown'];
    if (observation.status && !validStatuses.includes(observation.status)) {
      errors.push({
        path: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        severity: 'error',
        code: 'INVALID_STATUS'
      });
    }

    // Validar que pelo menos um valor seja fornecido
    const hasValue = observation.valueQuantity || observation.valueCodeableConcept || 
                    observation.valueString || observation.valueBoolean || 
                    observation.valueInteger || observation.valueRange || 
                    observation.valueRatio || observation.valueSampledData || 
                    observation.valueTime || observation.valueDateTime || 
                    observation.valuePeriod;

    if (!hasValue && !observation.dataAbsentReason) {
      errors.push({
        path: 'value',
        message: 'Observation must have a value or dataAbsentReason',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar data efetiva
    if (observation.effectiveDateTime && !this.isValidISO8601(observation.effectiveDateTime)) {
      errors.push({
        path: 'effectiveDateTime',
        message: 'Effective date time must be a valid ISO 8601 date',
        severity: 'error',
        code: 'INVALID_DATE_FORMAT'
      });
    }
  }

  /**
   * Valida regras de negócio para DiagnosticReport
   */
  private validateDiagnosticReportBusinessRules(report: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar que o código seja fornecido
    if (!report.code) {
      errors.push({
        path: 'code',
        message: 'DiagnosticReport code is required',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validar que o status seja válido
    const validStatuses = ['registered', 'partial', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown'];
    if (report.status && !validStatuses.includes(report.status)) {
      errors.push({
        path: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        severity: 'error',
        code: 'INVALID_STATUS'
      });
    }

    // Validar que pelo menos um resultado seja fornecido para relatórios finais
    if (report.status === 'final' && (!report.result || report.result.length === 0)) {
      warnings.push({
        path: 'result',
        message: 'Final reports should have at least one result',
        code: 'RECOMMENDED_FIELD'
      });
    }

    // Validar data efetiva
    if (report.effectiveDateTime && !this.isValidISO8601(report.effectiveDateTime)) {
      errors.push({
        path: 'effectiveDateTime',
        message: 'Effective date time must be a valid ISO 8601 date',
        severity: 'error',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Validar data de emissão
    if (report.issued && !this.isValidISO8601(report.issued)) {
      errors.push({
        path: 'issued',
        message: 'Issued date must be a valid ISO 8601 date',
        severity: 'error',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Validar que pelo menos um performer seja fornecido
    if (!report.performer || report.performer.length === 0) {
      errors.push({
        path: 'performer',
        message: 'At least one performer must be provided',
        severity: 'error',
        code: 'REQUIRED_FIELD'
      });
    }
  }
}

