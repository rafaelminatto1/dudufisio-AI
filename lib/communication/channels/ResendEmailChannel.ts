// Resend Email Communication Channel

import {
  Message,
  DeliveryResult,
  ValidationResult,
  Recipient,
  ChannelCapability,
  CommunicationChannel
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

  private resendService!: ResendService;

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
      this.logger.error(
        'Failed to initialize Resend service',
        error instanceof Error ? error : new Error(String(error))
      );
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
        this.logger.error(
          'Failed to send email via Resend',
          result.error as unknown as Error | undefined,
          {
            messageId: message.id,
            to: recipient.email,
            duration
          }
        );
      }

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      this.recordDeliveryMetrics(false, duration, 0);

      this.logger.error(
        'Email sending failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          messageId: message.id,
          duration
        }
      );

      const commError = error instanceof CommunicationError
        ? error
        : new CommunicationError(
            'EMAIL_SEND_FAILED',
            error instanceof Error ? error.message : 'Unknown error',
            true
          );

      return {
        success: false,
        messageId: message.id,
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: commError,
        retryable: true
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
      errors,
      warnings: []
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
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate additional cost for email (override from BaseChannel)
   */
  protected async calculateAdditionalCost(message: Message): Promise<number> {
    // Resend free tier: 100k emails/month
    // Cost per email: ~$0.0001
    // Base cost is handled by BaseChannel.calculateCost
    return 0;
  }

  /**
   * Test email service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.resendService.testConnection();
    } catch (error) {
      this.logger.error(
        'Email service test failed',
        error instanceof Error ? error : new Error(String(error))
      );
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
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: new CommunicationError('NO_EMAIL_ADDRESS', 'No email address provided', false),
        retryable: false
      };
    }

    try {
      return await this.resendService.sendWelcomeEmail(recipient.email, name);
    } catch (error) {
      const commError = error instanceof CommunicationError
        ? error
        : new CommunicationError(
            'WELCOME_EMAIL_FAILED',
            error instanceof Error ? error.message : 'Unknown error',
            true
          );

      return {
        success: false,
        messageId: 'welcome-failed',
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: commError,
        retryable: true
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
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: new CommunicationError('NO_EMAIL_ADDRESS', 'No email address provided', false),
        retryable: false
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
      const commError = error instanceof CommunicationError
        ? error
        : new CommunicationError(
            'REMINDER_EMAIL_FAILED',
            error instanceof Error ? error.message : 'Unknown error',
            true
          );

      return {
        success: false,
        messageId: 'reminder-failed',
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: commError,
        retryable: true
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
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: new CommunicationError('NO_EMAIL_ADDRESS', 'No email address provided', false),
        retryable: false
      };
    }

    try {
      return await this.resendService.sendPasswordResetEmail(recipient.email, resetToken);
    } catch (error) {
      const commError = error instanceof CommunicationError
        ? error
        : new CommunicationError(
            'PASSWORD_RESET_FAILED',
            error instanceof Error ? error.message : 'Unknown error',
            true
          );

      return {
        success: false,
        messageId: 'reset-failed',
        channel: CommunicationChannel.Email,
        deliveredAt: undefined,
        cost: 0,
        error: commError,
        retryable: true
      };
    }
  }

  /**
   * Implement abstract methods from BaseChannel
   */

  async getDeliveryStatus(messageId: string): Promise<DeliveryResult> {
    // Implementation for getting delivery status
    // This would typically query the Resend API for message status
    return {
      success: true,
      messageId,
      channel: CommunicationChannel.Email,
      deliveredAt: new Date(),
      cost: 0,
      retryable: false
    };
  }

  protected validateRecipientForChannel(recipient: Recipient): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!recipient.email) {
      errors.push('Email address is required for email channel');
    } else if (!this.isValidEmail(recipient.email)) {
      errors.push('Invalid email address format');
    }

    return Promise.resolve({
      valid: errors.length === 0,
      errors,
      warnings
    });
  }

  protected validateMessageForChannel(message: Message): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!message.content.subject) {
      warnings.push('Email subject is recommended');
    }

    if (message.content.body && message.content.body.length > 100000) {
      warnings.push('Email body is very large and may be rejected by some providers');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
