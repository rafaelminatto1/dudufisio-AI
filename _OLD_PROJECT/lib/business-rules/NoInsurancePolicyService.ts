/**
 * 🚫 NO INSURANCE POLICY SERVICE
 * 
 * Serviço para garantir que o sistema NUNCA atenderá convênios ou planos de saúde.
 * Esta é uma regra fundamental do negócio que deve ser aplicada em todas as operações.
 */

export interface BusinessRuleViolation {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: BusinessRuleViolation[];
}

export class NoInsurancePolicyService {
  private static readonly INSURANCE_KEYWORDS = [
    'convênio', 'convenio', 'plano de saúde', 'plano de saude', 'insurance',
    'health plan', 'health insurance', 'seguradora', 'operadora',
    'unimed', 'amil', 'bradesco saúde', 'sulamerica', 'hapvida',
    'notredame', 'intermédica', 'golden cross', 'sompo',
    'reembolso', 'autorização', 'cobertura', 'franquia'
  ];

  private static readonly FORBIDDEN_FIELDS = [
    'insurance_provider', 'insurance_plan', 'insurance_number',
    'insurance_validity', 'insurance_covered', 'insurance_authorization',
    'insurance_info', 'insurance_type', 'insurance_claim',
    'insurance_payment', 'insurance_provider_id', 'insurance_plan_id'
  ];

  /**
   * Valida se uma operação está em conformidade com a política anti-convênios
   */
  static validateNoInsurancePolicy(data: any, context: string): ValidationResult {
    const violations: BusinessRuleViolation[] = [];

    // Verificar campos proibidos
    violations.push(...this.checkForbiddenFields(data));

    // Verificar palavras-chave proibidas
    violations.push(...this.checkForbiddenKeywords(data));

    // Verificar tipos de pagamento proibidos
    violations.push(...this.checkForbiddenPaymentTypes(data));

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Verifica se existem campos relacionados a convênios
   */
  private static checkForbiddenFields(data: any): BusinessRuleViolation[] {
    const violations: BusinessRuleViolation[] = [];

    if (!data || typeof data !== 'object') {
      return violations;
    }

    for (const field of this.FORBIDDEN_FIELDS) {
      if (data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined) {
        violations.push({
          code: 'FORBIDDEN_INSURANCE_FIELD',
          message: `Campo '${field}' não é permitido. Sistema não atende convênios.`,
          severity: 'error',
          field
        });
      }
    }

    // Verificar recursivamente em objetos aninhados
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && data[key] !== null) {
        violations.push(...this.checkForbiddenFields(data[key]));
      }
    });

    return violations;
  }

  /**
   * Verifica se existem palavras-chave relacionadas a convênios
   */
  private static checkForbiddenKeywords(data: any): BusinessRuleViolation[] {
    const violations: BusinessRuleViolation[] = [];

    if (!data || typeof data !== 'object') {
      return violations;
    }

    const checkValue = (value: any, path: string = ''): void => {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const keyword of this.INSURANCE_KEYWORDS) {
          if (lowerValue.includes(keyword.toLowerCase())) {
            violations.push({
              code: 'FORBIDDEN_INSURANCE_KEYWORD',
              message: `Palavra-chave relacionada a convênios detectada: '${keyword}' em '${path}'. Sistema não atende convênios.`,
              severity: 'error',
              field: path
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(key => {
          checkValue(value[key], path ? `${path}.${key}` : key);
        });
      }
    };

    checkValue(data);

    return violations;
  }

  /**
   * Verifica se existem tipos de pagamento relacionados a convênios
   */
  private static checkForbiddenPaymentTypes(data: any): BusinessRuleViolation[] {
    const violations: BusinessRuleViolation[] = [];

    if (!data || typeof data !== 'object') {
      return violations;
    }

    const forbiddenPaymentTypes = ['insurance', 'insurance_claim', 'insurance_payment'];

    // Verificar em diferentes campos que podem conter tipo de pagamento
    const paymentFields = ['payment_method', 'payment_type', 'type', 'transaction_type'];

    for (const field of paymentFields) {
      if (data[field] && forbiddenPaymentTypes.includes(data[field])) {
        violations.push({
          code: 'FORBIDDEN_INSURANCE_PAYMENT',
          message: `Tipo de pagamento '${data[field]}' não é permitido. Sistema não atende convênios.`,
          severity: 'error',
          field
        });
      }
    }

    return violations;
  }

  /**
   * Valida dados de paciente para garantir que não há informações de convênio
   */
  static validatePatientData(patient: any): ValidationResult {
    return this.validateNoInsurancePolicy(patient, 'patient_registration');
  }

  /**
   * Valida dados de agendamento para garantir que não há referências a convênios
   */
  static validateAppointmentData(appointment: any): ValidationResult {
    return this.validateNoInsurancePolicy(appointment, 'appointment_booking');
  }

  /**
   * Valida dados de pagamento para garantir que não há tipos relacionados a convênios
   */
  static validatePaymentData(payment: any): ValidationResult {
    return this.validateNoInsurancePolicy(payment, 'payment_processing');
  }

  /**
   * Valida dados de transação financeira
   */
  static validateFinancialTransaction(transaction: any): ValidationResult {
    return this.validateNoInsurancePolicy(transaction, 'financial_transaction');
  }

  /**
   * Lança uma exceção se houver violações da política anti-convênios
   */
  static enforceNoInsurancePolicy(data: any, context: string): void {
    const validation = this.validateNoInsurancePolicy(data, context);

    if (!validation.isValid) {
      const errorMessage = validation.violations
        .map(v => v.message)
        .join('\n');

      throw new Error(`🚫 VIOLAÇÃO DA POLÍTICA ANTI-CONVÊNIOS:\n${errorMessage}\n\nEsta é uma regra fundamental do negócio que NÃO pode ser alterada.`);
    }
  }

  /**
   * Verifica se um texto contém referências a convênios
   */
  static containsInsuranceReference(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const lowerText = text.toLowerCase();
    return this.INSURANCE_KEYWORDS.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Remove ou substitui referências a convênios em um texto
   */
  static sanitizeInsuranceReferences(text: string): string {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let sanitized = text;
    
    for (const keyword of this.INSURANCE_KEYWORDS) {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '[REFERÊNCIA A CONVÊNIO REMOVIDA]');
    }

    return sanitized;
  }
}

/**
 * Decorator para aplicar automaticamente a validação anti-convênios
 */
export function NoInsurancePolicy(context: string = 'unknown') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Validar todos os argumentos
      args.forEach((arg, index) => {
        if (arg && typeof arg === 'object') {
          NoInsurancePolicyService.enforceNoInsurancePolicy(arg, `${context}.${propertyKey}.arg${index}`);
        }
      });

      // Executar método original
      const result = originalMethod.apply(this, args);

      // Se o resultado for uma Promise, validar também
      if (result && typeof result.then === 'function') {
        return result.then((resolvedResult: any) => {
          if (resolvedResult && typeof resolvedResult === 'object') {
            NoInsurancePolicyService.enforceNoInsurancePolicy(resolvedResult, `${context}.${propertyKey}.result`);
          }
          return resolvedResult;
        });
      }

      // Validar resultado síncrono
      if (result && typeof result === 'object') {
        NoInsurancePolicyService.enforceNoInsurancePolicy(result, `${context}.${propertyKey}.result`);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Hook para React que valida dados contra a política anti-convênios
 */
export function useNoInsurancePolicy() {
  return {
    validate: NoInsurancePolicyService.validateNoInsurancePolicy,
    enforce: NoInsurancePolicyService.enforceNoInsurancePolicy,
    containsInsurance: NoInsurancePolicyService.containsInsuranceReference,
    sanitize: NoInsurancePolicyService.sanitizeInsuranceReferences
  };
}
