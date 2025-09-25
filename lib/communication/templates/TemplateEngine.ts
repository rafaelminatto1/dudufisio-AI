// Advanced Template Engine with Handlebars
// Provides template compilation, caching, and context-aware rendering

import Handlebars from 'handlebars';
import {
  Message,
  MessageTemplate,
  TemplateContext,
  CommunicationChannel
} from '../../../types';
import {
  CommunicationError,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector
} from '../core/types';

/**
 * Template Engine Configuration
 */
export interface TemplateEngineConfig {
  cacheEnabled: boolean;
  cacheSize: number;
  cacheTTL: number; // Time to live in milliseconds
  enableHelpers: boolean;
  enablePartials: boolean;
  enableI18n: boolean;
  defaultLocale: string;
  strictMode: boolean;
  allowUnsafeEval: boolean;
  templateDirectory?: string;
  partialsDirectory?: string;
}

/**
 * Compiled Template Cache Entry
 */
interface TemplateCache {
  compiled: HandlebarsTemplateDelegate;
  originalTemplate: MessageTemplate;
  compiledAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

/**
 * Template Compilation Context
 */
interface TemplateCompilationContext {
  channel: CommunicationChannel;
  locale: string;
  device: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  timezone: string;
  userAgent?: string;
}

/**
 * Template Rendering Result
 */
export interface TemplateRenderResult {
  success: boolean;
  content: {
    subject?: string;
    body: string;
    html?: string;
  };
  metadata: {
    templateId: string;
    compilationTime: number;
    renderTime: number;
    cacheHit: boolean;
    variables: string[];
    partials: string[];
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Advanced Template Engine with Handlebars
 */
export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templateCache = new Map<string, TemplateCache>();
  private partialsCache = new Map<string, HandlebarsTemplateDelegate>();
  private helpersRegistered = false;
  private config: TemplateEngineConfig;

  constructor(
    config: TemplateEngineConfig,
    private repository: CommunicationRepository,
    private configProvider: ConfigurationProvider,
    private logger: CommunicationLogger,
    private metrics: MetricsCollector
  ) {
    this.config = config;
    this.handlebars = Handlebars.create(); // Create isolated instance
    this.initializeEngine();
  }

  /**
   * Initialize the template engine
   */
  private initializeEngine(): void {
    try {
      // Configure Handlebars options
      this.handlebars.registerHelper('log', (message: any) => {
        if (!this.config.strictMode) {
          this.logger.debug('Template log helper', { message });
        }
        return '';
      });

      // Register built-in helpers if enabled
      if (this.config.enableHelpers) {
        this.registerBuiltInHelpers();
      }

      // Load partials if enabled
      if (this.config.enablePartials) {
        this.loadPartials();
      }

      this.logger.info('Template engine initialized', {
        cacheEnabled: this.config.cacheEnabled,
        helpersEnabled: this.config.enableHelpers,
        partialsEnabled: this.config.enablePartials,
        strictMode: this.config.strictMode
      });
    } catch (error) {
      throw new CommunicationError(
        'TEMPLATE_ENGINE_INIT_FAILED',
        `Failed to initialize template engine: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Render a template with given context
   */
  async renderTemplate(
    template: MessageTemplate,
    context: TemplateContext,
    compilationContext: TemplateCompilationContext
  ): Promise<TemplateRenderResult> {
    const startTime = Date.now();
    let compilationTime = 0;
    let cacheHit = false;

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(template, compilationContext);

      // Get compiled template from cache or compile
      let compiledTemplate: HandlebarsTemplateDelegate;
      let cachedEntry = this.templateCache.get(cacheKey);

      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        compiledTemplate = cachedEntry.compiled;
        cachedEntry.accessCount++;
        cachedEntry.lastAccessed = new Date();
        cacheHit = true;
        this.metrics.increment('template_engine.cache.hit');
      } else {
        const compileStart = Date.now();
        compiledTemplate = await this.compileTemplate(template, compilationContext);
        compilationTime = Date.now() - compileStart;

        // Cache the compiled template
        if (this.config.cacheEnabled) {
          this.cacheTemplate(cacheKey, compiledTemplate, template);
        }

        this.metrics.increment('template_engine.cache.miss');
      }

      // Prepare rendering context
      const renderingContext = await this.prepareRenderingContext(context, compilationContext);

      // Render template parts
      const renderStart = Date.now();
      const renderedContent = this.renderTemplateContent(compiledTemplate, template, renderingContext);
      const renderTime = Date.now() - renderStart;

      // Extract metadata
      const metadata = {
        templateId: template.id,
        compilationTime,
        renderTime,
        cacheHit,
        variables: this.extractVariables(template),
        partials: this.extractPartials(template)
      };

      const totalTime = Date.now() - startTime;
      this.recordMetrics(template, totalTime, cacheHit);

      this.logger.debug('Template rendered successfully', {
        templateId: template.id,
        channel: compilationContext.channel,
        totalTime,
        cacheHit
      });

      return {
        success: true,
        content: renderedContent,
        metadata,
        errors: [],
        warnings: []
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      this.recordMetrics(template, totalTime, cacheHit, false);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Template rendering failed', error instanceof Error ? error : new Error(String(error)), {
        templateId: template.id,
        channel: compilationContext.channel
      });

      return {
        success: false,
        content: {
          body: `Template rendering failed: ${errorMessage}`
        },
        metadata: {
          templateId: template.id,
          compilationTime,
          renderTime: Date.now() - startTime,
          cacheHit,
          variables: [],
          partials: []
        },
        errors: [errorMessage]
      };
    }
  }

  /**
   * Compile a template with channel-specific optimizations
   */
  private async compileTemplate(
    template: MessageTemplate,
    context: TemplateCompilationContext
  ): Promise<HandlebarsTemplateDelegate> {
    try {
      // Select appropriate template based on channel
      const templateContent = this.selectTemplateForChannel(template, context.channel);

      // Pre-process template for channel-specific features
      const processedTemplate = this.preprocessTemplate(templateContent, context);

      // Compile with Handlebars
      const compiled = this.handlebars.compile(processedTemplate, {
        strict: this.config.strictMode,
        noEscape: false, // Keep HTML escaping for security
        preventIndent: true
      });

      return compiled;
    } catch (error) {
      throw new CommunicationError(
        'TEMPLATE_COMPILATION_FAILED',
        `Template compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Select appropriate template content based on channel
   */
  private selectTemplateForChannel(template: MessageTemplate, channel: CommunicationChannel): string {
    // Channel-specific template selection logic
    switch (channel) {
      case 'whatsapp':
        return template.whatsapp || template.sms || template.text || template.body;
      case 'sms':
        return template.sms || template.text || template.body;
      case 'email':
        return template.email || template.html || template.body;
      case 'push':
        return template.push || template.text || template.body;
      default:
        return template.body;
    }
  }

  /**
   * Pre-process template for channel-specific features
   */
  private preprocessTemplate(template: string, context: TemplateCompilationContext): string {
    let processed = template;

    // Channel-specific preprocessing
    switch (context.channel) {
      case 'sms':
        // Remove HTML tags for SMS
        processed = processed.replace(/<[^>]*>/g, '');
        // Convert HTML entities
        processed = processed.replace(/&nbsp;/g, ' ');
        processed = processed.replace(/&amp;/g, '&');
        processed = processed.replace(/&lt;/g, '<');
        processed = processed.replace(/&gt;/g, '>');
        break;

      case 'whatsapp':
        // WhatsApp supports basic formatting
        processed = processed.replace(/<b>(.*?)<\/b>/g, '*$1*');
        processed = processed.replace(/<i>(.*?)<\/i>/g, '_$1_');
        processed = processed.replace(/<strike>(.*?)<\/strike>/g, '~$1~');
        processed = processed.replace(/\n/g, '\n'); // Preserve line breaks
        break;

      case 'email':
        // Email supports full HTML
        break;

      case 'push':
        // Push notifications have character limits
        processed = processed.replace(/<[^>]*>/g, ''); // Remove HTML
        break;
    }

    // Add device-specific optimizations
    if (context.device === 'mobile') {
      // Mobile-specific optimizations
      processed = processed.replace(/\s+/g, ' '); // Normalize whitespace
    }

    return processed;
  }

  /**
   * Prepare rendering context with helpers and variables
   */
  private async prepareRenderingContext(
    context: TemplateContext,
    compilationContext: TemplateCompilationContext
  ): Promise<any> {
    const renderingContext = {
      ...context,
      // Add system variables
      system: {
        channel: compilationContext.channel,
        locale: compilationContext.locale,
        timezone: compilationContext.timezone,
        device: compilationContext.device,
        currentDate: new Date(),
        currentTime: new Date().toLocaleTimeString(),
        year: new Date().getFullYear()
      },
      // Add formatting helpers as variables
      format: {
        date: (date: Date, format?: string) => this.formatDate(date, format, compilationContext.locale),
        currency: (amount: number, currency = 'BRL') => this.formatCurrency(amount, currency, compilationContext.locale),
        phone: (phone: string) => this.formatPhone(phone),
        time: (date: Date) => this.formatTime(date, compilationContext.timezone)
      },
      // Add channel-specific variables
      channel: this.getChannelContext(compilationContext.channel)
    };

    return renderingContext;
  }

  /**
   * Render template content (subject, body, HTML)
   */
  private renderTemplateContent(
    compiledTemplate: HandlebarsTemplateDelegate,
    template: MessageTemplate,
    context: any
  ): { subject?: string; body: string; html?: string } {
    const result: { subject?: string; body: string; html?: string } = {
      body: ''
    };

    try {
      // Render main content
      result.body = compiledTemplate(context);

      // Render subject if template has one
      if (template.subject) {
        const subjectTemplate = this.handlebars.compile(template.subject);
        result.subject = subjectTemplate(context);
      }

      // Render HTML version if template has one
      if (template.html) {
        const htmlTemplate = this.handlebars.compile(template.html);
        result.html = htmlTemplate(context);
      }

      return result;
    } catch (error) {
      throw new CommunicationError(
        'TEMPLATE_RENDER_FAILED',
        `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Register built-in Handlebars helpers
   */
  private registerBuiltInHelpers(): void {
    if (this.helpersRegistered) return;

    // Date formatting helper
    this.handlebars.registerHelper('formatDate', (date: Date, format?: string, locale?: string) => {
      return this.formatDate(date, format, locale || this.config.defaultLocale);
    });

    // Currency formatting helper
    this.handlebars.registerHelper('formatCurrency', (amount: number, currency = 'BRL', locale?: string) => {
      return this.formatCurrency(amount, currency, locale || this.config.defaultLocale);
    });

    // Phone formatting helper
    this.handlebars.registerHelper('formatPhone', (phone: string) => {
      return this.formatPhone(phone);
    });

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    this.handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    this.handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    this.handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

    // String helpers
    this.handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase() || '');
    this.handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase() || '');
    this.handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // Array helpers
    this.handlebars.registerHelper('length', (array: any[]) => array?.length || 0);
    this.handlebars.registerHelper('first', (array: any[]) => array?.[0]);
    this.handlebars.registerHelper('last', (array: any[]) => array?.[array.length - 1]);

    // Math helpers
    this.handlebars.registerHelper('add', (a: number, b: number) => (a || 0) + (b || 0));
    this.handlebars.registerHelper('subtract', (a: number, b: number) => (a || 0) - (b || 0));
    this.handlebars.registerHelper('multiply', (a: number, b: number) => (a || 0) * (b || 0));
    this.handlebars.registerHelper('divide', (a: number, b: number) => (b !== 0 ? (a || 0) / b : 0));

    // URL helpers
    this.handlebars.registerHelper('urlEncode', (str: string) => encodeURIComponent(str || ''));
    this.handlebars.registerHelper('urlDecode', (str: string) => decodeURIComponent(str || ''));

    // JSON helper
    this.handlebars.registerHelper('json', (obj: any) => JSON.stringify(obj));

    // Default value helper
    this.handlebars.registerHelper('default', (value: any, defaultValue: any) => value || defaultValue);

    // Channel-specific helpers
    this.handlebars.registerHelper('isChannel', (channel: string, expectedChannel: string) => {
      return channel === expectedChannel;
    });

    this.helpersRegistered = true;
    this.logger.info('Built-in Handlebars helpers registered');
  }

  /**
   * Load template partials
   */
  private async loadPartials(): Promise<void> {
    try {
      // In a full implementation, this would load partials from file system or database
      // For now, register some common partials

      this.handlebars.registerPartial('header', `
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #dee2e6;">
          <h1 style="color: #0066cc; margin: 0;">{{clinicName}}</h1>
          <p style="color: #6c757d; margin: 5px 0 0 0;">{{clinicTagline}}</p>
        </div>
      `);

      this.handlebars.registerPartial('footer', `
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6; margin-top: 30px;">
          <p style="color: #6c757d; margin: 0; font-size: 12px;">
            {{clinicName}} - {{clinicAddress}}<br>
            Telefone: {{clinicPhone}} | Email: {{clinicEmail}}
          </p>
          <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 10px;">
            Esta mensagem foi enviada automaticamente. Por favor, não responda a este email.
          </p>
        </div>
      `);

      this.handlebars.registerPartial('appointmentCard', `
        <div style="background-color: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 10px 0;">
          <h3 style="color: #0066cc; margin: 0 0 10px 0;">{{appointment.type}}</h3>
          <p><strong>Data:</strong> {{formatDate appointment.date "dd/MM/yyyy"}}</p>
          <p><strong>Horário:</strong> {{formatDate appointment.date "HH:mm"}}</p>
          <p><strong>Terapeuta:</strong> {{appointment.therapist}}</p>
          {{#if appointment.location}}
          <p><strong>Local:</strong> {{appointment.location}}</p>
          {{/if}}
          {{#if appointment.notes}}
          <p><strong>Observações:</strong> {{appointment.notes}}</p>
          {{/if}}
        </div>
      `);

      this.logger.info('Template partials loaded');
    } catch (error) {
      this.logger.warn('Failed to load some template partials', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Format date based on locale
   */
  private formatDate(date: Date, format?: string, locale = 'pt-BR'): string {
    if (!date || !(date instanceof Date)) return '';

    try {
      const options: Intl.DateTimeFormatOptions = {};

      switch (format) {
        case 'short':
          options.dateStyle = 'short';
          break;
        case 'medium':
          options.dateStyle = 'medium';
          break;
        case 'long':
          options.dateStyle = 'long';
          break;
        case 'time':
          options.timeStyle = 'short';
          break;
        case 'datetime':
          options.dateStyle = 'short';
          options.timeStyle = 'short';
          break;
        default:
          // Custom format or default
          options.year = 'numeric';
          options.month = '2-digit';
          options.day = '2-digit';
          break;
      }

      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Format currency based on locale
   */
  private formatCurrency(amount: number, currency = 'BRL', locale = 'pt-BR'): string {
    if (typeof amount !== 'number') return '';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Format phone number
   */
  private formatPhone(phone: string): string {
    if (!phone) return '';

    // Brazilian phone number formatting
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }

  /**
   * Format time based on timezone
   */
  private formatTime(date: Date, timezone?: string): string {
    if (!date || !(date instanceof Date)) return '';

    try {
      return new Intl.DateTimeFormat('pt-BR', {
        timeStyle: 'short',
        timeZone: timezone || 'America/Sao_Paulo'
      }).format(date);
    } catch (error) {
      return date.toLocaleTimeString();
    }
  }

  /**
   * Get channel-specific context
   */
  private getChannelContext(channel: CommunicationChannel): any {
    const baseContext = {
      name: channel,
      supportsHtml: false,
      supportsImages: false,
      maxLength: 0
    };

    switch (channel) {
      case 'email':
        return {
          ...baseContext,
          supportsHtml: true,
          supportsImages: true,
          maxLength: 0 // No practical limit
        };
      case 'whatsapp':
        return {
          ...baseContext,
          supportsImages: true,
          maxLength: 4096
        };
      case 'sms':
        return {
          ...baseContext,
          maxLength: 1600
        };
      case 'push':
        return {
          ...baseContext,
          maxLength: 300
        };
      default:
        return baseContext;
    }
  }

  /**
   * Generate cache key for template
   */
  private generateCacheKey(template: MessageTemplate, context: TemplateCompilationContext): string {
    return `${template.id}-${context.channel}-${context.locale}-${context.device}`;
  }

  /**
   * Check if cached template is still valid
   */
  private isCacheValid(cacheEntry: TemplateCache): boolean {
    if (!this.config.cacheEnabled) return false;

    const now = Date.now();
    const cacheAge = now - cacheEntry.compiledAt.getTime();

    return cacheAge < this.config.cacheTTL;
  }

  /**
   * Cache compiled template
   */
  private cacheTemplate(
    key: string,
    compiled: HandlebarsTemplateDelegate,
    original: MessageTemplate
  ): void {
    if (!this.config.cacheEnabled) return;

    // Clean old cache entries if cache is full
    if (this.templateCache.size >= this.config.cacheSize) {
      this.cleanCache();
    }

    this.templateCache.set(key, {
      compiled,
      originalTemplate: original,
      compiledAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date()
    });
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const entries = Array.from(this.templateCache.entries());

    // Sort by last accessed (least recently used first)
    entries.sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Remove oldest 25% of entries
    const removeCount = Math.floor(entries.length * 0.25);
    for (let i = 0; i < removeCount; i++) {
      this.templateCache.delete(entries[i][0]);
    }

    this.logger.debug('Template cache cleaned', {
      removedEntries: removeCount,
      remainingEntries: this.templateCache.size
    });
  }

  /**
   * Extract variables from template
   */
  private extractVariables(template: MessageTemplate): string[] {
    const variables = new Set<string>();
    const content = template.body + (template.subject || '') + (template.html || '');

    // Extract Handlebars variables
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim().split(' ')[0].split('.')[0];
      if (variable && !variable.startsWith('#') && !variable.startsWith('/')) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Extract partials from template
   */
  private extractPartials(template: MessageTemplate): string[] {
    const partials = new Set<string>();
    const content = template.body + (template.subject || '') + (template.html || '');

    // Extract Handlebars partials
    const partialRegex = /\{\{>\s*([^}]+)\}\}/g;
    let match;

    while ((match = partialRegex.exec(content)) !== null) {
      const partial = match[1].trim().split(' ')[0];
      if (partial) {
        partials.add(partial);
      }
    }

    return Array.from(partials);
  }

  /**
   * Record template engine metrics
   */
  private recordMetrics(template: MessageTemplate, duration: number, cacheHit: boolean, success = true): void {
    this.metrics.timing('template_engine.render_time', duration);
    this.metrics.increment(`template_engine.renders.${success ? 'success' : 'failure'}`);

    if (cacheHit) {
      this.metrics.increment('template_engine.cache_hits');
    } else {
      this.metrics.increment('template_engine.cache_misses');
    }

    this.metrics.gauge('template_engine.cache_size', this.templateCache.size);
  }

  /**
   * Get template engine statistics
   */
  getStatistics(): {
    cacheSize: number;
    cacheHitRate: number;
    helpersRegistered: number;
    partialsRegistered: number;
  } {
    const totalCacheEntries = this.templateCache.size;
    const totalAccesses = Array.from(this.templateCache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);

    return {
      cacheSize: totalCacheEntries,
      cacheHitRate: totalAccesses > 0 ? totalCacheEntries / totalAccesses : 0,
      helpersRegistered: Object.keys(this.handlebars.helpers).length,
      partialsRegistered: Object.keys(this.handlebars.partials).length
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.logger.info('Template cache cleared');
  }

  /**
   * Register custom helper
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper);
    this.logger.debug('Custom helper registered', { name });
  }

  /**
   * Register custom partial
   */
  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial);
    this.logger.debug('Custom partial registered', { name });
  }
}

/**
 * Default template engine configuration
 */
export const defaultTemplateEngineConfig: TemplateEngineConfig = {
  cacheEnabled: true,
  cacheSize: 1000,
  cacheTTL: 30 * 60 * 1000, // 30 minutes
  enableHelpers: true,
  enablePartials: true,
  enableI18n: true,
  defaultLocale: 'pt-BR',
  strictMode: false,
  allowUnsafeEval: false
};