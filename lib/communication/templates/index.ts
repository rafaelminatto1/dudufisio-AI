// Communication Templates - Main Export File

// Template Engine
export { TemplateEngine, defaultTemplateEngineConfig } from './TemplateEngine';
export type { TemplateEngineConfig, TemplateRenderResult } from './TemplateEngine';

// Template Manager
export { TemplateManager, defaultTemplateManagerConfig } from './TemplateManager';
export type { TemplateManagerConfig } from './TemplateManager';

// Template utilities and helpers
import { MessageTemplate, TemplateContext, CommunicationChannel, MessageType } from '../../../types';

/**
 * Template validation utilities
 */
export class TemplateValidator {
  /**
   * Validate template structure and content
   */
  static validateTemplate(template: MessageTemplate): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.type) errors.push('Template type is required');
    if (!template.body) errors.push('Template body is required');

    // Template ID format
    if (template.id && !/^[a-z0-9_]+$/.test(template.id)) {
      errors.push('Template ID must contain only lowercase letters, numbers, and underscores');
    }

    // Body content checks
    if (template.body) {
      if (template.body.length > 10000) {
        warnings.push('Template body is very long and may cause performance issues');
      }

      // Check for unclosed Handlebars expressions
      const openBraces = (template.body.match(/\{\{/g) || []).length;
      const closeBraces = (template.body.match(/\}\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push('Unclosed Handlebars expressions in template body');
      }
    }

    // Subject checks
    if (template.subject) {
      if (template.subject.length > 200) {
        warnings.push('Subject line is very long and may be truncated');
      }
    }

    // Variables validation
    if (template.variables) {
      template.variables.forEach(variable => {
        if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(variable)) {
          warnings.push(`Variable name '${variable}' may cause issues`);
        }
      });
    }

    // Channel-specific validations
    if (template.sms && template.sms.length > 1600) {
      warnings.push('SMS template content is very long and may be split into multiple messages');
    }

    if (template.push && template.push.length > 300) {
      warnings.push('Push notification content is very long and may be truncated');
    }

    // Locale validation
    if (template.locale && !/^[a-z]{2}(-[A-Z]{2})?$/.test(template.locale)) {
      warnings.push('Locale format should be ISO 639-1 (e.g., "pt-BR")');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract all variables from template content
   */
  static extractVariables(template: MessageTemplate): string[] {
    const variables = new Set<string>();
    const contents = [
      template.body,
      template.subject,
      template.html,
      template.whatsapp,
      template.sms,
      template.email,
      template.push
    ].filter(Boolean);

    contents.forEach(content => {
      const matches = content!.match(/\{\{([^}]+)\}\}/g) || [];
      matches.forEach(match => {
        const variable = match.replace(/[{}]/g, '').trim();
        // Extract the root variable name
        const rootVar = variable.split(' ')[0].split('.')[0];
        if (rootVar && !rootVar.startsWith('#') && !rootVar.startsWith('/')) {
          variables.add(rootVar);
        }
      });
    });

    return Array.from(variables);
  }

  /**
   * Validate template context against template variables
   */
  static validateContext(template: MessageTemplate, context: TemplateContext): {
    valid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  } {
    const templateVariables = template.variables || this.extractVariables(template);
    const contextKeys = this.extractContextKeys(context);

    const missingVariables = templateVariables.filter(
      variable => !contextKeys.includes(variable)
    );

    const extraVariables = contextKeys.filter(
      key => !templateVariables.includes(key)
    );

    return {
      valid: missingVariables.length === 0,
      missingVariables,
      extraVariables
    };
  }

  /**
   * Extract all keys from context object
   */
  private static extractContextKeys(context: any, prefix = ''): string[] {
    const keys: string[] = [];

    Object.keys(context || {}).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof context[key] === 'object' && context[key] !== null && !Array.isArray(context[key])) {
        keys.push(key); // Add the parent key
        keys.push(...this.extractContextKeys(context[key], fullKey));
      } else {
        keys.push(key);
      }
    });

    return keys;
  }
}

/**
 * Template preview utilities
 */
export class TemplatePreview {
  /**
   * Generate preview data for template testing
   */
  static generatePreviewContext(templateType: MessageType): TemplateContext {
    const baseContext = {
      clinic: {
        name: 'DuduFisio - Clínica de Fisioterapia',
        phone: '(11) 1234-5678',
        email: 'contato@dudufisio.com',
        address: 'Rua da Fisioterapia, 123 - São Paulo, SP',
        website: 'https://dudufisio.com'
      }
    };

    switch (templateType) {
      case 'appointment_confirmation':
      case 'appointment_reminder':
      case 'appointment_cancellation':
        return {
          ...baseContext,
          patient: {
            id: 'preview-patient-1',
            name: 'João Silva',
            email: 'joao.silva@email.com',
            phone: '(11) 99999-9999',
            preferredName: 'João'
          },
          appointment: {
            id: 'preview-appointment-1',
            type: 'Fisioterapia Ortopédica',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            therapist: 'Dr. Maria Santos',
            location: 'Sala 1',
            notes: 'Trazer exames anteriores'
          }
        };

      case 'payment_reminder':
        return {
          ...baseContext,
          patient: {
            id: 'preview-patient-1',
            name: 'Maria Oliveira',
            email: 'maria.oliveira@email.com',
            phone: '(11) 88888-8888'
          },
          payment: {
            amount: 150.00,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            description: 'Consulta de Fisioterapia - 15/01/2024',
            invoiceNumber: 'INV-2024-001'
          }
        };

      case 'welcome':
        return {
          ...baseContext,
          patient: {
            id: 'preview-patient-1',
            name: 'Ana Costa',
            email: 'ana.costa@email.com',
            phone: '(11) 77777-7777'
          }
        };

      default:
        return {
          ...baseContext,
          recipient: {
            id: 'preview-recipient-1',
            name: 'Paciente Exemplo',
            email: 'exemplo@email.com',
            phone: '(11) 99999-9999'
          },
          message: 'Esta é uma mensagem de exemplo para preview do template.'
        };
    }
  }

  /**
   * Preview template for all channels
   */
  static async previewTemplate(
    template: MessageTemplate,
    templateEngine: any, // Would be properly typed in real implementation
    context?: TemplateContext
  ): Promise<Record<CommunicationChannel, any>> {
    const previewContext = context || this.generatePreviewContext(template.type);
    const channels: CommunicationChannel[] = ['email', 'whatsapp', 'sms', 'push'];
    const results: Record<string, any> = {};

    for (const channel of channels) {
      try {
        const result = await templateEngine.renderTemplate(
          template,
          previewContext,
          {
            channel,
            locale: template.locale || 'pt-BR',
            device: 'desktop',
            timezone: 'America/Sao_Paulo'
          }
        );

        results[channel] = result;
      } catch (error) {
        results[channel] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results as Record<CommunicationChannel, any>;
  }
}

/**
 * Template migration utilities
 */
export class TemplateMigration {
  /**
   * Migrate template from old version to new version
   */
  static migrateTemplate(oldTemplate: any, targetVersion: number): MessageTemplate {
    const migrated = { ...oldTemplate };

    // Migration from version 0 to 1
    if (!migrated.version || migrated.version < 1) {
      // Add default values for new fields
      migrated.isActive = migrated.isActive !== false;
      migrated.category = migrated.category || 'general';
      migrated.variables = migrated.variables || [];
      migrated.version = 1;
    }

    // Future migrations would go here
    // if (migrated.version < 2) { ... }

    return migrated as MessageTemplate;
  }

  /**
   * Check if template needs migration
   */
  static needsMigration(template: any, currentVersion: number): boolean {
    return !template.version || template.version < currentVersion;
  }
}

/**
 * Template performance utilities
 */
export class TemplatePerformance {
  /**
   * Analyze template complexity
   */
  static analyzeComplexity(template: MessageTemplate): {
    score: number;
    factors: string[];
    recommendations: string[];
  } {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Content length
    const contentLength = (template.body || '').length;
    if (contentLength > 5000) {
      score += 30;
      factors.push('Very long content');
      recommendations.push('Consider breaking down into smaller templates');
    } else if (contentLength > 2000) {
      score += 15;
      factors.push('Long content');
    }

    // Number of variables
    const variables = TemplateValidator.extractVariables(template);
    if (variables.length > 20) {
      score += 20;
      factors.push('Many variables');
      recommendations.push('Consider reducing number of variables');
    } else if (variables.length > 10) {
      score += 10;
      factors.push('Several variables');
    }

    // Complex expressions
    const complexExpressions = (template.body.match(/\{\{#.*?\}\}/g) || []).length;
    if (complexExpressions > 10) {
      score += 25;
      factors.push('Many conditional expressions');
      recommendations.push('Simplify conditional logic');
    } else if (complexExpressions > 5) {
      score += 10;
      factors.push('Some conditional expressions');
    }

    // HTML content
    if (template.html && template.html.length > template.body.length * 2) {
      score += 15;
      factors.push('Complex HTML structure');
      recommendations.push('Optimize HTML content');
    }

    // Multiple channel variants
    const channelVariants = [
      template.whatsapp,
      template.sms,
      template.email,
      template.push
    ].filter(Boolean).length;

    if (channelVariants > 3) {
      score += 10;
      factors.push('Multiple channel variants');
    }

    return {
      score: Math.min(score, 100),
      factors,
      recommendations
    };
  }
}

/**
 * Default template configurations for common use cases
 */
export const defaultTemplateConfigs = {
  appointment: {
    confirmation: {
      enablePersonalization: true,
      channels: ['email', 'whatsapp', 'sms'] as CommunicationChannel[],
      priority: 'high',
      enableTracking: true
    },
    reminder: {
      enablePersonalization: true,
      channels: ['push', 'whatsapp', 'sms'] as CommunicationChannel[],
      priority: 'high',
      timing: '24h_before'
    },
    cancellation: {
      enablePersonalization: false,
      channels: ['email', 'whatsapp', 'sms'] as CommunicationChannel[],
      priority: 'urgent',
      enableRefundInfo: true
    }
  },
  marketing: {
    newsletter: {
      enablePersonalization: true,
      channels: ['email'] as CommunicationChannel[],
      priority: 'low',
      enableUnsubscribe: true
    },
    promotion: {
      enablePersonalization: true,
      channels: ['email', 'whatsapp'] as CommunicationChannel[],
      priority: 'medium',
      enableExpiryDate: true
    }
  },
  system: {
    welcome: {
      enablePersonalization: true,
      channels: ['email', 'whatsapp'] as CommunicationChannel[],
      priority: 'medium',
      enableGettingStarted: true
    },
    passwordReset: {
      enablePersonalization: false,
      channels: ['email'] as CommunicationChannel[],
      priority: 'urgent',
      expiryTime: '1h'
    }
  }
};

/**
 * Helper function to create template context for different scenarios
 */
export function createTemplateContext(
  type: 'appointment' | 'payment' | 'marketing' | 'system',
  data: Record<string, any>
): TemplateContext {
  const baseContext = {
    clinic: {
      name: 'DuduFisio - Clínica de Fisioterapia',
      phone: '(11) 1234-5678',
      email: 'contato@dudufisio.com',
      address: 'São Paulo, SP'
    }
  };

  switch (type) {
    case 'appointment':
      return {
        ...baseContext,
        patient: data.patient,
        appointment: data.appointment,
        therapist: data.therapist
      };

    case 'payment':
      return {
        ...baseContext,
        patient: data.patient,
        payment: data.payment,
        invoice: data.invoice
      };

    case 'marketing':
      return {
        ...baseContext,
        recipient: data.recipient,
        campaign: data.campaign,
        offer: data.offer
      };

    case 'system':
      return {
        ...baseContext,
        user: data.user,
        system: data.system
      };

    default:
      return {
        ...baseContext,
        ...data
      };
  }
}