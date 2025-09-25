// Template Manager - High-level template management and operations

import {
  MessageTemplate,
  TemplateContext,
  CommunicationChannel,
  Appointment,
  Patient,
  MessageType
} from '../../../types';
import { TemplateEngine, TemplateRenderResult, TemplateEngineConfig } from './TemplateEngine';
import {
  CommunicationError,
  TemplateNotFoundError,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector
} from '../core/types';

/**
 * Template Manager Configuration
 */
export interface TemplateManagerConfig {
  engine: TemplateEngineConfig;
  enableVersioning: boolean;
  enableA11y: boolean; // Accessibility features
  enablePersonalization: boolean;
  defaultTemplateSet: string;
  fallbackLanguage: string;
}

/**
 * Template Context Builder Options
 */
interface ContextBuilderOptions {
  locale?: string;
  timezone?: string;
  device?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  personalization?: Record<string, any>;
  experiment?: {
    id: string;
    variant: string;
  };
}

/**
 * Template Selection Criteria
 */
interface TemplateSelectionCriteria {
  type: MessageType;
  channel: CommunicationChannel;
  locale?: string;
  audience?: 'patient' | 'therapist' | 'admin';
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  context?: 'appointment' | 'reminder' | 'confirmation' | 'cancellation' | 'general';
}

/**
 * Built-in Template Definitions
 */
const BUILT_IN_TEMPLATES: Record<string, MessageTemplate> = {
  // Appointment Templates
  'appointment_confirmation': {
    id: 'appointment_confirmation',
    name: 'Confirmação de Consulta',
    type: 'appointment_confirmation',
    category: 'appointment',
    subject: 'Confirmação de Consulta - {{appointment.type}}',
    body: `Olá {{patient.name}},

Sua consulta foi confirmada com sucesso!

📅 **Detalhes da Consulta:**
• Tipo: {{appointment.type}}
• Data: {{formatDate appointment.date "dd/MM/yyyy"}}
• Horário: {{formatDate appointment.date "HH:mm"}}
• Terapeuta: {{appointment.therapist}}
{{#if appointment.location}}• Local: {{appointment.location}}{{/if}}

{{#if appointment.notes}}
📝 **Observações:** {{appointment.notes}}
{{/if}}

Para cancelar ou reagendar, entre em contato conosco.

Atenciosamente,
{{clinic.name}}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmação de Consulta</title>
</head>
<body>
  {{> header}}

  <div style="padding: 30px;">
    <h2 style="color: #0066cc;">Olá {{patient.name}}!</h2>

    <p>Sua consulta foi confirmada com sucesso!</p>

    {{> appointmentCard}}

    {{#if appointment.notes}}
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <strong>Observações:</strong> {{appointment.notes}}
    </div>
    {{/if}}

    <p style="margin-top: 30px;">
      Para cancelar ou reagendar, entre em contato conosco através do telefone {{clinic.phone}} ou WhatsApp.
    </p>
  </div>

  {{> footer}}
</body>
</html>`,
    whatsapp: `🏥 *{{clinic.name}}*

Olá *{{patient.name}}*!

✅ Sua consulta foi confirmada:

📅 *{{formatDate appointment.date "dd/MM/yyyy"}}* às *{{formatDate appointment.date "HH:mm"}}*
👨‍⚕️ {{appointment.therapist}}
🏥 {{appointment.type}}
{{#if appointment.location}}📍 {{appointment.location}}{{/if}}

{{#if appointment.notes}}
📝 *Observações:* {{appointment.notes}}
{{/if}}

Para cancelar ou reagendar, responda esta mensagem.`,
    sms: `{{clinic.name}}: Consulta confirmada para {{formatDate appointment.date "dd/MM HH:mm"}} com {{appointment.therapist}}. {{appointment.type}}. Para cancelar ligue {{clinic.phone}}`,
    push: `Consulta confirmada para {{formatDate appointment.date "dd/MM"}} às {{formatDate appointment.date "HH:mm"}}`,
    variables: ['patient', 'appointment', 'clinic'],
    locale: 'pt-BR',
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'appointment_reminder': {
    id: 'appointment_reminder',
    name: 'Lembrete de Consulta',
    type: 'appointment_reminder',
    category: 'appointment',
    subject: 'Lembrete: Consulta amanhã - {{appointment.type}}',
    body: `Olá {{patient.name}},

Este é um lembrete sobre sua consulta agendada para amanhã.

📅 **Detalhes:**
• Data: {{formatDate appointment.date "dd/MM/yyyy"}}
• Horário: {{formatDate appointment.date "HH:mm"}}
• Terapeuta: {{appointment.therapist}}
• Tipo: {{appointment.type}}

Por favor, chegue 10 minutos antes do horário marcado.

Se não puder comparecer, entre em contato conosco com antecedência.

{{clinic.name}}`,
    whatsapp: `🔔 *Lembrete de Consulta*

Olá {{patient.name}}!

Sua consulta é *amanhã*:
📅 {{formatDate appointment.date "dd/MM"}} às {{formatDate appointment.date "HH:mm"}}
👨‍⚕️ {{appointment.therapist}}

Por favor, chegue 10 min antes.

{{clinic.name}}`,
    sms: `Lembrete {{clinic.name}}: Consulta amanha {{formatDate appointment.date "dd/MM HH:mm"}} com {{appointment.therapist}}. Chegue 10min antes.`,
    push: `Lembrete: Consulta amanhã às {{formatDate appointment.date "HH:mm"}}`,
    variables: ['patient', 'appointment', 'clinic'],
    locale: 'pt-BR',
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  'appointment_cancellation': {
    id: 'appointment_cancellation',
    name: 'Cancelamento de Consulta',
    type: 'appointment_cancellation',
    category: 'appointment',
    subject: 'Consulta Cancelada - {{appointment.type}}',
    body: `Olá {{patient.name}},

Informamos que sua consulta foi cancelada.

📅 **Consulta Cancelada:**
• Data: {{formatDate appointment.date "dd/MM/yyyy"}}
• Horário: {{formatDate appointment.date "HH:mm"}}
• Terapeuta: {{appointment.therapist}}
• Motivo: {{cancellation.reason}}

{{#if cancellation.refund}}
💰 O reembolso será processado em até 3 dias úteis.
{{/if}}

Para reagendar, entre em contato conosco.

{{clinic.name}}`,
    whatsapp: `❌ *Consulta Cancelada*

{{patient.name}}, sua consulta de {{formatDate appointment.date "dd/MM HH:mm"}} foi cancelada.

{{#if cancellation.reason}}Motivo: {{cancellation.reason}}{{/if}}

Para reagendar, responda esta mensagem.

{{clinic.name}}`,
    sms: `{{clinic.name}}: Consulta {{formatDate appointment.date "dd/MM HH:mm"}} cancelada. Para reagendar ligue {{clinic.phone}}`,
    push: `Consulta de {{formatDate appointment.date "dd/MM"}} cancelada`,
    variables: ['patient', 'appointment', 'cancellation', 'clinic'],
    locale: 'pt-BR',
    isActive: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * Template Manager - High-level template management
 */
export class TemplateManager {
  private templateEngine: TemplateEngine;
  private templateCache = new Map<string, MessageTemplate>();

  constructor(
    private config: TemplateManagerConfig,
    private repository: CommunicationRepository,
    private configProvider: ConfigurationProvider,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector
  ) {
    this.templateEngine = new TemplateEngine(
      config.engine,
      repository,
      configProvider,
      logger,
      metrics
    );

    this.loadBuiltInTemplates();
  }

  /**
   * Render a template for a specific context
   */
  async renderTemplate(
    criteria: TemplateSelectionCriteria,
    context: TemplateContext,
    options: ContextBuilderOptions = {}
  ): Promise<TemplateRenderResult> {
    const startTime = Date.now();

    try {
      // Find appropriate template
      const template = await this.findTemplate(criteria);

      if (!template) {
        throw new TemplateNotFoundError(
          `No template found for type: ${criteria.type}, channel: ${criteria.channel}`
        );
      }

      // Build enhanced context
      const enhancedContext = await this.buildEnhancedContext(
        context,
        template,
        criteria,
        options
      );

      // Prepare compilation context
      const compilationContext = {
        channel: criteria.channel,
        locale: options.locale || criteria.locale || this.config.fallbackLanguage,
        device: options.device || 'unknown' as const,
        timezone: options.timezone || 'America/Sao_Paulo',
        userAgent: context.userAgent
      };

      // Render template
      const result = await this.templateEngine.renderTemplate(
        template,
        enhancedContext,
        compilationContext
      );

      const duration = Date.now() - startTime;
      this.recordTemplateMetrics(template, criteria.channel, duration, result.success);

      this.logger.debug('Template rendered by manager', {
        templateId: template.id,
        type: criteria.type,
        channel: criteria.channel,
        success: result.success,
        duration
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTemplateMetrics(undefined, criteria.channel, duration, false);

      if (error instanceof TemplateNotFoundError) {
        // Try to render with fallback template
        return this.renderFallbackTemplate(criteria, context, options);
      }

      throw error;
    }
  }

  /**
   * Render template for appointment-related messages
   */
  async renderAppointmentTemplate(
    type: 'confirmation' | 'reminder' | 'cancellation',
    appointment: Appointment,
    patient: Patient,
    channel: CommunicationChannel,
    options: ContextBuilderOptions = {}
  ): Promise<TemplateRenderResult> {
    const templateType = `appointment_${type}` as MessageType;

    const context: TemplateContext = {
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        preferredName: patient.preferredName || patient.name
      },
      appointment: {
        id: appointment.id,
        type: appointment.type,
        date: new Date(appointment.startTime),
        therapist: appointment.therapistName || 'Terapeuta',
        location: appointment.location,
        notes: appointment.observations
      },
      clinic: {
        name: 'DuduFisio - Clínica de Fisioterapia',
        phone: '(11) 1234-5678',
        email: 'contato@dudufisio.com',
        address: 'Rua da Fisioterapia, 123 - São Paulo, SP'
      }
    };

    // Add cancellation context if needed
    if (type === 'cancellation' && options.personalization?.cancellation) {
      context.cancellation = options.personalization.cancellation;
    }

    return this.renderTemplate(
      {
        type: templateType,
        channel,
        context: 'appointment',
        audience: 'patient'
      },
      context,
      options
    );
  }

  /**
   * Find appropriate template based on criteria
   */
  private async findTemplate(criteria: TemplateSelectionCriteria): Promise<MessageTemplate | null> {
    const cacheKey = this.buildTemplateCacheKey(criteria);

    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey)!;
      this.metrics.increment('template_manager.cache.hit');
      return cached;
    }

    this.metrics.increment('template_manager.cache.miss');

    // Try to find in repository
    try {
      const templates = await this.repository.getTemplates({
        type: criteria.type,
        locale: criteria.locale || this.config.fallbackLanguage,
        isActive: true
      });

      if (templates.length > 0) {
        const template = this.selectBestTemplate(templates, criteria);
        this.templateCache.set(cacheKey, template);
        return template;
      }
    } catch (error) {
      this.logger.warn('Failed to load template from repository', {
        error: error instanceof Error ? error.message : String(error),
        criteria
      });
    }

    // Try built-in templates
    const builtInTemplate = BUILT_IN_TEMPLATES[criteria.type];
    if (builtInTemplate) {
      this.templateCache.set(cacheKey, builtInTemplate);
      return builtInTemplate;
    }

    return null;
  }

  /**
   * Select best template from available options
   */
  private selectBestTemplate(templates: MessageTemplate[], criteria: TemplateSelectionCriteria): MessageTemplate {
    // Score templates based on criteria
    const scoredTemplates = templates.map(template => ({
      template,
      score: this.scoreTemplate(template, criteria)
    }));

    // Sort by score (highest first)
    scoredTemplates.sort((a, b) => b.score - a.score);

    return scoredTemplates[0].template;
  }

  /**
   * Score template based on selection criteria
   */
  private scoreTemplate(template: MessageTemplate, criteria: TemplateSelectionCriteria): number {
    let score = 0;

    // Exact type match
    if (template.type === criteria.type) score += 100;

    // Locale match
    if (template.locale === criteria.locale) score += 50;

    // Category match
    if (template.category === criteria.context) score += 30;

    // Channel-specific content exists
    const channelContent = this.getChannelContent(template, criteria.channel);
    if (channelContent && channelContent !== template.body) score += 20;

    // Active template
    if (template.isActive) score += 10;

    // Newer version
    score += template.version || 0;

    return score;
  }

  /**
   * Get channel-specific content from template
   */
  private getChannelContent(template: MessageTemplate, channel: CommunicationChannel): string | undefined {
    switch (channel) {
      case 'whatsapp':
        return template.whatsapp || template.sms || template.text;
      case 'sms':
        return template.sms || template.text;
      case 'email':
        return template.email || template.html;
      case 'push':
        return template.push || template.text;
      default:
        return template.body;
    }
  }

  /**
   * Build enhanced context with additional variables and helpers
   */
  private async buildEnhancedContext(
    baseContext: TemplateContext,
    template: MessageTemplate,
    criteria: TemplateSelectionCriteria,
    options: ContextBuilderOptions
  ): Promise<TemplateContext> {
    const enhancedContext = { ...baseContext };

    // Add personalization data
    if (this.config.enablePersonalization && options.personalization) {
      enhancedContext.personalization = options.personalization;
    }

    // Add experiment data
    if (options.experiment) {
      enhancedContext.experiment = options.experiment;
    }

    // Add clinic information if not present
    if (!enhancedContext.clinic) {
      enhancedContext.clinic = await this.getClinicContext();
    }

    // Add template metadata
    enhancedContext.template = {
      id: template.id,
      name: template.name,
      version: template.version
    };

    // Add request context
    enhancedContext.request = {
      timestamp: new Date(),
      channel: criteria.channel,
      locale: options.locale || criteria.locale || this.config.fallbackLanguage,
      device: options.device || 'unknown'
    };

    return enhancedContext;
  }

  /**
   * Get clinic context from configuration
   */
  private async getClinicContext(): Promise<any> {
    return {
      name: this.configProvider.get('clinic.name', 'DuduFisio - Clínica de Fisioterapia'),
      phone: this.configProvider.get('clinic.phone', '(11) 1234-5678'),
      email: this.configProvider.get('clinic.email', 'contato@dudufisio.com'),
      address: this.configProvider.get('clinic.address', 'São Paulo, SP'),
      website: this.configProvider.get('clinic.website', 'https://dudufisio.com'),
      tagline: this.configProvider.get('clinic.tagline', 'Cuidando da sua saúde e bem-estar')
    };
  }

  /**
   * Render fallback template when main template is not found
   */
  private async renderFallbackTemplate(
    criteria: TemplateSelectionCriteria,
    context: TemplateContext,
    options: ContextBuilderOptions
  ): Promise<TemplateRenderResult> {
    this.logger.warn('Using fallback template', { criteria });

    const fallbackTemplate: MessageTemplate = {
      id: 'fallback',
      name: 'Template Fallback',
      type: 'generic',
      category: 'system',
      subject: 'Notificação - {{clinic.name}}',
      body: `Olá {{#if patient.name}}{{patient.name}}{{else}}{{recipient.name}}{{/if}},

Esta é uma notificação da {{clinic.name}}.

{{#if message}}{{message}}{{else}}Temos uma informação importante para você.{{/if}}

Para mais informações, entre em contato conosco.

Atenciosamente,
{{clinic.name}}`,
      whatsapp: `🏥 *{{clinic.name}}*

Olá {{#if patient.name}}{{patient.name}}{{else}}{{recipient.name}}{{/if}}!

{{#if message}}{{message}}{{else}}Temos uma informação importante para você.{{/if}}

Para mais informações, responda esta mensagem.`,
      sms: `{{clinic.name}}: {{#if message}}{{message}}{{else}}Informacao importante{{/if}}. Contato: {{clinic.phone}}`,
      push: `{{#if message}}{{message}}{{else}}Nova notificação da {{clinic.name}}{{/if}}`,
      variables: ['patient', 'recipient', 'clinic', 'message'],
      locale: 'pt-BR',
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const compilationContext = {
      channel: criteria.channel,
      locale: options.locale || this.config.fallbackLanguage,
      device: options.device || 'unknown' as const,
      timezone: options.timezone || 'America/Sao_Paulo'
    };

    const enhancedContext = await this.buildEnhancedContext(
      context,
      fallbackTemplate,
      criteria,
      options
    );

    const result = await this.templateEngine.renderTemplate(
      fallbackTemplate,
      enhancedContext,
      compilationContext
    );

    this.metrics.increment('template_manager.fallback.used');

    return result;
  }

  /**
   * Load built-in templates into cache
   */
  private loadBuiltInTemplates(): void {
    Object.values(BUILT_IN_TEMPLATES).forEach(template => {
      const cacheKey = this.buildTemplateCacheKey({
        type: template.type,
        channel: 'email', // Default cache key
        locale: template.locale
      });
      this.templateCache.set(cacheKey, template);
    });

    this.logger.info('Built-in templates loaded', {
      count: Object.keys(BUILT_IN_TEMPLATES).length
    });
  }

  /**
   * Build cache key for template
   */
  private buildTemplateCacheKey(criteria: TemplateSelectionCriteria): string {
    return [
      criteria.type,
      criteria.channel,
      criteria.locale || this.config.fallbackLanguage,
      criteria.audience || 'default',
      criteria.context || 'general'
    ].join(':');
  }

  /**
   * Record template metrics
   */
  private recordTemplateMetrics(
    template: MessageTemplate | undefined,
    channel: CommunicationChannel,
    duration: number,
    success: boolean
  ): void {
    this.metrics.timing('template_manager.render_time', duration);
    this.metrics.increment(`template_manager.renders.${success ? 'success' : 'failure'}`);
    this.metrics.increment(`template_manager.channel.${channel}`);

    if (template) {
      this.metrics.increment(`template_manager.template.${template.id}`);
    }
  }

  /**
   * Get template manager statistics
   */
  getStatistics(): {
    cacheSize: number;
    builtInTemplates: number;
    engineStats: any;
  } {
    return {
      cacheSize: this.templateCache.size,
      builtInTemplates: Object.keys(BUILT_IN_TEMPLATES).length,
      engineStats: this.templateEngine.getStatistics()
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.templateEngine.clearCache();
    this.logger.info('Template manager cache cleared');
  }

  /**
   * Register custom template
   */
  async registerTemplate(template: MessageTemplate): Promise<void> {
    try {
      await this.repository.saveTemplate(template);

      // Update cache
      const cacheKey = this.buildTemplateCacheKey({
        type: template.type,
        channel: 'email', // Default
        locale: template.locale
      });
      this.templateCache.set(cacheKey, template);

      this.logger.info('Custom template registered', {
        templateId: template.id,
        type: template.type
      });
    } catch (error) {
      throw new CommunicationError(
        'TEMPLATE_REGISTRATION_FAILED',
        `Failed to register template: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available template types
   */
  getAvailableTemplateTypes(): string[] {
    return Object.keys(BUILT_IN_TEMPLATES);
  }
}

/**
 * Default template manager configuration
 */
export const defaultTemplateManagerConfig: TemplateManagerConfig = {
  engine: {
    cacheEnabled: true,
    cacheSize: 1000,
    cacheTTL: 30 * 60 * 1000, // 30 minutes
    enableHelpers: true,
    enablePartials: true,
    enableI18n: true,
    defaultLocale: 'pt-BR',
    strictMode: false,
    allowUnsafeEval: false
  },
  enableVersioning: true,
  enableA11y: true,
  enablePersonalization: true,
  defaultTemplateSet: 'default',
  fallbackLanguage: 'pt-BR'
};