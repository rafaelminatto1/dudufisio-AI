// Resend Email Communication Channel

import {
  Message,
  DeliveryResult,
  ValidationResult,
  Recipient,
  ChannelCapability
} from '../../../types';
import { BaseChannel, BaseChannelConfig } from './BaseChannel';
import {
  CommunicationError,
  CommunicationRepository,
  ConfigurationProvider,
  CommunicationLogger,
  MetricsCollector,
  RateLimiter
} from '../core/types';
import { ResendService, ResendConfig } from '../../integrations/email/ResendService';

/**
 * Resend Email Channel Configuration
 */
export interface ResendEmailConfig extends BaseChannelConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  maxAttachmentSize: number; // in bytes
  enableTracking: boolean;
  enableBounceHandling: boolean;
  trackingPixelUrl?: string;
  unsubscribeUrl?: string;
}

/**
 * Resend Email Communication Channel
 */
export class ResendEmailChannel extends BaseChannel {
  readonly name = 'resend-email'
  readonly capabilities = [
    ChannelCapability.TEXT,
    ChannelCapability.HTML,
    ChannelCapability.IMAGES,
    ChannelCapability.DOCUMENTS,
    ChannelCapability.RICH_CONTENT,
    ChannelCapability.ATTACHMENTS,
    ChannelCapability.TEMPLATES,
    ChannelCapability.DELIVERY_STATUS,
    ChannelCapability.TRACKING
  ];
  readonly priority = 60; // Medium priority
  readonly maxRetries = 3;

  private resendService: ResendService;

  constructor(
    config: ResendEmailConfig,
    repository: CommunicationRepository,
    configProvider: ConfigurationProvider,
    logger: CommunicationLogger,
    metrics: MetricsCollector,
    rateLimiter?: RateLimiter
  ) {
    super(config, repository, configProvider, logger, metrics, rateLimiter);

    this.initializeResendService();
  }

  /**
   * Initialize Resend service
   */
  private initializeResendService(): void {
    const config = this.config as ResendEmailConfig;
    
    try {
      const resendConfig: ResendConfig = {
        apiKey: config.apiKey,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        enabled: config.enabled,
        maxRetries: this.maxRetries,
        timeout: 30000,
      };

      this.resendService = new ResendService(resendConfig);
      
      this.logger.info('Resend email service initialized', {
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        enabled: config.enabled
      });
    } catch (error) {
      this.logger.error('Failed to initialize Resend service', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Send email message using Resend
   */
  async send(message: Message): Promise<DeliveryResult> {
    const startTime = Date.now();

    try {
      // Validate message
      const validation = this.validateMessage(message);
      if (!validation.valid) {
        throw new CommunicationError('EMAIL_VALIDATION_FAILED', `Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if channel is enabled
      if (!this.isEnabled()) {
        throw new CommunicationError('EMAIL_DISABLED', 'Email channel is disabled');
      }

      // Check rate limit
      const rateLimitOk = await this.checkRateLimit(message.recipient);
      if (!rateLimitOk) {
        throw new CommunicationError('EMAIL_RATE_LIMIT', 'Rate limit exceeded for email', true, 60000);
      }

      const recipient = message.recipient;
      const content = this.prepareMessageContent(message);

      // Send email via Resend
      const result = await this.resendService.sendMessage(message);

      const cost = await this.calculateCost(message);
      const duration = Date.now() - startTime;

      this.recordDeliveryMetrics(result.success, duration, cost);

      if (result.success) {
        this.logger.info('Email sent successfully via Resend', {
          messageId: message.id,
          resendMessageId: result.messageId,
          to: recipient.email,
          subject: content.subject,
          duration,
          cost
        });
      } else {
        this.logger.error('Failed to send email via Resend', {
          messageId: message.id,
          to: recipient.email,
          error: result.error,
          duration
        });
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.recordDeliveryMetrics(false, duration, 0);
      
      this.logger.error('Email sending failed', {
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      return {
        success: false,
        messageId: message.id,
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate email message
   */
  validateMessage(message: Message): ValidationResult {
    const errors: string[] = [];

    if (!message.recipient.email) {
      errors.push('Recipient email is required');
    } else if (!this.isValidEmail(message.recipient.email)) {
      errors.push('Invalid email format');
    }

    if (!message.content.body && !message.content.text) {
      errors.push('Message content is required');
    }

    if (!message.content.subject) {
      errors.push('Message subject is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Prepare message content for email
   */
  private prepareMessageContent(message: Message) {
    return {
      subject: message.content.subject || 'Mensagem do DuduFisio',
      body: message.content.body || message.content.text || '',
      text: message.content.text || this.stripHtml(message.content.body || ''),
    };
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate cost for email
   */
  private async calculateCost(message: Message): Promise<number> {
    // Resend free tier: 100k emails/month
    // Cost per email: ~$0.0001
    return 0.0001;
  }

  /**
   * Test email service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.resendService.testConnection();
    } catch (error) {
      this.logger.error('Email service test failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(recipient: Recipient, name: string): Promise<DeliveryResult> {
    if (!recipient.email) {
      return {
        success: false,
        messageId: 'welcome-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: 'No email address provided'
      };
    }

    try {
      return await this.resendService.sendWelcomeEmail(recipient.email, name);
    } catch (error) {
      return {
        success: false,
        messageId: 'welcome-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    recipient: Recipient,
    appointmentDate: Date,
    patientName: string,
    therapistName: string
  ): Promise<DeliveryResult> {
    if (!recipient.email) {
      return {
        success: false,
        messageId: 'reminder-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: 'No email address provided'
      };
    }

    try {
      return await this.resendService.sendAppointmentReminder(
        recipient.email,
        appointmentDate,
        patientName,
        therapistName
      );
    } catch (error) {
      return {
        success: false,
        messageId: 'reminder-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(recipient: Recipient, resetToken: string): Promise<DeliveryResult> {
    if (!recipient.email) {
      return {
        success: false,
        messageId: 'reset-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: 'No email address provided'
      };
    }

    try {
      return await this.resendService.sendPasswordResetEmail(recipient.email, resetToken);
    } catch (error) {
      return {
        success: false,
        messageId: 'reset-failed',
        channel: 'email',
        deliveredAt: null,
        cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
