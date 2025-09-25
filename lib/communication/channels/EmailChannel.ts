// Email Communication Channel using Nodemailer

import nodemailer from 'nodemailer';
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

/**
 * Email Channel Configuration
 */
export interface EmailConfig extends BaseChannelConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
    };
  };
  from: {
    name: string;
    email: string;
  };
  replyTo?: string;
  maxAttachmentSize: number; // in bytes
  enableTracking: boolean;
  enableBounceHandling: boolean;
  trackingPixelUrl?: string;
  unsubscribeUrl?: string;
}

/**
 * Email Message Options
 */
interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
    cid?: string;
  }>;
  headers?: Record<string, string>;
  messageId?: string;
}

/**
 * Nodemailer Send Response
 */
interface NodemailerResponse {
  messageId: string;
  envelope: {
    from: string;
    to: string[];
  };
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: string;
}

/**
 * Email Communication Channel using Nodemailer
 */
export class EmailChannel extends BaseChannel {
  readonly name = 'email';
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

  private transporter: nodemailer.Transporter;

  constructor(
    config: EmailConfig,
    repository: CommunicationRepository,
    configProvider: ConfigurationProvider,
    logger: CommunicationLogger,
    metrics: MetricsCollector,
    rateLimiter?: RateLimiter
  ) {
    super(config, repository, configProvider, logger, metrics, rateLimiter);

    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter
   */
  private initializeTransporter(): void {
    const config = this.config as EmailConfig;

    if (!config.smtp.host || !config.smtp.auth.user) {
      throw new CommunicationError('EMAIL_CONFIG_MISSING', 'SMTP configuration is required for email channel');
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: config.smtp.auth,
        tls: config.smtp.tls,
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10 // messages per second
      });

      this.logger.info('Email transporter initialized', {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        user: config.smtp.auth.user
      });
    } catch (error) {
      throw new CommunicationError(
        'EMAIL_INIT_FAILED',
        `Failed to initialize email transporter: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send email message
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
      const config = this.config as EmailConfig;
      const content = this.prepareMessageContent(message);

      // Prepare email message
      const emailMessage = await this.prepareEmailMessage(message, content, config);

      // Send email via nodemailer
      const result = await this.transporter.sendMail(emailMessage);

      const cost = await this.calculateCost(message);
      const duration = Date.now() - startTime;

      this.recordDeliveryMetrics(true, duration, cost);

      this.logger.info('Email sent successfully', {
        messageId: message.id,
        emailMessageId: result.messageId,
        to: recipient.email,
        subject: content.subject,
        accepted: result.accepted,
        rejected: result.rejected
      });

      return this.createSuccessResult({
        messageId: message.id,
        externalMessageId: result.messageId,
        deliveredAt: new Date(),
        cost,
        metadata: {
          emailMessageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
          response: result.response,
          envelope: result.envelope,
          provider: 'nodemailer'
        }
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordDeliveryMetrics(false, duration);

      if (error instanceof CommunicationError) {
        return this.handleError(error, { messageId: message.id });
      }

      // Handle nodemailer-specific errors
      return this.handleNodemailerError(error, message.id);
    }
  }

  /**
   * Get delivery status of an email message
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryResult> {
    try {
      // Email delivery status is typically handled via webhooks or bounce handling
      // For SMTP, we don't get real-time delivery status
      // This would be implemented with services like SendGrid, Mailgun, etc.

      return this.createSuccessResult({
        messageId,
        deliveredAt: new Date(),
        metadata: { status: 'sent', note: 'SMTP delivery status not available' }
      });
    } catch (error) {
      return this.handleError(error, { messageId });
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Verify SMTP connection
      const isConnected = await this.transporter.verify();

      this.logger.info('Email connection test result', { connected: isConnected });

      return isConnected;
    } catch (error) {
      this.logger.error('Email connection test failed', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Validate recipient for email channel
   */
  protected async validateRecipientForChannel(recipient: Recipient): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if recipient has email
    if (!recipient.email) {
      errors.push('Email address is required for email channel');
    } else {
      // Validate email format
      if (!this.isValidEmail(recipient.email)) {
        errors.push('Invalid email address format');
      }

      // Check for disposable email domains
      if (this.isDisposableEmail(recipient.email)) {
        warnings.push('Recipient uses a disposable email address');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate message for email channel
   */
  protected validateMessageForChannel(message: Message): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = this.config as EmailConfig;

    // Check subject line
    if (!message.content.subject || message.content.subject.trim().length === 0) {
      warnings.push('Email subject line is empty');
    } else if (message.content.subject.length > 100) {
      warnings.push('Email subject line is very long and may be truncated');
    }

    // Check body content
    if (!message.content.body && !message.content.html) {
      errors.push('Email must have either text or HTML body');
    }

    // Check attachments
    if (message.content.attachments && message.content.attachments.length > 0) {
      let totalSize = 0;

      for (const attachment of message.content.attachments) {
        if (attachment.size) {
          totalSize += attachment.size;
        }

        // Check individual attachment size
        if (attachment.size && attachment.size > config.maxAttachmentSize) {
          errors.push(`Attachment ${attachment.filename} exceeds maximum size limit`);
        }

        // Check for potentially dangerous file types
        if (attachment.filename && this.isDangerousAttachment(attachment.filename)) {
          warnings.push(`Attachment ${attachment.filename} may be blocked by email providers`);
        }
      }

      // Check total attachment size (most email providers limit to 25MB)
      if (totalSize > 25 * 1024 * 1024) {
        warnings.push('Total attachment size is very large and may be rejected');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate additional cost for email
   */
  protected async calculateAdditionalCost(message: Message): Promise<number> {
    let additionalCost = 0;

    // Base email cost (very low for SMTP)
    const baseCost = 0.0001; // $0.0001 per email

    // Additional cost for attachments
    if (message.content.attachments && message.content.attachments.length > 0) {
      const totalSize = message.content.attachments.reduce((sum, att) => sum + (att.size || 0), 0);
      const sizeMB = totalSize / (1024 * 1024);
      additionalCost += sizeMB * 0.0001; // $0.0001 per MB
    }

    // Additional cost for HTML emails (slight increase due to processing)
    if (message.content.html) {
      additionalCost += 0.00005;
    }

    return baseCost + additionalCost;
  }

  /**
   * Prepare email message for nodemailer
   */
  private async prepareEmailMessage(
    message: Message,
    content: { subject?: string; body: string; html?: string; attachments?: any[] },
    config: EmailConfig
  ): Promise<EmailMessage> {
    const recipient = message.recipient;

    const emailMessage: EmailMessage = {
      from: `${config.from.name} <${config.from.email}>`,
      to: recipient.email!,
      subject: content.subject || 'Notification from DuduFisio',
      messageId: this.generateTrackingId(message.id)
    };

    // Add reply-to if configured
    if (config.replyTo) {
      emailMessage.replyTo = config.replyTo;
    }

    // Set text content
    if (content.body) {
      emailMessage.text = content.body;
    }

    // Set HTML content with tracking
    if (content.html) {
      let htmlContent = content.html;

      // Add tracking pixel if enabled
      if (config.enableTracking && config.trackingPixelUrl) {
        const trackingPixel = `<img src="${config.trackingPixelUrl}?msg=${message.id}" width="1" height="1" style="display:none;" />`;
        htmlContent += trackingPixel;
      }

      // Add unsubscribe link if configured
      if (config.unsubscribeUrl) {
        const unsubscribeLink = `<p style="font-size: 12px; color: #666;"><a href="${config.unsubscribeUrl}?recipient=${recipient.id}">Unsubscribe</a></p>`;
        htmlContent += unsubscribeLink;
      }

      emailMessage.html = htmlContent;
    } else if (content.body) {
      // Convert plain text to basic HTML
      emailMessage.html = this.convertTextToHTML(content.body, message, config);
    }

    // Add attachments
    if (content.attachments && content.attachments.length > 0) {
      emailMessage.attachments = content.attachments.map(att => ({
        filename: att.filename || 'attachment',
        path: att.url || att.path,
        contentType: att.type,
        cid: att.cid // for inline images
      }));
    }

    // Add custom headers
    emailMessage.headers = {
      'X-Message-ID': message.id,
      'X-Sender': 'DuduFisio-AI',
      'X-Priority': message.priority ? message.priority.toString() : '3'
    };

    return emailMessage;
  }

  /**
   * Convert plain text to basic HTML
   */
  private convertTextToHTML(text: string, message: Message, config: EmailConfig): string {
    let html = text
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    // Basic HTML template
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${message.content.subject || 'DuduFisio Notification'}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${html}
          </div>
          <div style="margin-top: 20px; padding: 15px; font-size: 12px; color: #666; text-align: center;">
            <p>Esta mensagem foi enviada por DuduFisio - Clínica de Fisioterapia</p>
            ${config.unsubscribeUrl ? `<p><a href="${config.unsubscribeUrl}?recipient=${message.recipient.id}" style="color: #666;">Cancelar inscrição</a></p>` : ''}
          </div>
        </div>
        ${config.enableTracking && config.trackingPixelUrl ? `<img src="${config.trackingPixelUrl}?msg=${message.id}" width="1" height="1" style="display:none;" />` : ''}
      </body>
      </html>
    `;

    return template;
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if email is from a disposable email provider
   */
  private isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'tempmail.org',
      'throwaway.email',
      'temp-mail.org'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  /**
   * Check if attachment filename indicates a dangerous file type
   */
  private isDangerousAttachment(filename: string): boolean {
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js',
      '.jar', '.zip', '.rar', '.7z' // Archives can contain dangerous files
    ];

    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return dangerousExtensions.includes(extension);
  }

  /**
   * Handle nodemailer-specific errors
   */
  private handleNodemailerError(error: unknown, messageId: string): DeliveryResult {
    let communicationError: CommunicationError;

    if (error && typeof error === 'object' && 'code' in error) {
      const nodeError = error as { code: string; command?: string; responseCode?: number; response?: string };

      switch (nodeError.code) {
        case 'EAUTH':
          communicationError = new CommunicationError('EMAIL_AUTH_FAILED', 'SMTP authentication failed', false);
          break;
        case 'ECONNECTION':
          communicationError = new CommunicationError('EMAIL_CONNECTION_FAILED', 'SMTP connection failed', true, 30000);
          break;
        case 'ETIMEDOUT':
          communicationError = new CommunicationError('EMAIL_TIMEOUT', 'SMTP connection timeout', true, 60000);
          break;
        case 'EMESSAGE':
          communicationError = new CommunicationError('EMAIL_MESSAGE_ERROR', 'Invalid message format', false);
          break;
        default:
          communicationError = new CommunicationError(
            'EMAIL_SMTP_ERROR',
            `SMTP error: ${nodeError.code} - ${nodeError.response || 'Unknown error'}`,
            nodeError.responseCode ? nodeError.responseCode >= 500 : true
          );
          break;
      }
    } else {
      communicationError = CommunicationError.fromError(error, 'EMAIL_UNKNOWN_ERROR');
    }

    return this.handleError(communicationError, { messageId });
  }

  /**
   * Process email bounce webhook (to be called by webhook endpoint)
   */
  async processBounceWebhook(bounceData: any): Promise<void> {
    try {
      this.logger.warn('Email bounce received', bounceData);

      // Update recipient opt-out status for hard bounces
      if (bounceData.bounceType === 'Permanent') {
        // Mark recipient as opted out
        // await this.repository.setOptOutStatus(
        //   bounceData.recipientId,
        //   'email',
        //   true,
        //   `Hard bounce: ${bounceData.reason}`
        // );
      }

      this.metrics.increment(`email.bounce.${bounceData.bounceType?.toLowerCase() || 'unknown'}`);
    } catch (error) {
      this.logger.error('Error processing email bounce webhook', error instanceof Error ? error : new Error(String(error)), {
        bounceData
      });
    }
  }

  /**
   * Process email complaint webhook (to be called by webhook endpoint)
   */
  async processComplaintWebhook(complaintData: any): Promise<void> {
    try {
      this.logger.warn('Email complaint received', complaintData);

      // Mark recipient as opted out due to complaint
      // await this.repository.setOptOutStatus(
      //   complaintData.recipientId,
      //   'email',
      //   true,
      //   `Spam complaint: ${complaintData.reason}`
      // );

      this.metrics.increment('email.complaints');
    } catch (error) {
      this.logger.error('Error processing email complaint webhook', error instanceof Error ? error : new Error(String(error)), {
        complaintData
      });
    }
  }
}

/**
 * Default email configuration
 */
export const defaultEmailConfig: EmailConfig = {
  enabled: true,
  maxRetries: 3,
  timeout: 30000,
  rateLimitPerMinute: 100,
  costPerMessage: 0.0001,
  testMode: false,
  smtp: {
    host: '',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  from: {
    name: 'DuduFisio',
    email: 'noreply@dudufisio.com'
  },
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  enableTracking: true,
  enableBounceHandling: true
};